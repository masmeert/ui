import type { ButtonHTMLAttributes, ReactNode } from "react";

import {
  type ScrollTarget,
  type ScrollToOptions,
  useSmoothScroll,
} from "@/components/smooth-scroll";
import { cn } from "cn";

export interface ScrollToProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** Px offset, selector string or element. */
  to: ScrollTarget;
  /** Extra px offset from the target, e.g. to clear a sticky header. */
  offset?: number;
  /** Scroll duration in seconds. */
  duration?: number;
  children: ReactNode;
  className?: string;
}

export function ScrollTo({ to, offset, duration, children, className, ...rest }: ScrollToProps) {
  const { scrollTo } = useSmoothScroll();
  const options: ScrollToOptions = { offset, duration };
  return (
    <button type="button" onClick={() => scrollTo(to, options)} className={cn(className)} {...rest}>
      {children}
    </button>
  );
}
