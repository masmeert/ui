import { useMemo, useRef } from "react";
import { isHoveringPointer } from "@/lib/touch";

interface BoundaryEvent {
  pointerId: number;
  pointerType: string;
  buttons: number;
}

export interface HoverGesture {
  enter: (event: BoundaryEvent) => boolean;
  leave: (event: BoundaryEvent) => boolean;
}

/**
 * Pairs enter with leave per pointer. Asking `isHoveringPointer` again on leave breaks
 * both edges: a pen's leave fires after pointerup with `buttons: 0` (would undo its tap),
 * and a mouse dragged off leaves with `buttons: 1` (would strand the surface open).
 */
export function useHoverGesture(): HoverGesture {
  const contact = useRef(new Set<number>());

  return useMemo(
    () => ({
      enter: (event) => {
        if (isHoveringPointer(event)) {
          contact.current.delete(event.pointerId);
          return true;
        }
        contact.current.add(event.pointerId);
        return false;
      },
      leave: (event) => {
        const arrivedInContact = contact.current.delete(event.pointerId);
        return !arrivedInContact && event.pointerType !== "touch";
      },
    }),
    [],
  );
}
