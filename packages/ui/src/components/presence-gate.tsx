import { useIsPresent } from "motion/react";
import type { ReactNode } from "react";

export interface PresenceGateRenderProps {
  /** False from the render that starts the exit animation onward. */
  isPresent: boolean;
  /**
   * Spread onto every layer that takes pointer events, so an exiting overlay stops
   * taking pointer, focus and AT input at once. A layer that never takes pointer
   * events takes `inert={!isPresent}` alone, so its `pointer-events-none` survives.
   */
  gate: {
    inert: boolean;
    style: { pointerEvents: "auto" | "none" };
  };
}

export interface PresenceGateProps {
  children: (props: PresenceGateRenderProps) => ReactNode;
}

/** `useIsPresent` only works below `AnimatePresence`; this reads it there and hands it down. */
export function PresenceGate({ children }: PresenceGateProps) {
  const isPresent = useIsPresent();

  return children({
    isPresent,
    gate: {
      inert: !isPresent,
      style: { pointerEvents: isPresent ? "auto" : "none" },
    },
  });
}
