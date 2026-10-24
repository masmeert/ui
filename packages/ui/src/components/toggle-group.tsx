"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cn } from "cn";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { useFluidHoverDomItems } from "@/hooks/use-fluid-hover-dom-items";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";

// Height comes from `segmentItem` + `segmentPad`, so this only sets width.
const ITEM_SIZE: Record<Size, string> = {
  compact: "min-w-7 px-2.5",
  default: "min-w-7 px-3",
  large: "min-w-9 px-4",
};

type ToggleGroupVariant = "default" | "outline";

const ToggleGroupContext = React.createContext<{
  size?: Size;
  variant?: ToggleGroupVariant;
  multiple?: boolean;
  orientation?: "horizontal" | "vertical";
}>({ variant: "default", multiple: false, orientation: "horizontal" });

const ITEM_SELECTOR = '[data-slot="toggle-group-item"]';

function ToggleGroup({
  className,
  variant = "default",
  size,
  spacing = 1,
  orientation = "horizontal",
  multiple,
  children,
  onValueChange,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  ...props
}: ToggleGroupPrimitive.Props & {
  size?: Size;
  variant?: ToggleGroupVariant;
  spacing?: number;
  orientation?: "horizontal" | "vertical";
}) {
  const tokens = useSize(size);
  const groupRef = React.useRef<HTMLDivElement>(null);

  // The hover layer is separate from the pressed pill below.
  const hover = useFluidHover(groupRef, { axis: orientation === "vertical" ? "y" : "x" });
  const { from, indexOf } = useFluidHoverDomItems(hover, groupRef, ITEM_SELECTOR, "[data-pressed]");
  const { setActiveIndex } = hover;

  const context = React.useMemo(
    () => ({ variant, size, multiple, orientation }),
    [variant, size, multiple, orientation],
  );

  return (
    <LayoutGroup id={React.useId()}>
      <ToggleGroupPrimitive
        ref={groupRef}
        data-slot="toggle-group"
        data-variant={variant}
        data-size={tokens.size}
        data-spacing={spacing}
        data-orientation={orientation}
        orientation={orientation}
        multiple={multiple}
        onValueChange={onValueChange}
        onPointerEnter={(event) => {
          hover.handlers.onPointerEnter(event);
          onPointerEnter?.(event);
        }}
        onPointerMove={(event) => {
          hover.handlers.onPointerMove(event);
          onPointerMove?.(event);
        }}
        onPointerLeave={(event) => {
          hover.handlers.onPointerLeave(event);
          onPointerLeave?.(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          hover.handlers.onClick(event);
        }}
        // Arrow keys rove focus; a visible focus lights the hover layer.
        onFocus={(event) => {
          if (event.target.matches(":focus-visible")) setActiveIndex(indexOf(event.target));
          onFocus?.(event);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setActiveIndex(null);
          }
          onBlur?.(event);
        }}
        style={{ "--gap": spacing } as React.CSSProperties}
        className={cn(
          "group/toggle-group relative inline-flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-full bg-card data-[variant=outline]:border data-[variant=outline]:border-border data-[variant=outline]:bg-transparent data-vertical:flex-col data-vertical:items-stretch data-vertical:rounded-2xl",
          tokens.segmentPad,
          className,
        )}
        {...props}
      >
        <FluidHoverHighlight
          hover={hover}
          from={from}
          className={orientation === "vertical" ? "rounded-xl" : "rounded-full"}
        />
        <ToggleGroupContext.Provider value={context}>{children}</ToggleGroupContext.Provider>
      </ToggleGroupPrimitive>
    </LayoutGroup>
  );
}

function ToggleGroupItem({
  className,
  children,
  size,
  ...props
}: TogglePrimitive.Props & { size?: Size }) {
  const context = React.useContext(ToggleGroupContext);
  const reduce = useReducedMotion();
  // The group's size wins over the item's.
  const tokens = useSize(context.size ?? size);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-size={tokens.size}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duration-fast) outline-none select-none group-data-vertical/toggle-group:rounded-xl focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-fluid-hover-active:text-foreground data-pressed:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        tokens.segmentItem,
        ITEM_SIZE[tokens.size],
        tokens.text,
        tokens.iconClass,
        className,
      )}
      render={(toggleProps, state) => (
        <button {...toggleProps}>
          {context.multiple ? (
            <AnimatePresence initial={false}>
              {state.pressed ? (
                <motion.span
                  key="highlight"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduce
                      ? { opacity: 0, transition: springExit.fast }
                      : { opacity: 0, scale: 0.9, transition: springExit.fast }
                  }
                  transition={reducedTransition(spring.fast, reduce)}
                  className="absolute inset-0 rounded-[inherit] bg-selected"
                />
              ) : null}
            </AnimatePresence>
          ) : state.pressed ? (
            // Single selection shares one indicator via layoutId so it slides between items.
            <motion.span
              layoutId="toggle-group-highlight"
              transition={reducedTransition(spring.moderate, reduce)}
              // Radius as a style so layout animation corrects it while the pill stretches.
              style={{ borderRadius: context.orientation === "vertical" ? 12 : 9999 }}
              className="absolute inset-0 bg-selected"
            />
          ) : null}
          <span className={cn("relative z-10 inline-flex items-center", tokens.gap)}>
            {toggleProps.children}
          </span>
        </button>
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
