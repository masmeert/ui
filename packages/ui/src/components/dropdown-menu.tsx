import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "cn";
import { ChevronRightIcon, CheckIcon } from "lucide-react";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type FluidHover, useFluidHover } from "@/hooks/use-fluid-hover";
import { type Size, SizeProvider, useSize } from "@/lib/size";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";

/** One fluid hover list per popup: Base UI's roving focus crosses separators, so the highlight must too. */
type MenuHoverScope = { register: (element: HTMLElement) => () => void };

const MenuHoverContext = React.createContext<MenuHoverScope | null>(null);

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

// Base UI merges refs the pre-19 way (calling with null), so track registration instead of returning a ref cleanup.
function useMenuRowRef(forwarded?: React.Ref<HTMLElement>) {
  const scope = React.useContext(MenuHoverContext);
  const registration = React.useRef<(() => void) | null>(null);
  return React.useCallback(
    (element: HTMLElement | null) => {
      assignRef(forwarded, element);
      registration.current?.();
      registration.current = element && scope ? scope.register(element) : null;
    },
    [forwarded, scope],
  );
}

/** Stable per-element fluid hover indices for rows that are arbitrary children. @internal Shared with the menubar. */
function useMenuHoverScope(registerItem: FluidHover["registerItem"]) {
  const indices = React.useRef(new WeakMap<HTMLElement, number>());
  const live = React.useRef(new Map<number, HTMLElement>());
  const nextIndex = React.useRef(0);
  const scope = React.useMemo<MenuHoverScope>(
    () => ({
      register(element) {
        let index = indices.current.get(element);
        if (index === undefined) {
          index = nextIndex.current++;
          indices.current.set(element, index);
        }
        const registered = index;
        live.current.set(registered, element);
        registerItem(registered, element);
        return () => {
          if (live.current.get(registered) === element) live.current.delete(registered);
          registerItem(registered, null);
        };
      },
    }),
    [registerItem],
  );
  const indexOf = React.useCallback((element: Element | null) => {
    if (!(element instanceof HTMLElement)) return undefined;
    const index = indices.current.get(element);
    return index !== undefined && live.current.get(index) === element ? index : undefined;
  }, []);
  return { scope, indexOf };
}

function menuRowClass(size: ReturnType<typeof useSize>) {
  return cn(
    "relative flex items-center rounded-lg outline-hidden select-none data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    size.row,
    size.gap,
    size.text,
    size.iconClass,
  );
}

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

type PopupProps = MenuPrimitive.Popup.Props & { ref?: React.Ref<HTMLDivElement> };

