import type { Transition } from "motion/react";
import { EASE_OUT } from "./ease";

// `visualDuration`, so the perceived time doesn't change with the bounce.
export const spring = {
  fast: { type: "spring", visualDuration: 0.1, bounce: 0 },
  moderate: { type: "spring", visualDuration: 0.18, bounce: 0 },
  slow: { type: "spring", visualDuration: 0.26, bounce: 0.12 },
} as const satisfies Record<string, Transition>;

export type MotionTier = keyof typeof spring;

const EXIT_EASE = [0.4, 0, 1, 1] as const;

export const springExit = {
  fast: { type: "tween", duration: 0.06, ease: EXIT_EASE },
  moderate: { type: "tween", duration: 0.12, ease: EXIT_EASE },
  slow: { type: "tween", duration: 0.16, ease: EXIT_EASE },
} as const satisfies Record<MotionTier, Transition>;

/** For `clip-path` and `filter` strings, where a spring's settling tail snaps at the end. */
export const tierTween = {
  fast: { type: "tween", duration: 0.1, ease: EASE_OUT },
  moderate: { type: "tween", duration: 0.18, ease: EASE_OUT },
  slow: { type: "tween", duration: 0.26, ease: EASE_OUT },
} as const satisfies Record<MotionTier, Transition>;

export const INSTANT = { duration: 0 } as const satisfies Transition;

/** Under reduced motion, travel snaps but opacity and colour still fade. */
export function reducedTransition(transition: Transition, reduce: boolean | null): Transition {
  if (!reduce) return transition;
  return {
    ...INSTANT,
    opacity: spring.fast,
    backgroundColor: spring.fast,
    color: spring.fast,
  };
}
