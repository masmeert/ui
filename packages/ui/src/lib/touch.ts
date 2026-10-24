export const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

/**
 * For gesture surfaces wrapping consumer content: selection is off only on coarse
 * pointers, so mouse users can still copy. `pointer: coarse` reads the primary pointer
 * only, so hybrids get it wrong; pair with `holdSelection` where a miss costs a gesture.
 */
export const TOUCH_GESTURE_CONTENT_CLASS =
  "[-webkit-touch-callout:none] pointer-coarse:select-none";

/** Suppresses selection on `element` for the length of a gesture. Returns the release. */
export function holdSelection(element: HTMLElement) {
  element.style.setProperty("user-select", "none");
  element.style.setProperty("-webkit-user-select", "none");
  return () => {
    element.style.removeProperty("user-select");
    element.style.removeProperty("-webkit-user-select");
  };
}

// WebKit throws `NotFoundError` when the pointer is already gone (routine on iOS).
// Touch has implicit capture anyway, so losing it is never fatal.
export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {}
}

export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {}
}

/**
 * Not a touch and not pressed. A resting pen has `buttons` set, so it takes the tap
 * path. Answers an enter only; pair leaves with their enter via `useHoverGesture`.
 */
export const isHoveringPointer = (event: { pointerType: string; buttons: number }) =>
  event.pointerType !== "touch" && event.buttons === 0;
