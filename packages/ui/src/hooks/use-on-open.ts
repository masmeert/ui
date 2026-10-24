import { useState } from "react";

/**
 * Runs `start` during the render where `open` turns true, so no key press can land on the
 * previous session. `start` may only set this component's own state.
 */
export function useOnOpen(open: boolean, start: () => void) {
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) start();
  }
}