function DropdownMenuContent({
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  collisionPadding,
  ...props
}: PopupProps &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"
  > & {
    /** Submenus inherit it. */
    size?: Size;
  }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-(--z-popup) outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
      >
        <DropdownMenuPopup {...props} />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

// Separate component so the hook mounts with the popup and its observers find the element.
function DropdownMenuPopup({
  size: sizeProp,
  className,
  children,
  ref,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  ...props
}: PopupProps & { size?: Size }) {
  const size = useSize(sizeProp);
  const surface = useElevation(SURFACE_OFFSET.popover, { shadowLevel: 4 });
  const popupRef = React.useRef<HTMLDivElement | null>(null);
  const hover = useFluidHover(popupRef);
  const { registerItem, setActiveIndex, remeasure, handlers } = hover;

  const { scope, indexOf } = useMenuHoverScope(registerItem);

  // A fresh pointer entry fades in from the checked radio row, showing where the value sits.
  const [fromIndex, setFromIndex] = React.useState<number | null>(null);
  const findChecked = React.useCallback(() => {
    const checked = popupRef.current?.querySelector('[role="menuitemradio"][data-checked]');
    setFromIndex(indexOf(checked ?? null) ?? null);
  }, [indexOf]);

  // Follows Base UI's `data-highlighted` for keyboard. `data-open` is watched because a
  // popup reopened mid-exit keeps its instance and must remeasure.
  React.useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
    const sync = (element: Element | null) => {
      if (!element?.matches("[data-highlighted]:not([data-disabled])")) return;
      const index = indexOf(element);
      if (index !== undefined) setActiveIndex(index);
    };
    sync(popup.querySelector("[data-highlighted]"));
    findChecked();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.target === popup) {
          if (popup.hasAttribute("data-open")) remeasure();
        } else sync(record.target as Element);
      }
    });
    observer.observe(popup, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-highlighted", "data-open"],
    });
    return () => observer.disconnect();
  }, [findChecked, indexOf, remeasure, setActiveIndex]);

  // Submenu events bubble here through the React tree (portalled); ignore those outside this popup.
  const setPopupRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      popupRef.current = element;
      assignRef(ref, element);
    },
    [ref],
  );
  const inside = (event: React.SyntheticEvent) =>
    popupRef.current?.contains(event.target as Node) ?? false;

  return (
    <MenuPrimitive.Popup
      data-slot="dropdown-menu-content"
      ref={setPopupRef}
      className={cn(
        "group/menu relative flex max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) flex-col gap-0.5 overflow-x-hidden overflow-y-auto rounded-xl border p-1.5 text-popover-foreground outline-hidden",
        surface.className,
        "duration-(--duration-moderate) data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:duration-(--duration-exit-moderate) data-closed:ease-(--ease-exit) data-closed:fade-out-0 data-closed:fill-mode-forwards data-closed:zoom-out-95",
        className,
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!inside(event)) return;
        findChecked();
        handlers.onPointerEnter(event);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (inside(event)) handlers.onPointerMove(event);
        else handlers.onPointerLeave(event);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        handlers.onPointerLeave(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (inside(event)) handlers.onClick(event);
      }}
      {...props}
    >
      <MenuHoverContext.Provider value={scope}>
        <SurfaceProvider value={surface.level}>
          <SizeProvider size={size.size}>
            <FluidHoverHighlight
              hover={hover}
              from={fromIndex === null ? null : hover.itemRects[fromIndex]}
              className="rounded-lg group-has-[[data-fluid-hover-active][data-variant=destructive]]/menu:bg-destructive/10 dark:group-has-[[data-fluid-hover-active][data-variant=destructive]]/menu:bg-destructive/20"
            />
            {children}
          </SizeProvider>
        </SurfaceProvider>
      </MenuHoverContext.Provider>
    </MenuPrimitive.Popup>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  const size = useSize();
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2.5 pt-1.5 pb-1 font-medium text-muted-foreground data-inset:pl-8",
        size.type.caption,
        className,
      )}
      {...props}
    />
  );
}

type RowRefProp = { ref?: React.Ref<HTMLElement> };

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ref,
  ...props
}: MenuPrimitive.Item.Props &
  RowRefProp & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }) {
  const size = useSize();
  const rowRef = useMenuRowRef(ref);
  return (
    <MenuPrimitive.Item
      ref={rowRef}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        menuRowClass(size),
        "data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ref,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props &
  RowRefProp & {
    inset?: boolean;
  }) {
  const size = useSize();
  const rowRef = useMenuRowRef(ref);
  return (
    <MenuPrimitive.SubmenuTrigger
      ref={rowRef}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        menuRowClass(size),
        // The fluid highlight has left for the submenu; this fill marks its owner row.
        "data-popup-open:bg-hover [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -7,
  side = "right",
  sideOffset = 11,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ref,
  ...props
}: MenuPrimitive.CheckboxItem.Props &
  RowRefProp & {
    inset?: boolean;
  }) {
  const size = useSize();
  const rowRef = useMenuRowRef(ref);
  return (
    <MenuPrimitive.CheckboxItem
      ref={rowRef}
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        menuRowClass(size),
        "pr-8 data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2.5 flex size-3.5 items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ref,
  ...props
}: MenuPrimitive.RadioItem.Props &
  RowRefProp & {
    inset?: boolean;
  }) {
  const size = useSize();
  const rowRef = useMenuRowRef(ref);
  return (
    <MenuPrimitive.RadioItem
      ref={rowRef}
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        menuRowClass(size),
        "pr-8 data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2.5 flex size-3.5 items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1 h-px shrink-0 bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, children, ...props }: React.ComponentProps<"span">) {
  const size = useSize();
  // Fixed-width key column so modifiers line up across items. `.*` makes the match infallible.
  const [, modifiers, key] =
    typeof children === "string" ? /^((?:Ctrl\+|[⌘⇧⌥⌃])*)(.*)$/.exec(children)! : [];
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        // Deliberate letter-spacing exception: ⌘⇧⌥ glyphs run together without it.
        "ml-auto tracking-widest text-muted-foreground",
        size.type.caption,
        className,
      )}
      {...props}
    >
      {key === undefined ? (
        children
      ) : (
        <>
          {modifiers}
          <span className="inline-block min-w-[1.25em]">{key}</span>
        </>
      )}
    </span>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  /** @internal Fluid hover plumbing shared with the menubar. */
  MenuHoverContext,
  useMenuHoverScope,
  useMenuRowRef,
};
