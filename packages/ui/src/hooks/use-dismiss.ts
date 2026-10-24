import { type RefObject, useEffect } from "react";

// "pass-through": the tap closes and activates what was under it (platform norm).
// "consume": the tap only closes, for overlays beside costly controls.
export type DismissBehavior = "pass-through" | "consume";

export interface DismissOptions {
  behavior?: DismissBehavior;
  escape?: boolean;
  /** Outside targets that shouldn't dismiss. Must be stable. */
  ignore?: (target: Element) => boolean;
}

// Lets a consumed dismissal tell a stray gesture from one aimed at another open overlay.
const openScopes = new Set<(target: Element) => boolean>();

function claimedByAnotherScope(self: (target: Element) => boolean, target: Element) {
  for (const scope of openScopes) {
    if (scope !== self && scope(target)) return true;
  }
  return false;
}

// preventDefault on pointerdown doesn't stop the click, so swallow the click itself.
// Releases on that click, the next gesture or a keydown, so it never eats a later one.
function consumeActivation(source: Event) {
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    release();
  };
  const restart = (event: Event) => {
    if (event !== source) release();
  };
  const release = () => {
    window.removeEventListener("click", swallow, true);
    window.removeEventListener("pointerdown", restart, true);
    window.removeEventListener("pointercancel", restart, true);
    window.removeEventListener("keydown", release, true);
  };
  window.addEventListener("click", swallow, true);
  window.addEventListener("pointerdown", restart, true);
  window.addEventListener("pointercancel", restart, true);
  window.addEventListener("keydown", release, true);
}

/**
 * Closes on Escape or an outside pointerdown. Capture phase, so handlers that stop
 * propagation can't blind it. `onDismiss` and `ignore` must be stable.
 */
export function useDismiss(
  open: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | SVGElement | null> | null,
  { behavior = "pass-through", escape: dismissOnEscape = true, ignore }: DismissOptions = {},
) {
  useEffect(() => {
    if (!open) return;
    const inside = (target: Element) =>
      Boolean(ref?.current?.contains(target)) || Boolean(ignore?.(target));
    const onKey = (event: KeyboardEvent) => {
      if (dismissOnEscape && event.key === "Escape") onDismiss();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || inside(target)) return;
      // Inside another open overlay: its click isn't ours to swallow.
      if (behavior === "consume" && !claimedByAnotherScope(inside, target)) {
        consumeActivation(event);
      }
      onDismiss();
    };
    openScopes.add(inside);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer, true);
    return () => {
      openScopes.delete(inside);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, [open, onDismiss, ref, behavior, dismissOnEscape, ignore]);
}
