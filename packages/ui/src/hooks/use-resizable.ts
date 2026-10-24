import { useCallback, useRef, useState } from "react";

const read = (key: string, fallback: number) => {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  } catch {
    return fallback;
  }
};

/** Width last dragged to (px), for placeholders rendered before the resizable itself. */
export const readWidth = read;

export function useResizableSize(opts: {
  key: string;
  initial: number;
  side: "start" | "end";
  axis: "x" | "y";
  clamp: (size: number) => number;
}) {
  const [size, setSize] = useState(() => read(opts.key, opts.initial));
  const [dragging, setDragging] = useState(false);
  const latest = useRef(opts);
  latest.current = opts;

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      const horizontal = latest.current.axis === "x";
      const start = horizontal ? event.clientX : event.clientY;
      const startSize = size;
      let next = startSize;
      setDragging(true);
      document.body.style.cursor = horizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";

      const move = (e: PointerEvent) => {
        const delta = (horizontal ? e.clientX : e.clientY) - start;
        next = latest.current.clamp(
          Math.round(startSize + (latest.current.side === "start" ? -delta : delta)),
        );
        setSize(next);
      };
      const up = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        setDragging(false);
        document.body.style.removeProperty("cursor");
        document.body.style.removeProperty("user-select");
        try {
          localStorage.setItem(latest.current.key, String(next));
        } catch {}
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
    },
    [size],
  );

  const onDoubleClick = useCallback(() => {
    const next = latest.current.clamp(latest.current.initial);
    setSize(next);
    try {
      localStorage.removeItem(latest.current.key);
    } catch {}
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const [towardStartKey, towardEndKey] =
        latest.current.axis === "x" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
      if (event.key !== towardStartKey && event.key !== towardEndKey) return;
      event.preventDefault();
      const step = (event.shiftKey ? 64 : 16) * (event.key === towardStartKey ? -1 : 1);
      const next = latest.current.clamp(size + (latest.current.side === "start" ? -step : step));
      setSize(next);
      try {
        localStorage.setItem(latest.current.key, String(next));
      } catch {}
    },
    [size],
  );

  return { size, dragging, handleProps: { onPointerDown, onDoubleClick, onKeyDown } };
}

/** `side: "start"` grows the element when dragged left. `clamp` runs at drag time. */
export function useResizable(opts: {
  key: string;
  initial: number;
  side: "start" | "end";
  clamp: (width: number) => number;
}) {
  const { size, dragging, handleProps } = useResizableSize({ ...opts, axis: "x" });
  return { width: size, dragging, handleProps };
}
