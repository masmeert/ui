import * as React from "react";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import { cn } from "cn";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuHoverContext,
  useMenuHoverScope,
  useMenuRowRef,
} from "@/components/dropdown-menu";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { type Size, SizeProvider, useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";

function Menubar({
  className,
  size: sizeProp,
  children,
  ref,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  onFocus,
  onBlur,
  ...props
}: MenubarPrimitive.Props & {
  ref?: React.Ref<HTMLDivElement>;
  /** The menus' rows follow it. */
  size?: Size;
}) {
  const size = useSize(sizeProp);
  const barRef = React.useRef<HTMLDivElement | null>(null);
  // The open menu's pill (in each trigger) is a separate layer from this hover highlight.
  const hover = useFluidHover(barRef, { axis: "x" });
  const { registerItem, setActiveIndex, handlers } = hover;
  const { scope, indexOf } = useMenuHoverScope(registerItem);
  const keyboardLit = React.useRef<number | null>(null);

  const setBarRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      barRef.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [ref],
  );
  // Portalled menus' events bubble here through the React tree; ignore those outside the bar.
  const inside = (event: React.SyntheticEvent) =>
    barRef.current?.contains(event.target as Node) ?? false;

  return (
    <LayoutGroup id={React.useId()}>
      <MenubarPrimitive
        ref={setBarRef}
        data-slot="menubar"
        className={cn(
          "relative inline-flex items-center gap-1 rounded-full bg-card",
          size.segmentPad,
          className,
        )}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (inside(event)) handlers.onPointerEnter(event);
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
        onFocus={(event) => {
          onFocus?.(event);
          if (!inside(event) || !(event.target as Element).matches(":focus-visible")) return;
          const index = indexOf(event.target as Element);
          if (index === undefined) return;
          keyboardLit.current = index;
          setActiveIndex(index);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (keyboardLit.current === null || indexOf(event.target as Element) === undefined)
            return;
          if (hover.activeIndex === keyboardLit.current) setActiveIndex(null);
          keyboardLit.current = null;
        }}
        {...props}
      >
        <MenuHoverContext.Provider value={scope}>
          <SizeProvider size={size.size}>
            <FluidHoverHighlight hover={hover} className="rounded-full" />
            {children}
          </SizeProvider>
        </MenuHoverContext.Provider>
      </MenubarPrimitive>
    </LayoutGroup>
  );
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />;
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />;
}

function MenubarTrigger({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger> & { ref?: React.Ref<HTMLElement> }) {
  const reduce = useReducedMotion();
  const size = useSize();
  const triggerRef = useMenuRowRef(ref);
  return (
    <DropdownMenuTrigger
      ref={triggerRef}
      data-slot="menubar-trigger"
      className={cn(
        "relative inline-flex items-center rounded-full px-3.5 font-medium whitespace-nowrap text-muted-foreground outline-hidden transition-colors duration-(--duration-fast) select-none hover:text-foreground focus-visible:text-foreground data-popup-open:text-foreground",
        size.segmentItem,
        size.text,
        className,
      )}
      render={(triggerProps, state) => (
        <button {...triggerProps}>
          {state.open ? (
            <motion.span
              layoutId="menubar-highlight"
              transition={reducedTransition(spring.moderate, reduce)}
              style={{ borderRadius: 9999 }}
              className="absolute inset-0 bg-selected"
            />
          ) : null}
          <span className="relative z-10">{triggerProps.children}</span>
        </button>
      )}
      {...props}
    />
  );
}

function MenubarContent({
  align = "start",
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function MenubarItem({ ...props }: React.ComponentProps<typeof DropdownMenuItem>) {
  return <DropdownMenuItem data-slot="menubar-item" {...props} />;
}

function MenubarCheckboxItem({ ...props }: React.ComponentProps<typeof DropdownMenuCheckboxItem>) {
  return <DropdownMenuCheckboxItem data-slot="menubar-checkbox-item" {...props} />;
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarRadioItem({ ...props }: React.ComponentProps<typeof DropdownMenuRadioItem>) {
  return <DropdownMenuRadioItem data-slot="menubar-radio-item" {...props} />;
}

function MenubarLabel({ ...props }: React.ComponentProps<typeof DropdownMenuLabel>) {
  return <DropdownMenuLabel data-slot="menubar-label" {...props} />;
}

function MenubarSeparator({ ...props }: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return <DropdownMenuSeparator data-slot="menubar-separator" {...props} />;
}

function MenubarShortcut({ ...props }: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return <DropdownMenuShortcut data-slot="menubar-shortcut" {...props} />;
}

function MenubarSub({ ...props }: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuSubTrigger>) {
  return <DropdownMenuSubTrigger data-slot="menubar-sub-trigger" {...props} />;
}

function MenubarSubContent({ ...props }: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return <DropdownMenuSubContent data-slot="menubar-sub-content" {...props} />;
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
