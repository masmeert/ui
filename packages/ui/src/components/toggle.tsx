"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { sizeTokens, useSize } from "@/lib/size";

const compact = sizeTokens("compact");
const regular = sizeTokens("default");
const large = sizeTokens("large");

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-(--duration-fast) outline-none hover:bg-hover hover:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-pressed:bg-selected data-pressed:text-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-hover hover:text-foreground",
      },
      size: {
        compact: cn(
          compact.control,
          "min-w-8 px-1.5",
          compact.text,
          compact.gap,
          compact.iconClass,
        ),
        default: cn(regular.control, "min-w-9 px-2", regular.text, regular.gap, regular.iconClass),
        large: cn(large.control, "min-w-11 px-2.5", large.text, large.gap, large.iconClass),
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant = "default",
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const tokens = useSize(size ?? undefined);
  return (
    <TogglePrimitive
      data-slot="toggle"
      data-size={tokens.size}
      className={cn(toggleVariants({ variant, size: tokens.size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
