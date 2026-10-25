import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import {
  cloneElement,
  createContext,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
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
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { usePopoverPortalPosition } from "@/lib/popover-position";
import { spring, springExit, tierTween } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, surfaceClasses, useElevation } from "@/lib/surface";
import { cn } from "cn";

/** "right" opens a flyout beside its trigger, flipping left without room. */
type Side = "top" | "bottom" | "right";
type Align = "start" | "end";

type MorphContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  triggerId: string;
  contentId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  registerTrigger: (node: HTMLElement | null) => void;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const MorphContext = createContext<MorphContextValue | null>(null);

function useMorphContext(component: string) {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error(`${component} must be used within <MorphingPopover>`);
  return ctx;
}

export interface MorphingPopoverProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** A popover whose panel unclips from the corner nearest the trigger. */
export function MorphingPopover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: MorphingPopoverProps) {
  const baseId = useId();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );
  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);

  // The root stands in as anchor when no trigger registered (e.g. a Tooltip cloned it first),
  // else the panel has nothing to measure and stays invisible. State, so a late trigger re-anchors.
  const anchorRef = useMemo<React.MutableRefObject<HTMLElement | null>>(
    () => ({ current: trigger ?? root }),
    [root, trigger],
  );

  // The panel goes inert on close, so return focus to the trigger (or a focusable root) if stranded inside.
  const close = useCallback(() => {
    setOpen(false);
    const focused = document.activeElement;
    const inPanel = focused instanceof HTMLElement && contentRef.current?.contains(focused);
    if (!inPanel) return;
    const restore = trigger ?? (root && root.tabIndex >= 0 ? root : null);
    restore?.focus();
  }, [root, setOpen, trigger]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      // A flyout portals out of its parent panel; a click in it isn't outside.
      if (target instanceof Element && target.closest("[data-morph-popover-portal]")) return;
      if (root && !root.contains(target) && !contentRef.current?.contains(target)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, root, close]);

  const ctx = useMemo<MorphContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      triggerId: `${baseId}-trigger`,
      contentId: `${baseId}-content`,
      triggerRef: anchorRef,
      registerTrigger: setTrigger,
      contentRef,
    }),
    [open, setOpen, toggle, baseId, anchorRef],
  );

  return (
    <MorphContext.Provider value={ctx}>
      <div ref={setRoot} className={cn("relative inline-flex", className)}>
        {children}
      </div>
    </MorphContext.Provider>
  );
}

