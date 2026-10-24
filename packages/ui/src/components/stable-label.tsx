import { cn } from "cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface StableLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

// An invisible semibold copy reserves the width. Set the weight on StableLabel itself.
export function StableLabel({ children, className, ...props }: StableLabelProps) {
  return (
    <span className={cn("stable-label", className)} {...props}>
      <span data-stable-label-ghost aria-hidden>
        {children}
      </span>
      <span>{children}</span>
    </span>
  );
}
