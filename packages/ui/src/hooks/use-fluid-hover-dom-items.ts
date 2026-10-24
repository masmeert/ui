import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";
import type { FluidHover, ItemRect } from "@/hooks/use-fluid-hover";

function sameElements(a: readonly HTMLElement[], b: readonly HTMLElement[]) {
  return a.length === b.length && a.every((element, index) => element === b[index]);
}

/**
 * Registers items by querying `selector` in DOM order, for compound parts that don't know
 * their index. `fromSelector`'s rect is returned as `from`. `refresh()` re-measures
 * without hiding the highlight; call it when a transform-driven move settles.
 */
export function useFluidHoverDomItems(
  hover: Pick<FluidHover, "registerItem" | "itemRects">,
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  fromSelector?: string,
) {
  const { registerItem } = hover;
  const registered = useRef<HTMLElement[]>([]);
  const [fromIndex, setFromIndex] = useState(-1);

  const sync = useCallback(() => {
    const container = containerRef.current;
    const next = container ? Array.from(container.querySelectorAll<HTMLElement>(selector)) : [];
    const previous = registered.current;
    if (!sameElements(previous, next)) {
      for (let index = next.length; index < previous.length; index++) registerItem(index, null);
      next.forEach((element, index) => {
        if (previous[index] !== element) registerItem(index, element);
      });
      registered.current = next;
    }
    const from = fromSelector ? next.findIndex((element) => element.matches(fromSelector)) : -1;
    setFromIndex((current) => (current === from ? current : from));
  }, [containerRef, fromSelector, registerItem, selector]);

  // Every render: children can change before the MutationObserver sees it.
  useLayoutEffect(() => {
    sync();
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new MutationObserver(sync);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "aria-current",
        "aria-selected",
        "aria-pressed",
        "aria-checked",
        "data-state",
        "data-pressed",
        "data-active",
      ],
    });
    return () => observer.disconnect();
  }, [containerRef, sync]);

  const refresh = useCallback(() => {
    registered.current.forEach((element, index) => {
      registerItem(index, null);
      registerItem(index, element);
    });
  }, [registerItem]);

  const indexOf = useCallback((element: Element | null) => {
    if (!element) return -1;
    return registered.current.findIndex((item) => item === element || item.contains(element));
  }, []);

  const from: ItemRect | null = fromIndex >= 0 ? (hover.itemRects[fromIndex] ?? null) : null;

  return { from, fromIndex, refresh, indexOf };
}