export interface MorphingPopoverTriggerProps {
  children: ReactElement;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object")
        (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export function MorphingPopoverTrigger({ children }: MorphingPopoverTriggerProps) {
  const ctx = useMorphContext("MorphingPopoverTrigger");
  if (!isValidElement<React.HTMLProps<HTMLElement>>(children)) return children;

  const childProps = children.props;

  return cloneElement(children, {
    id: ctx.triggerId,
    ref: mergeRefs(childProps.ref, ctx.registerTrigger),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      childProps.onClick?.(event);
      ctx.toggle();
    },
    "aria-haspopup": "dialog",
    "aria-expanded": ctx.open,
    "aria-controls": ctx.open ? ctx.contentId : undefined,
  });
}

const originFor = (side: Exclude<Side, "right">, align: Align) =>
  `${side === "bottom" ? "top" : "bottom"} ${align === "end" ? "right" : "left"}`;

function clipHidden(side: Exclude<Side, "right">, align: Align, radius: number) {
  const top = side === "bottom" ? "0%" : "92%";
  const bottom = side === "bottom" ? "92%" : "0%";
  const right = align === "end" ? "0%" : "92%";
  const left = align === "end" ? "92%" : "0%";
  return `inset(${top} ${right} ${bottom} ${left} round ${radius}px)`;
}
const clipShown = (radius: number) => `inset(0% 0% 0% 0% round ${radius}px)`;

// Clip is a tween: a spring on a multi-value clip-path snaps when it resolves its last distance.
const MORPH_ENTER = spring.slow;
const MORPH_EXIT = springExit.slow;
const CLIP_ENTER = tierTween.slow;
const { type: _spring, ...SIZE_SPRING } = spring.moderate;

export interface MorphingPopoverContentProps {
  children: ReactNode;
  side?: Side;
  align?: Align;
  /** In px. Default 8. */
  sideOffset?: number;
  /** In px. Default 16. */
  radius?: number;
  instant?: boolean;
  className?: string;
}

export function MorphingPopoverContent({
  children,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  radius = 16,
  instant = false,
  className,
}: MorphingPopoverContentProps) {
  const ctx = useMorphContext("MorphingPopoverContent");
  const reduce = useReducedMotion() ?? false;
  const surface = useElevation(SURFACE_OFFSET.popover);
  const [portalReady, setPortalReady] = useState(false);
  // Natural content size; the panel box springs to it.
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const layout = usePopoverPortalPosition(ctx.triggerRef, bodyRef, portalReady && ctx.open);

  useEffect(() => setPortalReady(true), []);

  const width = useSpring(0, SIZE_SPRING);
  const height = useSpring(0, SIZE_SPRING);
  // Sizes before the first frame are the opening size, not a change: the last open's layout lingers.
  const settled = useRef(false);
  useLayoutEffect(() => {
    if (!ctx.open) return;
    settled.current = false;
    const frame = requestAnimationFrame(() => (settled.current = true));
    return () => cancelAnimationFrame(frame);
  }, [ctx.open]);
  useLayoutEffect(() => {
    if (!layout || !ctx.open) return;
    const animate = settled.current && !reduce;
    for (const [value, target] of [
      [width, layout.content.width],
      [height, layout.content.height],
    ] as const)
      if (animate) value.set(target);
      else value.jump(target);
  }, [layout, ctx.open, reduce, width, height]);

  // Anchor the edges nearest the trigger so a size change grows away from it without a re-measure.
  const VIEWPORT_MARGIN = 8;
  const viewport = document.documentElement;
  // The measured body sits inside the panel's 1px border.
  const panelWidth = layout ? layout.content.width + 2 : 0;
  const panelHeight = layout ? layout.content.height + 2 : 0;
  const flyoutLeft = layout ? layout.trigger.left + layout.trigger.width + sideOffset : 0;
  const flipped =
    side === "right" && flyoutLeft + panelWidth + VIEWPORT_MARGIN > viewport.clientWidth;
  const growSide = side === "right" ? "bottom" : side;
  const growAlign = side === "right" ? (flipped ? "end" : "start") : align;
  const horizontal = !layout
    ? { left: 0 }
    : side === "right"
      ? flipped
        ? { right: viewport.clientWidth - layout.trigger.left + sideOffset }
        : { left: flyoutLeft }
      : align === "end"
        ? {
            right: Math.min(
              viewport.clientWidth - panelWidth - VIEWPORT_MARGIN,
              Math.max(
                VIEWPORT_MARGIN,
                viewport.clientWidth - layout.trigger.left - layout.trigger.width,
              ),
            ),
          }
        : {
            left: Math.max(
              VIEWPORT_MARGIN,
              Math.min(layout.trigger.left, viewport.clientWidth - panelWidth - VIEWPORT_MARGIN),
            ),
          };
  const vertical = !layout
    ? { top: 0 }
    : side === "right"
      ? {
          top: Math.max(
            VIEWPORT_MARGIN,
            Math.min(layout.trigger.top, viewport.clientHeight - panelHeight - VIEWPORT_MARGIN),
          ),
        }
      : side === "bottom"
        ? { top: layout.trigger.top + layout.trigger.height + sideOffset }
        : { bottom: viewport.clientHeight - layout.trigger.top + sideOffset };

  const wrap = reduce
    ? undefined
    : {
        hidden: { opacity: 0, transform: "scale(0.96)", transition: MORPH_EXIT },
        show: { opacity: 1, transform: "scale(1)", transition: MORPH_ENTER },
      };
  const clip = reduce
    ? undefined
    : {
        hidden: {
          clipPath: clipHidden(growSide, growAlign, radius),
          transition: MORPH_EXIT,
        },
        show: {
          clipPath: clipShown(radius),
          transition: CLIP_ENTER,
        },
      };

  // Portal after hydration to match the server render.
  if (!portalReady) return null;

  return createPortal(
    <AnimatePresence>
      {ctx.open ? (
        <motion.div
          data-morph-popover-portal=""
          // drop-shadow hugs the clipped shape; a box-shadow would be clipped away.
          variants={wrap}
          initial={instant ? false : reduce ? { opacity: 0 } : "hidden"}
          animate={reduce ? { opacity: 1 } : "show"}
          exit={reduce ? { opacity: 0 } : "hidden"}
          transition={reduce ? spring.fast : undefined}
          style={{
            ...horizontal,
            ...vertical,
            visibility: layout ? "visible" : "hidden",
            transformOrigin: originFor(growSide, growAlign),
          }}
          // Electron hit-tests `app-region: drag` regardless of stacking, so a panel over a drag area would lose its clicks.
          className="fixed z-(--z-popup) [filter:var(--surface-drop-filter)] [-webkit-app-region:no-drag]"
        >
          <motion.div
            ref={ctx.contentRef}
            id={ctx.contentId}
            role="dialog"
            aria-labelledby={ctx.triggerId}
            variants={clip}
            // A no-op onUpdate keeps Motion off WAAPI: a compositor clip-path animation doesn't repaint the parent's drop-shadow until it ends.
            onUpdate={() => {}}
            style={{
              borderRadius: radius,
              width: layout ? width : undefined,
              height: layout ? height : undefined,
            }}
            // Shadow comes from the wrapper's drop-shadow.
            className={cn(
              "box-content overflow-hidden border border-border",
              surfaceClasses(surface.level, 1),
            )}
          >
            <div ref={bodyRef} className={cn("w-max", className)}>
              <SurfaceProvider value={surface.level}>{children}</SurfaceProvider>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export interface MorphingPopoverMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Every direct child is a clickable item in one fluid hover list. */
export function MorphingPopoverMenu({
  className,
  children,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  onFocus,
  onBlur,
  ...props
}: MorphingPopoverMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(ref);
  const { registerItem, setActiveIndex, handlers } = hover;
  const items = useRef<HTMLElement[]>([]);
  const keyboardLit = useRef<number | null>(null);

  useLayoutEffect(() => {
    const found = Array.from(
      ref.current?.querySelectorAll<HTMLElement>(
        ":scope > :not([data-slot='fluid-hover-highlight'])",
      ) ?? [],
    );
    items.current = found;
    found.forEach((element, index) => registerItem(index, element));
    return () => found.forEach((_, index) => registerItem(index, null));
  }, [children, registerItem]);

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        "relative flex flex-col gap-0.5 [&>:not([data-slot=fluid-hover-highlight])]:relative",
        className,
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        handlers.onPointerEnter(event);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        handlers.onPointerMove(event);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        handlers.onPointerLeave(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        handlers.onClick(event);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!(event.target as Element).matches(":focus-visible")) return;
        const index = items.current.indexOf(event.target as HTMLElement);
        if (index < 0) return;
        keyboardLit.current = index;
        setActiveIndex(index);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (keyboardLit.current === null) return;
        if (hover.activeIndex === keyboardLit.current) setActiveIndex(null);
        keyboardLit.current = null;
      }}
      {...props}
    >
      <FluidHoverHighlight hover={hover} className="rounded-lg" />
      {children}
    </div>
  );
}
