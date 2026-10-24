import { motion, type Transition, useReducedMotion } from "motion/react";
import { type CSSProperties, useState } from "react";
import { cn } from "cn";
import type { FluidHover, ItemRect } from "@/hooks/use-fluid-hover";
import { INSTANT, spring } from "@/lib/springs";

export interface FluidHoverHighlightProps {
  hover: Pick<FluidHover, "activeIndex" | "itemRects" | "isMeasured" | "session">;
  hidden?: boolean;
  /** Where a fresh entry fades in from (the checked row, the active route). */
  from?: ItemRect | null;
  className?: string;
  style?: CSSProperties;
  /** `false` snaps, e.g. after a reflow. */
  transition?: Transition | false;
}

function sameRect(a: ItemRect, b: ItemRect | undefined) {
  return (
    b !== undefined &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height
  );
}

// Mounts only once measured, so it never slides in from a rect a later pass corrects.
export function FluidHoverHighlight({
  hover,
  hidden = false,
  from,
  className,
  transition,
  style,
}: FluidHoverHighlightProps) {
  const reduce = useReducedMotion();
  const { activeIndex, itemRects, isMeasured, session } = hover;
  const lit = activeIndex === null ? undefined : itemRects[activeIndex];
  // Kept so the highlight fades out in place when the pointer leaves.
  const [last, setLast] = useState(lit);
  if (lit && !sameRect(lit, last)) setLast(lit);
  const target = lit ?? last;
  if (!isMeasured || !target) {
    return null;
  }
  const visible = !hidden && lit !== undefined;
  const start = from ?? target;
  const travel = reduce || transition === false ? INSTANT : (transition ?? spring.fast);

  return (
    <motion.div
      // Re-keyed per pointer entry, so a fresh entry fades in instead of gliding over.
      key={session}
      aria-hidden
      data-slot="fluid-hover-highlight"
      className={cn("pointer-events-none absolute top-0 left-0 rounded-lg bg-hover", className)}
      style={style}
      initial={{
        opacity: 0,
        x: start.left,
        y: start.top,
        width: start.width,
        height: start.height,
      }}
      animate={{
        opacity: visible ? 1 : 0,
        x: target.left,
        y: target.top,
        width: target.width,
        height: target.height,
      }}
      transition={{
        x: travel,
        y: travel,
        width: travel,
        height: travel,
        opacity: spring.fast,
      }}
    />
  );
}
