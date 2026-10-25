import {
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** In the container's content coordinates. */
export type ItemRect = { top: number; left: number; width: number; height: number };

export type FluidHoverAxis = "y" | "x" | "xy";

export interface FluidHoverOptions {
  axis?: FluidHoverAxis;
  /** Runs on every move; keep it cheap. Defaults to disabled/aria-disabled/data-disabled. */
  isItemDisabled?: (element: HTMLElement) => boolean;
  /** Routes clicks in gaps to the lit item. `maxDistance` caps it in px. */
  gapClick?: boolean | { maxDistance?: number };
}

const DISABLED = ':disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"])';

function defaultIsDisabled(element: HTMLElement) {
  return element.matches(DISABLED);
}

// Inside wins; else nearest centre on the axis (Euclidean for "xy"). Ties keep the first.
export function pickFluidHoverItem(
  rects: readonly (ItemRect | undefined)[],
  point: { x: number; y: number },
  axis: FluidHoverAxis = "y",
  skip?: (index: number) => boolean,
): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (let index = 0; index < rects.length; index++) {
    const rect = rects[index];
    if (!rect || skip?.(index)) continue;
    const inside =
      point.x >= rect.left &&
      point.x <= rect.left + rect.width &&
      point.y >= rect.top &&
      point.y <= rect.top + rect.height;
    if (inside) return index;
    const dx = point.x - (rect.left + rect.width / 2);
    const dy = point.y - (rect.top + rect.height / 2);
    const distance = axis === "y" ? Math.abs(dy) : axis === "x" ? Math.abs(dx) : Math.hypot(dx, dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
}

function distanceToRect(rect: ItemRect, point: { x: number; y: number }) {
  const dx = Math.max(rect.left - point.x, 0, point.x - (rect.left + rect.width));
  const dy = Math.max(rect.top - point.y, 0, point.y - (rect.top + rect.height));
  return Math.hypot(dx, dy);
}

const INTERACTIVE =
  'a[href], button, input, select, textarea, [role="button"], [role="searchbox"], [contenteditable=""], [contenteditable="true"]';

/**
 * Spread `handlers` on a `position: relative` container and register click targets only.
 * Indices must be stable while mounted. Mouse only; call `setActiveIndex` for keyboard.
 */
export function useFluidHover<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  { axis = "y", isItemDisabled = defaultIsDisabled, gapClick = true }: FluidHoverOptions = {},
) {
  const items = useRef(new Map<number, HTMLElement>());
  const [itemRects, setItemRects] = useState<ItemRect[]>([]);
  const [isMeasured, setIsMeasured] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [session, setSession] = useState(0);
  const rectsRef = useRef<ItemRect[]>([]);
  const frame = useRef<number | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  // While the mouse is over the list: so a re-measure can re-pick under a resting pointer.
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const repick = useRef<() => void>(() => {});
  const options = useRef({ axis, isItemDisabled, gapClick });
  useLayoutEffect(() => {
    options.current = { axis, isItemDisabled, gapClick };
  });

  const geometry = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;
    const box = container.getBoundingClientRect();
    if (box.width === 0 || box.height === 0 || container.offsetWidth === 0) return null;
    const scaleX = box.width / container.offsetWidth;
    const scaleY = box.height / (container.offsetHeight || 1);
    return { container, box, scaleX, scaleY };
  }, [containerRef]);

  const toLocal = useCallback(
    (clientX: number, clientY: number) => {
      const g = geometry();
      if (!g) return null;
      return {
        x: (clientX - g.box.left) / g.scaleX - g.container.clientLeft + g.container.scrollLeft,
        y: (clientY - g.box.top) / g.scaleY - g.container.clientTop + g.container.scrollTop,
      };
    },
    [geometry],
  );

  // Layout offsets, not the on-screen box: an item mid-transform (a `layout` glide, a swipe, a
  // popup's scale-in) would otherwise be measured where it is passing through, not where it lands.
  const rectOf = useCallback(
    (element: HTMLElement, g: NonNullable<ReturnType<typeof geometry>>): ItemRect => {
      let top = element.offsetTop;
      let left = element.offsetLeft;
      let parent = element.offsetParent as HTMLElement | null;
      while (parent && parent !== g.container && g.container.contains(parent)) {
        top += parent.offsetTop + parent.clientTop - parent.scrollTop;
        left += parent.offsetLeft + parent.clientLeft - parent.scrollLeft;
        parent = parent.offsetParent as HTMLElement | null;
      }
      if (parent === g.container)
        return { top, left, width: element.offsetWidth, height: element.offsetHeight };
      // The offset chain skipped the container (it isn't positioned, or the item is fixed).
      const r = element.getBoundingClientRect();
      return {
        left: (r.left - g.box.left) / g.scaleX - g.container.clientLeft + g.container.scrollLeft,
        top: (r.top - g.box.top) / g.scaleY - g.container.clientTop + g.container.scrollTop,
        width: r.width / g.scaleX,
        height: r.height / g.scaleY,
      };
    },
    [],
  );

  // One rAF pass per burst; retries 3 frames for a popup without a box yet, and never
  // publishes zeroed rects.
  const measure = useCallback(
    (attempt = 0) => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const g = geometry();
        if (!g) {
          if (attempt < 3) measure(attempt + 1);
          return;
        }
        const next: ItemRect[] = [];
        let complete = items.current.size > 0;
        for (const [index, element] of items.current) {
          const rect = rectOf(element, g);
          if (rect.width === 0 && rect.height === 0) complete = false;
          next[index] = rect;
        }
        if (!complete) {
          if (attempt < 3) measure(attempt + 1);
          return;
        }
        rectsRef.current = next;
        setItemRects(next);
        setIsMeasured(true);
        repick.current();
      });
    },
    [geometry, rectOf],
  );

  /** For items moved without resizing, which the ResizeObserver can't see. Keeps the highlight up. */
  const refresh = useCallback(() => measure(), [measure]);

  /** Hides the highlight until measured: for a popup that just opened. */
  const remeasure = useCallback(() => {
    setIsMeasured(false);
    measure();
  }, [measure]);

  // Every render, so a container that mounts after the hook (a popup's list) gets observed.
  const attached = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container === attached.current) return;
    observer.current?.disconnect();
    observer.current = null;
    attached.current = container;
    if (!container) return;
    const ro = new ResizeObserver(() => measure());
    observer.current = ro;
    ro.observe(container);
    for (const element of items.current.values()) ro.observe(element);
    measure();
  });

  useEffect(
    () => () => {
      observer.current?.disconnect();
      observer.current = null;
      attached.current = null;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const registerItem = useCallback(
    (index: number, element: HTMLElement | null) => {
      const previous = items.current.get(index);
      if (previous === element) return;
      if (previous) observer.current?.unobserve(previous);
      if (element) {
        items.current.set(index, element);
        observer.current?.observe(element);
      } else {
        items.current.delete(index);
      }
      measure();
    },
    [measure],
  );

  const skip = useCallback((index: number) => {
    const element = items.current.get(index);
    return !element || options.current.isItemDisabled(element);
  }, []);

  const pickAt = useCallback(
    (clientX: number, clientY: number) => {
      const point = toLocal(clientX, clientY);
      if (!point) return;
      setActiveIndex(pickFluidHoverItem(rectsRef.current, point, options.current.axis, skip));
    },
    [skip, toLocal],
  );

  // Items can move without resizing (a sibling above grows), which the ResizeObserver misses.
  // The item under the pointer is checked on each move instead.
  const isStale = useCallback(
    (target: EventTarget) => {
      const g = geometry();
      if (!g) return false;
      for (const [index, element] of items.current) {
        if (!element.contains(target as Node)) continue;
        const stored = rectsRef.current[index];
        if (!stored) return true;
        const now = rectOf(element, g);
        return (
          Math.abs(now.top - stored.top) > 1 ||
          Math.abs(now.left - stored.left) > 1 ||
          Math.abs(now.width - stored.width) > 1 ||
          Math.abs(now.height - stored.height) > 1
        );
      }
      return false;
    },
    [geometry, rectOf],
  );

  useLayoutEffect(() => {
    repick.current = () => {
      if (lastPoint.current) pickAt(lastPoint.current.x, lastPoint.current.y);
    };
  });

  useEffect(() => {
    if (activeIndex === null) return;
    const element = items.current.get(activeIndex);
    element?.setAttribute("data-fluid-hover-active", "");
    return () => element?.removeAttribute("data-fluid-hover-active");
  }, [activeIndex]);

  // React bubbles events from portaled children (a flyout, a submenu) through the container,
  // though the pointer is over another surface. Those count as outside.
  const isOutside = useCallback(
    (target: EventTarget) => !containerRef.current?.contains(target as Node),
    [containerRef],
  );
  const wasOutside = useRef(false);

  const handlers = useMemo(
    () => ({
      onPointerEnter(event: PointerEvent) {
        if (event.pointerType !== "mouse" || isOutside(event.target)) return;
        wasOutside.current = false;
        lastPoint.current = { x: event.clientX, y: event.clientY };
        setSession((s) => s + 1);
        // The list may have moved since it was last measured; keeps the highlight up.
        measure();
        pickAt(event.clientX, event.clientY);
      },
      onPointerMove(event: PointerEvent) {
        if (event.pointerType !== "mouse") return;
        if (isOutside(event.target)) {
          wasOutside.current = true;
          lastPoint.current = null;
          setActiveIndex(null);
          return;
        }
        // Back from a portaled child: React fires no pointerenter, so start a fresh session here.
        if (wasOutside.current) {
          wasOutside.current = false;
          setSession((s) => s + 1);
        }
        lastPoint.current = { x: event.clientX, y: event.clientY };
        if (isStale(event.target)) measure();
        pickAt(event.clientX, event.clientY);
      },
      onPointerLeave(event: PointerEvent) {
        if (event.pointerType !== "mouse") return;
        lastPoint.current = null;
        setActiveIndex(null);
      },
      onClick(event: MouseEvent) {
        const { gapClick: gap } = options.current;
        if (!gap || event.defaultPrevented || event.detail === 0) return;
        if (isOutside(event.target)) return;
        const target = event.target as HTMLElement;
        // Not a gap: inside an item, or a control between rows.
        for (const element of items.current.values()) if (element.contains(target)) return;
        if (target !== event.currentTarget && target.closest(INTERACTIVE)) return;
        const point = toLocal(event.clientX, event.clientY);
        if (!point) return;
        const index = pickFluidHoverItem(rectsRef.current, point, options.current.axis, skip);
        if (index === null) return;
        const rect = rectsRef.current[index];
        const maxDistance = typeof gap === "object" ? gap.maxDistance : undefined;
        if (rect && maxDistance !== undefined && distanceToRect(rect, point) > maxDistance) return;
        items.current.get(index)?.click();
      },
    }),
    [isOutside, isStale, measure, pickAt, skip, toLocal],
  );

  return {
    handlers,
    registerItem,
    activeIndex,
    setActiveIndex,
    itemRects,
    isMeasured,
    remeasure,
    refresh,
    session,
  };
}

export type FluidHover = ReturnType<typeof useFluidHover>;

export function useRegisterFluidHoverItem(
  registerItem: FluidHover["registerItem"] | undefined,
  index: number,
  ref: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!registerItem) return;
    registerItem(index, ref.current);
    return () => registerItem(index, null);
  }, [registerItem, index, ref]);
}
