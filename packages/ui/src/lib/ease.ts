export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Height folds. A tween, not a spring: a bouncy spring overshoots past zero height and stutters. */
export const FOLD = {
  duration: 0.24,
  ease: EASE_OUT,
  opacity: { duration: 0.12, ease: EASE_OUT },
} as const;

/** `useSpring` config for dragged handles: critically damped, never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
