import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { IconChevronDown } from "@tabler/icons-react";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { MenuHoverContext, useMenuHoverScope, useMenuRowRef } from "@/components/dropdown-menu";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type FluidHoverAxis, useFluidHover } from "@/hooks/use-fluid-hover";
import { type Size, SizeProvider, sizeTokens, useSize } from "@/lib/size";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";

function NavigationMenu({
  align = "start",
  size: sizeProp,
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> & {
    size?: Size;
  }) {
  const size = useSize(sizeProp);
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      <SizeProvider size={size.size}>
        {children}
        <NavigationMenuPositioner align={align} />
      </SizeProvider>
    </NavigationMenuPrimitive.Root>
  );
}

// Portalled panel events bubble here through the React tree, so only those inside count.
function useNavHover(axis: FluidHoverAxis) {
  const ref = useRef<HTMLElement | null>(null);
  const hover = useFluidHover(ref, { axis });
  const { registerItem, setActiveIndex, handlers } = hover;
  const { scope, indexOf } = useMenuHoverScope(registerItem);
  const keyboardLit = useRef<number | null>(null);
  const [fromIndex, setFromIndex] = useState<number | null>(null);
  const inside = (event: SyntheticEvent) => ref.current?.contains(event.target as Node) ?? false;

  const events = {
    onPointerEnter(event: PointerEvent) {
      if (!inside(event)) return;
      setFromIndex(indexOf(ref.current?.querySelector("[data-active]") ?? null) ?? null);
      handlers.onPointerEnter(event);
    },
    onPointerMove(event: PointerEvent) {
      if (inside(event)) handlers.onPointerMove(event);
      else handlers.onPointerLeave(event);
    },
    onPointerLeave(event: PointerEvent) {
      handlers.onPointerLeave(event);
    },
    onClick(event: MouseEvent) {
      if (inside(event)) handlers.onClick(event);
    },
    onFocus(event: FocusEvent) {
      if (!inside(event) || !(event.target as Element).matches(":focus-visible")) return;
      const index = indexOf(event.target as Element);
      if (index === undefined) return;
      keyboardLit.current = index;
      setActiveIndex(index);
    },
    onBlur() {
      if (keyboardLit.current === null) return;
      if (hover.activeIndex === keyboardLit.current) setActiveIndex(null);
      keyboardLit.current = null;
    },
  };

  const highlight = (
    <FluidHoverHighlight
      hover={hover}
      from={fromIndex === null ? null : hover.itemRects[fromIndex]}
      className="rounded-lg"
    />
  );
  return { ref, scope, events, highlight };
}

function NavigationMenuList({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  const nav = useNavHover("x");
  const setRef = useCallback(
    (element: HTMLUListElement | null) => {
      nav.ref.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [nav.ref, ref],
  );
  return (
    <NavigationMenuPrimitive.List
      ref={setRef}
      data-slot="navigation-menu-list"
      className={cn(
        "group relative flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...nav.events}
      {...props}
    >
      <MenuHoverContext.Provider value={nav.scope}>
        {nav.highlight}
        {children}
      </MenuHoverContext.Provider>
    </NavigationMenuPrimitive.List>
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

// `data-fluid-row` rows get hover/focus fill from the list's highlight; others keep their own.
const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger relative inline-flex w-max items-center justify-center rounded-lg font-medium transition-[color,background-color,box-shadow] duration-(--duration-fast) outline-none not-data-fluid-row:hover:bg-hover focus-visible:ring-4 focus-visible:ring-ring not-data-fluid-row:focus-visible:bg-hover disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-hover",
  {
    variants: {
      size: {
        compact: [
          sizeTokens("compact").control,
          sizeTokens("compact").controlPx,
          sizeTokens("compact").text,
        ],
        default: [sizeTokens("default").control, "px-4", sizeTokens("default").text],
        large: [
          sizeTokens("large").control,
          sizeTokens("large").controlPx,
          sizeTokens("large").text,
        ],
      },
    },
    defaultVariants: { size: "default" },
  },
);

function NavigationMenuTrigger({
  className,
  children,
  ref,
  ...props
}: NavigationMenuPrimitive.Trigger.Props & { ref?: Ref<HTMLElement> }) {
  const size = useSize();
  const rowRef = useMenuRowRef(ref);
  return (
    <NavigationMenuPrimitive.Trigger
      ref={rowRef}
      data-slot="navigation-menu-trigger"
      data-fluid-row=""
      className={cn(navigationMenuTriggerStyle({ size: size.size }), "group", className)}
      {...props}
    >
      {children}{" "}
      <IconChevronDown
        className="relative top-px ml-1 size-3 transition duration-(--duration-moderate) group-data-popup-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  const surface = useElevation(SURFACE_OFFSET.popover);
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "w-full p-2 pr-2.5 duration-(--duration-moderate) **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:w-auto data-activation-direction:data-open:animate-in data-activation-direction:data-open:fade-in data-open:data-[activation-direction=left]:slide-in-from-left-52 data-open:data-[activation-direction=right]:slide-in-from-right-52 data-closed:fill-mode-forwards data-activation-direction:data-closed:animate-out data-activation-direction:data-closed:fade-out data-closed:data-[activation-direction=left]:slide-out-to-right-52 data-closed:data-[activation-direction=right]:slide-out-to-left-52",
        className,
      )}
      {...props}
    >
      <SurfaceProvider value={surface.level}>
        <NavigationMenuPanelLinks>{children}</NavigationMenuPanelLinks>
      </SurfaceProvider>
    </NavigationMenuPrimitive.Content>
  );
}

function NavigationMenuPanelLinks({ children }: { children: ReactNode }) {
  const nav = useNavHover("xy");
  return (
    <div ref={nav.ref as Ref<HTMLDivElement>} className="relative" {...nav.events}>
      <MenuHoverContext.Provider value={nav.scope}>
        {nav.highlight}
        {children}
      </MenuHoverContext.Provider>
    </div>
  );
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  const surface = useElevation(SURFACE_OFFSET.popover, { shadowLevel: 4 });
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-(--z-popup) h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-(--duration-slow) ease-out data-instant:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0",
          className,
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          className={cn(
            "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden rounded-xl text-popover-foreground outline-none",
            surface.className,
            "transition-[width,height] duration-(--duration-slow) ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90 data-closed:animate-out data-closed:duration-(--duration-exit-slow) data-closed:ease-(--ease-exit) data-closed:fade-out-0 data-closed:fill-mode-forwards data-closed:zoom-out-95",
          )}
        >
          <NavigationMenuViewport />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

function NavigationMenuViewport({ className, ...props }: NavigationMenuPrimitive.Viewport.Props) {
  return (
    <NavigationMenuPrimitive.Viewport
      data-slot="navigation-menu-viewport"
      className={cn("relative size-full overflow-hidden", className)}
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  ref,
  ...props
}: NavigationMenuPrimitive.Link.Props & { ref?: Ref<HTMLElement> }) {
  const size = useSize();
  const rowRef = useMenuRowRef(ref);
  return (
    <NavigationMenuPrimitive.Link
      ref={rowRef}
      data-slot="navigation-menu-link"
      data-fluid-row=""
      className={cn(
        "relative flex flex-col gap-1 rounded-lg p-2 transition-[color,background-color,box-shadow] duration-(--duration-fast) outline-none not-data-fluid-row:hover:bg-hover not-data-fluid-row:focus:bg-hover focus-visible:ring-4 focus-visible:ring-ring data-active:bg-selected [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        size.text,
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Icon>) {
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden duration-(--duration-fast) data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border" />
    </NavigationMenuPrimitive.Icon>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
  NavigationMenuViewport,
};
