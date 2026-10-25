import { IconCheck } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { MenuHoverContext, useMenuHoverScope, useMenuRowRef } from "@/components/dropdown-menu";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { type Size, SizeProvider, useSize } from "@/lib/size";
import { INSTANT, reducedTransition, spring, springExit, tierTween } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, surfaceClasses, useElevation } from "@/lib/surface";
import { holdSelection, TOUCH_GESTURE_CONTENT_CLASS } from "@/lib/touch";
import { cn } from "cn";

type OpenModality = "pointer" | "keyboard" | "touch";
type MenuPoint = { x: number; y: number };

const VIEWPORT_PADDING = 8;
// A spring on a multi-value clip-path snaps when it resolves its last distance.
const CLIP_ENTER = tierTween.moderate;
const LONG_PRESS_DELAY = 520;
const LONG_PRESS_TOLERANCE = 10;

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean, modality?: OpenModality) => void;
  openAt: (point: MenuPoint, modality: OpenModality) => void;
  point: MenuPoint;
  modality: OpenModality;
  invocation: number;
  menuId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  reduce: boolean;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext(component: string) {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(`${component} must be used within <ContextMenu>`);
  }
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function getEnabledItems(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-context-menu-item="true"]:not([data-disabled="true"])',
    ),
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function collapsedClip(origin: MenuPoint, size: { width: number; height: number }) {
  const half = 8;
  const top = clamp(origin.y - half, 0, size.height);
  const right = clamp(size.width - origin.x - half, 0, size.width);
  const bottom = clamp(size.height - origin.y - half, 0, size.height);
  const left = clamp(origin.x - half, 0, size.width);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 10px)`;
}

export interface ContextMenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ContextMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: ContextMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [point, setPoint] = useState<MenuPoint>({ x: 0, y: 0 });
  const [modality, setModality] = useState<OpenModality>("pointer");
  const [invocation, setInvocation] = useState(0);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const reduce = useReducedMotion() ?? false;

  const setOpen = useCallback(
    (next: boolean, nextModality?: OpenModality) => {
      if (nextModality) setModality(nextModality);
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const openAt = useCallback(
    (nextPoint: MenuPoint, nextModality: OpenModality) => {
      setPoint(nextPoint);
      setModality(nextModality);
      setInvocation((current) => current + 1);
      setOpen(true);
    },
    [setOpen],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!contentRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onWindowChange = () => setOpen(false);

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange);
    };
  }, [open, setOpen]);

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      open,
      setOpen,
      openAt,
      point,
      modality,
      invocation,
      menuId,
      triggerRef,
      contentRef,
      reduce,
    }),
    [open, setOpen, openAt, point, modality, invocation, menuId, reduce],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      <div className={cn("contents", className)}>{children}</div>
    </ContextMenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps {
  children: ReactElement<TriggerElementProps>;
  disabled?: boolean;
  className?: string;
}

export function ContextMenuTrigger({
  children,
  disabled = false,
  className,
}: ContextMenuTriggerProps) {
  const context = useContextMenuContext("ContextMenuTrigger");
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchOrigin = useRef<MenuPoint | null>(null);
  const releaseSelection = useRef<(() => void) | null>(null);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchOrigin.current = null;
  }, []);

  // Selection is held for the whole press, not just the timer, so a drag doesn't paint one either.
  const endPress = useCallback(() => {
    cancelLongPress();
    releaseSelection.current?.();
    releaseSelection.current = null;
  }, [cancelLongPress]);

  useEffect(() => endPress, [endPress]);

  if (!isValidElement(children)) {
    throw new Error("<ContextMenuTrigger> requires a single React element");
  }

  const childProps = children.props;
  const childRef = children.props.ref;

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    childProps.onPointerDown?.(event);
    // Pens get no platform `contextmenu`, so they long-press like touch.
    const pressToOpen = event.pointerType === "touch" || event.pointerType === "pen";
    if (event.defaultPrevented || disabled || !pressToOpen) return;

    // `pointer-coarse:select-none` misses touchscreens on mouse-primary laptops, where the
    // platform's long-press selection would cancel ours; block selection for this press only.
    releaseSelection.current?.();
    releaseSelection.current = holdSelection(event.currentTarget);

    const origin = { x: event.clientX, y: event.clientY };
    touchOrigin.current = origin;
    longPressTimer.current = setTimeout(() => {
      context.openAt(origin, "touch");
      longPressTimer.current = null;
      touchOrigin.current = null;
    }, LONG_PRESS_DELAY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    childProps.onPointerMove?.(event);
    const origin = touchOrigin.current;
    if (
      origin &&
      Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > LONG_PRESS_TOLERANCE
    ) {
      cancelLongPress();
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    childProps.onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    context.openAt(
      { x: rect.left + Math.min(24, rect.width / 2), y: rect.top + rect.height / 2 },
      "keyboard",
    );
  };

  return cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      context.triggerRef.current = node;
      assignRef(childRef, node);
    },
    "aria-controls": context.open ? context.menuId : undefined,
    "aria-haspopup": "menu",
    "aria-expanded": context.open,
    // Stops iOS's own long-press callout over our menu; mouse selection and scrolling still work.
    className: cn(TOUCH_GESTURE_CONTENT_CLASS, childProps.className, className),
    onContextMenu: (event: ReactMouseEvent<HTMLElement>) => {
      childProps.onContextMenu?.(event);
      if (event.defaultPrevented || disabled) return;
      event.preventDefault();
      endPress();
      context.openAt({ x: event.clientX, y: event.clientY }, "pointer");
    },
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
      childProps.onPointerUp?.(event);
      endPress();
    },
    onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => {
      childProps.onPointerCancel?.(event);
      endPress();
    },
  });
}

export interface ContextMenuContentProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  size?: Size;
}

export function ContextMenuContent({
  children,
  className,
  ariaLabel = "Context menu",
  size: sizeProp,
}: ContextMenuContentProps) {
  const context = useContextMenuContext("ContextMenuContent");
  const tokens = useSize(sizeProp);
  const surface = useElevation(SURFACE_OFFSET.popover);
  // Keyboard focus moves the highlight via `ContextMenuItem`'s onFocus.
  const hover = useFluidHover(context.contentRef);
  const { registerItem, remeasure, setActiveIndex } = hover;
  const { scope, indexOf } = useMenuHoverScope(registerItem);
  const hoverValue = useMemo(
    () => ({
      ...scope,
      focus: (element: Element) => {
        const index = indexOf(element);
        if (index !== undefined) setActiveIndex(index);
      },
    }),
    [scope, indexOf, setActiveIndex],
  );
  const [fromIndex, setFromIndex] = useState<number | null>(null);
  const findChecked = () => {
    const checked = context.contentRef.current?.querySelector(
      '[role="menuitemradio"][aria-checked="true"]',
    );
    setFromIndex(indexOf(checked ?? null) ?? null);
  };
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPoint>(context.point);
  const [origin, setOrigin] = useState<MenuPoint>({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [morphReady, setMorphReady] = useState(false);
  const typeahead = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!context.open) {
      setMorphReady(false);
      return;
    }
    const content = context.contentRef.current;
    if (!content) return;
    content.dataset.invocation = String(context.invocation);

    const rect = content.getBoundingClientRect();
    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        Math.max(context.point.x, VIEWPORT_PADDING),
        window.innerWidth - rect.width - VIEWPORT_PADDING,
      ),
    );
    const top = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        Math.max(context.point.y, VIEWPORT_PADDING),
        window.innerHeight - rect.height - VIEWPORT_PADDING,
      ),
    );

    setPosition({ x: left, y: top });
    setSize({ width: rect.width, height: rect.height });
    setOrigin({
      x: clamp(context.point.x - left, 12, Math.max(12, rect.width - 12)),
      y: clamp(context.point.y - top, 12, Math.max(12, rect.height - 12)),
    });
    setMorphReady(false);

    if (context.reduce || context.modality === "keyboard") {
      setMorphReady(true);
      return;
    }

    // Paint the collapsed clip once first, or the first open batches both states and skips the morph.
    let openFrame = 0;
    const prepareFrame = requestAnimationFrame(() => {
      openFrame = requestAnimationFrame(() => setMorphReady(true));
    });
    return () => {
      cancelAnimationFrame(prepareFrame);
      cancelAnimationFrame(openFrame);
    };
  }, [
    context.open,
    context.point,
    context.contentRef,
    context.invocation,
    context.modality,
    context.reduce,
  ]);

  // Stays mounted while closed, so remeasure on each open.
  useEffect(() => {
    if (context.open) remeasure();
  }, [context.open, remeasure]);

  useEffect(() => {
    if (!context.open) return;
    const frame = requestAnimationFrame(() => {
      const first = getEnabledItems(context.contentRef.current)[0];
      first?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [context.open, context.contentRef]);

  useEffect(
    () => () => {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    },
    [],
  );

  const moveFocus = (direction: 1 | -1) => {
    const items = getEnabledItems(context.contentRef.current);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = current < 0 ? 0 : (current + direction + items.length) % items.length;
    items[next]?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      context.setOpen(false, "keyboard");
      context.triggerRef.current?.focus();
      return;
    }
    if (event.key === "Tab") {
      context.setOpen(false, "keyboard");
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const items = getEnabledItems(context.contentRef.current);
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead.current += event.key.toLocaleLowerCase();
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => {
        typeahead.current = "";
      }, 500);
      const match = getEnabledItems(context.contentRef.current).find((item) =>
        (item.dataset.label ?? item.textContent ?? "")
          .trim()
          .toLocaleLowerCase()
          .startsWith(typeahead.current),
      );
      match?.focus();
    }
  };

  if (!mounted) return null;

  const visualOpen = context.open && morphReady;
  const clipHidden = collapsedClip(origin, size);
  const clipShown = "inset(0px 0px 0px 0px round 12px)";
  const transition =
    context.modality === "keyboard" || (context.open && !morphReady)
      ? INSTANT
      : context.open
        ? reducedTransition(CLIP_ENTER, context.reduce)
        : springExit.moderate;

  return createPortal(
    <div
      data-context-menu-portal=""
      aria-hidden={!context.open}
      inert={!context.open}
      style={{ left: position.x, top: position.y }}
      // A drop-shadow follows the clip as the menu unclips from the pointer; a box-shadow would sit at full size around it from the first frame.
      className={cn(
        "fixed z-(--z-popup) [filter:var(--surface-drop-filter)]",
        context.open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <motion.div
        ref={context.contentRef}
        id={context.menuId}
        role="menu"
        aria-label={ariaLabel}
        data-morph-ready={morphReady ? "true" : "false"}
        tabIndex={-1}
        initial={false}
        animate={{
          opacity: visualOpen ? 1 : 0,
          clipPath:
            context.reduce || context.modality === "keyboard" || visualOpen
              ? clipShown
              : clipHidden,
        }}
        transition={transition}
        // A no-op onUpdate keeps Motion off WAAPI: a compositor clip-path animation doesn't repaint the parent's drop-shadow until it ends.
        onUpdate={() => {}}
        onKeyDown={onKeyDown}
        onContextMenu={(event) => event.preventDefault()}
        onPointerEnter={(event) => {
          findChecked();
          hover.handlers.onPointerEnter(event);
        }}
        onPointerMove={(event) => hover.handlers.onPointerMove(event)}
        onPointerLeave={(event) => hover.handlers.onPointerLeave(event)}
        onClick={(event) => hover.handlers.onClick(event)}
        className={cn(
          // Shadow comes from the wrapper's drop-shadow.
          "group/menu relative min-w-56 overflow-hidden rounded-xl border border-border p-1.5 text-foreground outline-none",
          surfaceClasses(surface.level, 1),
          className,
        )}
      >
        <ContextMenuHoverContext.Provider value={hoverValue}>
          <MenuHoverContext.Provider value={scope}>
            <SurfaceProvider value={surface.level}>
              <SizeProvider size={tokens.size}>
                <FluidHoverHighlight
                  hover={hover}
                  hidden={!context.open}
                  from={fromIndex === null ? null : hover.itemRects[fromIndex]}
                  className="rounded-lg group-has-[[data-fluid-hover-active][data-tone=destructive]]/menu:bg-destructive/10"
                />
                {children}
              </SizeProvider>
            </SurfaceProvider>
          </MenuHoverContext.Provider>
        </ContextMenuHoverContext.Provider>
      </motion.div>
    </div>,
    document.body,
  );
}

type ContextMenuItemTone = "default" | "destructive";

const ContextMenuHoverContext = createContext<{ focus: (element: Element) => void } | null>(null);

export interface ContextMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
  tone?: ContextMenuItemTone;
  inset?: boolean;
  className?: string;
  textValue?: string;
}

function ContextMenuItemBase({
  children,
  onSelect,
  disabled = false,
  closeOnSelect = true,
  tone = "default",
  inset = false,
  className,
  textValue,
  role = "menuitem",
  ariaChecked,
}: ContextMenuItemProps & {
  role?: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  ariaChecked?: boolean;
}) {
  const context = useContextMenuContext("ContextMenuItem");
  const hover = useContext(ContextMenuHoverContext);
  const size = useSize();
  const rowRef = useMenuRowRef();
  const checkedProps = role === "menuitem" ? {} : { "aria-checked": ariaChecked };

  return (
    <button
      ref={rowRef}
      type="button"
      role={role}
      {...checkedProps}
      disabled={disabled}
      data-context-menu-item="true"
      data-disabled={disabled ? "true" : undefined}
      data-tone={tone}
      data-label={textValue}
      tabIndex={-1}
      onFocus={(event) => hover?.focus(event.currentTarget)}
      onPointerMove={(event) => {
        if (disabled || event.pointerType === "touch") return;
        event.currentTarget.focus();
      }}
      onClick={(event) => {
        if (disabled) return;
        onSelect?.();
        if (closeOnSelect) context.setOpen(false, event.detail === 0 ? "keyboard" : undefined);
      }}
      className={cn(
        "relative flex w-full items-center rounded-lg text-left outline-none select-none",
        size.row,
        size.gap,
        size.text,
        "focus-visible:ring-2 focus-visible:ring-foreground/15",
        "disabled:pointer-events-none disabled:opacity-40",
        inset && "pl-8",
        tone === "destructive" ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ContextMenuItem(props: ContextMenuItemProps) {
  return <ContextMenuItemBase {...props} />;
}

export interface ContextMenuCheckboxItemProps extends Omit<ContextMenuItemProps, "onSelect"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function ContextMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  const context = useContextMenuContext("ContextMenuCheckboxItem");
  return (
    <ContextMenuItemBase
      {...props}
      role="menuitemcheckbox"
      ariaChecked={checked}
      onSelect={() => onCheckedChange?.(!checked)}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <AnimatePresence initial={false}>
          {checked ? (
            <motion.span
              key="check"
              initial={context.reduce ? false : { opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: context.reduce ? 1 : 0.75,
                transition: springExit.fast,
              }}
              transition={reducedTransition(spring.fast, context.reduce)}
            >
              <IconCheck aria-hidden="true" className="h-3.5 w-3.5" stroke={2.4} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      {children}
    </ContextMenuItemBase>
  );
}

interface ContextMenuRadioGroupContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

const ContextMenuRadioGroupContext = createContext<ContextMenuRadioGroupContextValue | null>(null);

export interface ContextMenuRadioGroupProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function ContextMenuRadioGroup({
  value,
  onValueChange,
  children,
  className,
}: ContextMenuRadioGroupProps) {
  const context = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <ContextMenuRadioGroupContext.Provider value={context}>
      <div className={className}>{children}</div>
    </ContextMenuRadioGroupContext.Provider>
  );
}

export interface ContextMenuRadioItemProps extends Omit<ContextMenuItemProps, "onSelect"> {
  value: string;
}

export function ContextMenuRadioItem({ value, children, ...props }: ContextMenuRadioItemProps) {
  const group = useContext(ContextMenuRadioGroupContext);
  if (!group) {
    throw new Error("ContextMenuRadioItem must be used within <ContextMenuRadioGroup>");
  }
  const checked = group.value === value;
  return (
    <ContextMenuItemBase
      {...props}
      role="menuitemradio"
      ariaChecked={checked}
      onSelect={() => group.onValueChange?.(value)}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current transition-opacity duration-(--duration-fast)",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      {children}
    </ContextMenuItemBase>
  );
}

export interface ContextMenuLabelProps {
  children: ReactNode;
  inset?: boolean;
  className?: string;
}

export function ContextMenuLabel({ children, inset = false, className }: ContextMenuLabelProps) {
  const size = useSize();
  return (
    <div
      className={cn(
        "px-2.5 pt-1.5 pb-1 font-medium text-muted-foreground",
        size.type.caption,
        inset && "pl-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ContextMenuSeparatorProps {
  className?: string;
}

export function ContextMenuSeparator({ className }: ContextMenuSeparatorProps) {
  return <hr className={cn("-mx-1 my-1 h-px border-0 bg-border", className)} />;
}

export interface ContextMenuShortcutProps {
  children: ReactNode;
  className?: string;
}

export function ContextMenuShortcut({ children, className }: ContextMenuShortcutProps) {
  const size = useSize();
  return (
    <span
      aria-hidden="true"
      className={cn(
        // eslint-disable-next-line masmeert-ui/no-raw-classes -- key-cap glyphs run together without spacing
        "ml-auto pl-4 tracking-widest text-muted-foreground",
        size.type.caption,
        className,
      )}
    >
      {children}
    </span>
  );
}
