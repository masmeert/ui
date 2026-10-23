import * as React from "react";
import { cn } from "cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-grip flex field-sizing-content min-h-16 w-full rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-base leading-6 transition-colors outline-none placeholder:text-muted-foreground/60 focus-visible:border-brand/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
