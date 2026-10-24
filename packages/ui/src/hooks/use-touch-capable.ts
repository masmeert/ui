import { useEffect, useState } from "react";

// Not the inverse of `useHoverCapable`: iPadOS reports hover + fine pointer with only a finger.
export function useTouchCapable() {
  const [canTouch, setCanTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(any-pointer: coarse)");
    // maxTouchPoints is the iPad tell; its media queries lie.
    const update = () => setCanTouch(Boolean(mq?.matches) || navigator.maxTouchPoints > 0);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);

  return canTouch;
}
