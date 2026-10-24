"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Textarea } from "@/components/textarea";
import { buttonVariants, type ButtonVariant } from "@/components/button";
import { type Size, SizeProvider, useSize } from "@/lib/size";

const FIELD_RADIUS: Record<Size, string> = {
  compact: "rounded-lg",
  default: "rounded-lg",
  large: "rounded-xl",
};

function InputGroup({
  className,
  size,
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: Size }) {
  const tokens = useSize(size);
  return (
    <div
      data-slot="input-group"
      data-size={tokens.size}
      role="group"
      className={cn(
        "group/input-group relative flex w-full items-center border border-border transition-colors duration-(--duration-fast) outline-none",
        tokens.control,
        FIELD_RADIUS[tokens.size],
        "min-w-0 has-[>textarea]:h-auto",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
        "has-[[data-slot=input-group-control]:focus-visible]:border-brand/40",
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
        className,
      )}
      {...props}
    >
      <SizeProvider size={tokens.size}>{children}</SizeProvider>
    </div>
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center py-1.5 font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        // 3px matches INSET_BUTTON's inset, keeping the radii concentric.
        "inline-start": "order-first pl-3 has-[>button]:pl-[3px]",
        "inline-end": "order-last pr-3 has-[>button]:pr-[3px]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  const tokens = useSize();
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        inputGroupAddonVariants({ align }),
        tokens.gap,
        tokens.text,
        ADDON_ICON[tokens.size],
        className,
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

const ADDON_ICON: Record<Size, string> = {
  compact: "[&>svg:not([class*='size-'])]:size-3.5",
  default: "[&>svg:not([class*='size-'])]:size-4",
  large: "[&>svg:not([class*='size-'])]:size-[18px]",
};

// 3px in from the border at every step; radius is nestedRadius(field, 3, 1).
const INSET_BUTTON: Record<Size, { button: string; icon: string }> = {
  compact: {
    button: "h-6 gap-1 rounded-[10px] px-2 [&>svg:not([class*='size-'])]:size-3.5",
    icon: "size-6 rounded-[10px] p-0 [&>svg:not([class*='size-'])]:size-3.5",
  },
  default: {
    button: "h-7 gap-1.5 rounded-[10px] px-2.5 [&>svg:not([class*='size-'])]:size-4",
    icon: "size-7 rounded-[10px] p-0 [&>svg:not([class*='size-'])]:size-4",
  },
  large: {
    button: "h-9 gap-2 rounded-[16px] px-3 [&>svg:not([class*='size-'])]:size-[18px]",
    icon: "size-9 rounded-[16px] p-0 [&>svg:not([class*='size-'])]:size-[18px]",
  },
};

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "inset",
  ...props
}: Omit<React.ComponentProps<"button">, "size"> & {
  variant?: ButtonVariant;
  size?: "inset" | "icon-inset";
}) {
  const tokens = useSize();
  return (
    <button
      type={type}
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ variant, size: tokens.size }),
        "outline-none focus-visible:ring-4 focus-visible:ring-ring",
        // Inside a field the button text steps down one role.
        tokens.size === "large" ? tokens.type.body : tokens.type.caption,
        "flex items-center shadow-none",
        INSET_BUTTON[tokens.size][size === "icon-inset" ? "icon" : "button"],
        className,
      )}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  const tokens = useSize();
  return (
    <span
      className={cn(
        "flex items-center text-muted-foreground [&_svg]:pointer-events-none",
        tokens.gap,
        tokens.text,
        tokens.iconClass,
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  const tokens = useSize();
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "h-full w-full min-w-0 flex-1 bg-transparent py-1 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        tokens.controlPx,
        tokens.field,
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent bg-none py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
