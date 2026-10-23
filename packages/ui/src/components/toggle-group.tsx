"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";

const toggleGroupItemVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none select-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-pressed:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        default: "min-h-8 min-w-8 px-3.5 py-1.5 text-sm",
        sm: "min-h-7 min-w-7 px-3 py-1 text-xs",
        lg: "min-h-10 min-w-10 px-4 py-2 text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
);

type ToggleGroupVariant = "default" | "outline";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleGroupItemVariants> & {
    variant?: ToggleGroupVariant;
    multiple?: boolean;
  }
>({ size: "default", variant: "default", multiple: false });

function ToggleGroup({
  className,
  variant = "default",
  size,
  spacing = 1,
  orientation = "horizontal",
  multiple,
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleGroupItemVariants> & {
    variant?: ToggleGroupVariant;
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <LayoutGroup id={React.useId()}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-spacing={spacing}
        data-orientation={orientation}
        orientation={orientation}
        multiple={multiple}
        style={{ "--gap": spacing } as React.CSSProperties}
        className={cn(
          "group/toggle-group inline-flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-full bg-card p-1 data-[variant=outline]:border data-[variant=outline]:border-border data-[variant=outline]:bg-transparent data-vertical:flex-col data-vertical:items-stretch data-vertical:rounded-2xl",
          className,
        )}
        {...props}
      >
        <ToggleGroupContext.Provider value={{ variant, size, multiple }}>
          {children}
        </ToggleGroupContext.Provider>
      </ToggleGroupPrimitive>
    </LayoutGroup>
  );
}

function ToggleGroupItem({
  className,
  children,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleGroupItemVariants>) {
  const context = React.useContext(ToggleGroupContext);
  const reduce = useReducedMotion();

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-size={context.size || size}
      className={cn(toggleGroupItemVariants({ size: context.size || size }), className)}
      render={(toggleProps, state) => (
        <button {...toggleProps}>
          {context.multiple ? (
            <AnimatePresence initial={false}>
              {state.pressed ? (
                <motion.span
                  key="highlight"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: reduce ? 0 : 0.16, ease: EASE_OUT }}
                  className="absolute inset-0 rounded-[inherit] bg-muted"
                />
              ) : null}
            </AnimatePresence>
          ) : state.pressed ? (
            // Single selection hands one highlight between items by layoutId, so it slides like the tabs indicator.
            <motion.span
              layoutId="toggle-group-highlight"
              transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
              style={{ borderRadius: 9999 }}
              className="absolute inset-0 bg-muted"
            />
          ) : null}
          <span className="relative z-10 inline-flex items-center gap-2">
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
