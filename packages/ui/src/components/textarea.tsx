import * as React from "react";
import { type Size, useSize } from "@/lib/size";
import { cn } from "cn";

// Row padding vertically, so the first line sits where an input's text would.
const STEP_CLASS: Record<Size, string> = {
  compact: "min-h-14 rounded-lg px-2.5 py-2",
  default: "min-h-16 rounded-lg px-3 py-2",
  large: "min-h-20 rounded-xl px-4 py-2.5",
};

function Textarea({
  className,
  size,
  ...props
}: React.ComponentProps<"textarea"> & { size?: Size }) {
  const tokens = useSize(size);
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-grip flex field-sizing-content w-full border border-border bg-transparent transition-colors duration-(--duration-fast) outline-none placeholder:text-muted-foreground focus-visible:border-brand/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
        STEP_CLASS[tokens.size],
        tokens.field,
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
