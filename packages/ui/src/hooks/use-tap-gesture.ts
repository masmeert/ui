import { useMemo, useRef } from "react";

export interface TapRecord<S> {
  pointerType: string;
  state: S;
}

export interface TapGesture<S> {
  start: (event: { pointerType: string }, state: S) => void;
  /** `null` when no pointer is behind this click (keyboard activation). */
  take: () => TapRecord<S> | null;
  drop: () => void;
}

/**
 * Records the pointerdown behind a click, since `click` carries no `pointerType`. Stores
 * the state at gesture start: focus-on-contact can open the panel before the click lands.
 * Wire `drop` to `onPointerCancel` and `onKeyDown`, or an abandoned touch leaks into a
 * later Enter.
 */
export function useTapGesture<S>(): TapGesture<S> {
  const record = useRef<TapRecord<S> | null>(null);

  return useMemo(
    () => ({
      start: (event, state) => {
        record.current = { pointerType: event.pointerType, state };
      },
      take: () => {
        const spent = record.current;
        record.current = null;
        return spent;
      },
      drop: () => {
        record.current = null;
      },
    }),
    [],
  );
}
