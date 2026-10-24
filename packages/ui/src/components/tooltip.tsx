import { AnimatePresence } from "motion/react";
import {
  type AriaAttributes,
  cloneElement,
  isValidElement,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TooltipSurface } from "@/components/tooltip/surface";
import { useDismiss } from "@/hooks/use-dismiss";
import { useHoverGesture } from "@/hooks/use-hover-gesture";
import { useTapGesture } from "@/hooks/use-tap-gesture";
import { cn } from "cn";

type Side = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  content: ReactNode;
  children?: ReactElement;
  /** Existing trigger, e.g. a chart cell; replaces `children`. */
  anchorRef?: RefObject<HTMLElement | SVGElement | null>;
  /** Fractions of the anchor's width and height. */
  anchorPoint?: { x: number; y: number };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  side?: Side;
  /** In ms. Default 120. */
  delay?: number;
  className?: string;
  wrapperClassName?: string;
}

const GAP = 8;

const anchorTransform: Record<Side, string> = {
  top: "translate(-50%, -100%)",
  bottom: "translate(-50%, 0)",
  left: "translate(-100%, -50%)",
  right: "translate(0, -50%)",
};

const transformOrigin: Record<Side, string> = {
  top: "center bottom",
  bottom: "center top",
  left: "right center",
  right: "left center",
};

// Right after any tooltip closes, the next opens without delay.
const WARM_WINDOW_MS = 300;
let lastHiddenAt = 0;

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 120,
  className,
  wrapperClassName,
  anchorRef: externalAnchorRef,
  anchorPoint,
  open: controlledOpen,
  onOpenChange,
  id: providedId,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [instant, setInstant] = useState(false);
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const anchorRef = externalAnchorRef ?? wrapperRef;
  const hover = useHoverGesture();
  const surfaceRef = useRef<HTMLSpanElement>(null);

  const place = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width * (anchorPoint?.x ?? 0.5);
    const cy = r.top + r.height * (anchorPoint?.y ?? 0.5);
    const point: Record<Side, { top: number; left: number }> = {
      top: { top: (anchorPoint ? cy : r.top) - GAP, left: cx },
      bottom: { top: (anchorPoint ? cy : r.bottom) + GAP, left: cx },
      left: { top: cy, left: (anchorPoint ? cx : r.left) - GAP },
      right: { top: cy, left: (anchorPoint ? cx : r.right) + GAP },
    };
    const next = point[side];
    const width = surfaceRef.current?.offsetWidth ?? 0;
    const height = surfaceRef.current?.offsetHeight ?? 0;
    const dx = side === "left" ? width : side === "right" ? 0 : width / 2;
    const dy = side === "top" ? height : side === "bottom" ? 0 : height / 2;
    // Whole pixels: a fractional anchor blurs the text.
    next.left = Math.round(
      Math.max(GAP + dx, Math.min(next.left, window.innerWidth - GAP - width + dx)),
    );
    next.top = Math.round(
      Math.max(GAP + dy, Math.min(next.top, window.innerHeight - GAP - height + dy)),
    );
    setCoords((previous) =>
      previous?.top === next.top && previous.left === next.left ? previous : next,
    );
  }, [side, anchorRef, anchorPoint]);

  const positioned = coords !== null;
  useLayoutEffect(() => {
    if (!open) return;
    place();
    const observer = new ResizeObserver(place);
    if (anchorRef.current) observer.observe(anchorRef.current);
    if (positioned && surfaceRef.current) observer.observe(surfaceRef.current);
    return () => observer.disconnect();
  }, [open, place, anchorRef, positioned]);

  const show = useCallback(
    (keyboard = false) => {
      if (timer.current) clearTimeout(timer.current);
      const warm = Date.now() - lastHiddenAt < WARM_WINDOW_MS;
      timer.current = setTimeout(
        () => {
          place();
          setInstant(warm || keyboard);
          setOpen(true);
        },
        warm ? 0 : delay,
      );
    },
    [delay, place, setOpen],
  );

  const hide = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (open) lastHiddenAt = Date.now();
    setOpen(false);
  }, [open, setOpen]);

  // Touch never hovers and Safari doesn't focus on tap, so a tap toggles the label. The click
  // has no pointerType, so the preceding pointerdown tells whether it was a tap.
  const tap = useTapGesture<boolean>();

  const toggleOnTap = useCallback(() => {
    const gesture = tap.take();
    if (!gesture || gesture.pointerType === "mouse") return;
    if (gesture.state) {
      hide();
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    place();
    setInstant(false);
    setOpen(true);
  }, [hide, place, tap, setOpen]);

  useDismiss(open, hide, anchorRef);

  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, place]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!externalAnchorRef && !isValidElement(children)) return children;

  // Only aria-describedby is cloned on; handlers live on the wrapper, because a child that
  // hard-wires onClick and spreads the rest (ThemeToggle) would run ours instead of its own.
  const trigger = isValidElement<AriaAttributes>(children)
    ? cloneElement(children, {
        "aria-describedby": id,
      })
    : null;

  return (
    <>
      {!externalAnchorRef ? (
        // biome-ignore lint/a11y/noStaticElementInteractions: This wrapper observes bubbling trigger events without replacing the control's handlers.
        <span
          ref={wrapperRef}
          className={cn("relative inline-flex align-middle", wrapperClassName)}
          // Pointer events: a tap's compat mouseenter/leave carry no pointerType and race the tap path.
          onPointerEnter={(event: PointerEvent) => {
            if (hover.enter(event)) show();
          }}
          onPointerLeave={(event: PointerEvent) => {
            if (hover.leave(event)) hide();
          }}
          onFocus={(event) => event.target.matches(":focus-visible") && show(true)}
          onBlur={hide}
          onPointerDown={(event: PointerEvent) => tap.start(event, open)}
          // No click follows a cancelled gesture, and key activation has no pointer: drop the stale record.
          onPointerCancel={tap.drop}
          onKeyDown={tap.drop}
          onClick={toggleOnTap}
        >
          {trigger}
        </span>
      ) : null}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open && coords ? (
                <span
                  className="pointer-events-none fixed z-(--z-tooltip)"
                  style={{
                    top: coords.top,
                    left: coords.left,
                    transform: anchorTransform[side],
                  }}
                >
                  <TooltipSurface
                    ref={surfaceRef}
                    id={id}
                    initial={instant ? false : "initial"}
                    style={{
                      transformOrigin: transformOrigin[side],
                      maxWidth: "calc(100vw - 16px)",
                      whiteSpace: "normal",
                    }}
                    className={className}
                  >
                    {content}
                  </TooltipSurface>
                </span>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
