import { motion, useReducedMotion } from "motion/react";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "cn";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";

export interface CarouselDotsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  count: number;
  /** 0-based. */
  index: number;
  onIndexChange?: (index: number) => void;
  /** Fill the current pill over `interval` ms, then advance. Pauses on hover, focus, `paused` and a hidden page. */
  autoplay?: boolean;
  /** In ms. Default 5000. */
  interval?: number;
  /** Called with the next (wrapping) index when the fill completes; defaults to `onIndexChange`. */
  onAdvance?: (nextIndex: number) => void;
  paused?: boolean;
  /** Default "Slide n of count". */
  getDotLabel?: (index: number, count: number) => string;
  size?: Size;
}

// Literal classes so Tailwind's scanner sees them.
const DOT: Record<Size, { dot: string; pill: string; hit: string }> = {
  compact: { dot: "h-1.5 w-1.5", pill: "h-1.5 w-[18px]", hit: "h-8 px-1" },
  default: { dot: "h-2 w-2", pill: "h-2 w-6", hit: "h-9 px-1" },
  large: { dot: "h-2.5 w-2.5", pill: "h-2.5 w-[30px]", hit: "h-11 px-1.5" },
};

const FILL_KEYFRAMES = "masmeert-carousel-dots-fill";

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const isHidden = () => document.visibilityState === "hidden";

/** The fill is a CSS animation so `animation-play-state` pauses it in place instead of restarting. */
export function CarouselDots({
  count,
  index,
  onIndexChange,
  autoplay = false,
  interval = 5000,
  onAdvance,
  paused = false,
  getDotLabel = (i, total) => `Slide ${i + 1} of ${total}`,
  size: sizeProp,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: CarouselDotsProps) {
  const size = useSize(sizeProp);
  const reduce = useReducedMotion();
  const dots = useRef<(HTMLButtonElement | null)[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const hidden = useSyncExternalStore(subscribeVisibility, isHidden, () => false);
  const running = autoplay && !paused && !hovered && !focused && !hidden;
  const current = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  const travel = reducedTransition(spring.moderate, reduce);
  const step = DOT[size.size];

  // A dot the keyboard moved to takes focus once the selection lands on it.
  const keyboardMove = useRef(false);
  useEffect(() => {
    if (!keyboardMove.current) return;
    keyboardMove.current = false;
    dots.current[current]?.focus();
  }, [current]);

  const select = (next: number) => {
    if (next !== current) onIndexChange?.(next);
  };

  const advance = () => {
    const next = (current + 1) % count;
    if (onAdvance) onAdvance(next);
    else onIndexChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || count === 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    let next: number | null = null;
    if (event.key === forward) next = (current + 1) % count;
    else if (event.key === backward) next = (current - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    keyboardMove.current = true;
    select(next);
  };

  return (
    <div
      role="group"
      aria-label="Slides"
      data-slot="carousel-dots"
      className={cn("inline-flex items-center", className)}
      {...props}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        onBlur?.(event);
      }}
      onKeyDown={handleKeyDown}
    >
      {/* React 19 hoists and dedupes this by href: one rule however many dot rows mount. */}
      <style href={FILL_KEYFRAMES} precedence="default">
        {`@keyframes ${FILL_KEYFRAMES}{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}
      </style>
      {Array.from({ length: count }, (_, i) => {
        const active = i === current;
        return (
          <button
            key={i}
            ref={(element) => {
              dots.current[i] = element;
            }}
            type="button"
            aria-label={getDotLabel(i, count)}
            aria-current={active ? "true" : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => select(i)}
            data-slot="carousel-dot"
            data-active={active ? "" : undefined}
            className={cn(
              "group/dot grid shrink-0 place-items-center rounded-full outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
              step.hit,
            )}
          >
            <motion.span
              layout
              transition={travel}
              // Radius as a style so layout animation corrects it while the dot scales.
              style={{ borderRadius: 9999 }}
              className={cn(
                "relative block overflow-clip transition-colors duration-(--duration-fast)",
                active ? step.pill : step.dot,
                active && !autoplay
                  ? "bg-foreground"
                  : "bg-[color-mix(in_oklab,var(--foreground)_22%,transparent)]",
                !active &&
                  "group-hover/dot:bg-[color-mix(in_oklab,var(--foreground)_45%,transparent)]",
              )}
            >
              {active && autoplay && count > 1 ? (
                <span
                  // Re-keyed per slide and per period, so each slide starts empty.
                  key={`${current}:${interval}`}
                  aria-hidden
                  data-slot="carousel-dot-fill"
                  onAnimationEnd={advance}
                  className={cn(
                    "absolute inset-0 origin-left bg-foreground rtl:origin-right",
                    // Reduced motion hides the fill but keeps its clock.
                    reduce && "invisible",
                  )}
                  style={{
                    animation: `${FILL_KEYFRAMES} ${interval}ms linear forwards`,
                    animationPlayState: running ? "running" : "paused",
                  }}
                />
              ) : null}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
