import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { type HTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { cn } from "cn";
import { TextShimmer } from "@/components/text-shimmer";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";

// Every shape samples the same rays from the centre, so morphing is a per-number lerp
// whose points never cross. The round stroke join rounds the corners.
const SAMPLES = 72;
const CENTER = 12;

type Polar = (angle: number) => number;

const circle: Polar = () => 7.5;

/** Superellipse, n=4. */
const squircle: Polar = (angle) => {
  const n = 4;
  const c = Math.abs(Math.cos(angle)) ** n;
  const s = Math.abs(Math.sin(angle)) ** n;
  return 7 / (c + s) ** (1 / n);
};

/** Drawn pointing down: it shows at the half-turn of the tumble, so it lands pointing up. */
const triangle: Polar = (angle) => {
  const apothem = 4.6;
  // Edge normals point up, lower-left and lower-right (SVG y grows downward).
  const sector = (2 * Math.PI) / 3;
  const offset = angle + Math.PI / 2;
  const local = (((offset % sector) + sector + sector / 2) % sector) - sector / 2;
  return apothem / Math.cos(local);
};

function samplePoints(shape: Polar): number[] {
  const points: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const angle = (i / SAMPLES) * Math.PI * 2;
    const r = shape(angle);
    points.push(CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle));
  }
  return points;
}

/** Ends on the first shape again so the loop wraps without a jump. */
const SHAPES = [samplePoints(circle), samplePoints(squircle), samplePoints(triangle)];
const LOOP = [...SHAPES, SHAPES[0]!];

function toPath(points: readonly number[]): string {
  let d = "";
  for (let i = 0; i < points.length; i += 2) {
    d += `${i === 0 ? "M" : "L"}${points[i]!.toFixed(2)} ${points[i + 1]!.toFixed(2)}`;
  }
  return `${d}Z`;
}

function pathAt(progress: number): string {
  const clamped = Math.max(0, Math.min(LOOP.length - 1, progress));
  const index = Math.min(Math.floor(clamped), LOOP.length - 2);
  const t = clamped - index;
  const from = LOOP[index]!;
  const to = LOOP[index + 1]!;
  return toPath(from.map((value, i) => value + (to[i]! - value) * t));
}

const STATIC_PATH = toPath(SHAPES[0]!);

const SHAPE_DWELL_MS = 900;

export interface ThinkingGlyphProps {
  /** Defaults to the size step's icon. */
  pixelSize?: number;
  size?: Size;
  className?: string;
}

export function ThinkingGlyph({ pixelSize, size, className }: ThinkingGlyphProps) {
  const tokens = useSize(size);
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const d = useTransform(progress, pathAt);
  const rotate = useTransform(progress, (value) => value * 90);

  useEffect(() => {
    if (reduce) return;
    let step = 0;
    let controls: ReturnType<typeof animate> | undefined;
    const timer = window.setInterval(() => {
      step += 1;
      if (step > LOOP.length - 1) {
        // The last shape is the first one again: snap back unseen and keep going.
        progress.jump(0);
        step = 1;
      }
      controls = animate(progress, step, spring.moderate);
    }, SHAPE_DWELL_MS);
    return () => {
      window.clearInterval(timer);
      controls?.stop();
    };
  }, [progress, reduce]);

  const px = pixelSize ?? tokens.icon;
  return (
    <svg
      aria-hidden
      data-slot="thinking-glyph"
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className={cn("shrink-0 text-foreground", className)}
    >
      {reduce ? (
        <path d={STATIC_PATH} fill="currentColor" stroke="currentColor" strokeWidth={2} />
      ) : (
        <motion.path
          d={d}
          style={{ rotate, originX: "50%", originY: "50%", transformBox: "fill-box" }}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export interface ThinkingIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The status. A list cycles through its entries every `interval` ms. */
  label?: ReactNode | readonly string[];
  /** Milliseconds each entry of a `label` list stays up. Default 2400. */
  interval?: number;
  shimmer?: boolean;
  hideGlyph?: boolean;
  size?: Size;
}

// The visible text is aria-hidden because the outgoing line lingers during the crossfade;
// the live region carries the current status alone.
export function ThinkingIndicator({
  label = "Thinking",
  interval = 2400,
  shimmer = true,
  hideGlyph = false,
  size,
  className,
  ...props
}: ThinkingIndicatorProps) {
  const tokens = useSize(size);
  const reduce = useReducedMotion();
  const labels = Array.isArray(label) ? (label as readonly string[]) : null;
  const [index, setIndex] = useState(0);
  const count = labels?.length ?? 0;

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [count, interval]);

  const current: ReactNode = labels ? labels[index % Math.max(count, 1)] : (label as ReactNode);
  const key = labels
    ? `${index % Math.max(count, 1)}`
    : typeof label === "string"
      ? label
      : "label";

  return (
    <div
      data-slot="thinking-indicator"
      className={cn("inline-flex min-w-0 items-center", tokens.gap, tokens.text, className)}
      {...props}
    >
      {hideGlyph ? null : <ThinkingGlyph size={size} />}
      <span aria-hidden className="relative inline-grid min-w-0">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={key}
            className="col-start-1 row-start-1 truncate"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: springExit.fast }}
            transition={reducedTransition(spring.fast, reduce)}
          >
            {shimmer ? (
              <TextShimmer className="max-w-full truncate align-bottom">{current}</TextShimmer>
            ) : (
              <span className="text-muted-foreground">{current}</span>
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span role="status" aria-live="polite" aria-atomic className="sr-only">
        {current}
      </span>
    </div>
  );
}
