import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

import { type SliderOptions, useSlider } from "@/hooks/use-slider";
import { type Size, useSize } from "@/lib/size";
import { INSTANT } from "@/lib/springs";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "cn";

// Physics, not a tier: retargeted on every drag step, soft enough that the crest wobbles.
const SPRING_BAR = { type: "spring", stiffness: 420, damping: 20, mass: 0.5 } as const;
const BARS = 32;
/** Crest width in bars. */
const SPREAD = 2.6;

export interface WaveSliderProps extends SliderOptions {
  bars?: number;
  size?: Size;
  className?: string;
}

const HEIGHT: Record<Size, { track: string; bar: string }> = {
  compact: { track: "h-14", bar: "h-10" },
  default: { track: "h-20", bar: "h-14" },
  large: { track: "h-24", bar: "h-18" },
};

/** Equalizer slider: bars rise into a crest around the value. */
export function WaveSlider({ bars = BARS, size, className, ...options }: WaveSliderProps) {
  const reduce = useReducedMotion();
  const height = HEIGHT[useSize(size).size];
  const { percent, dragging, trackProps, sliderProps } = useSlider(options);

  const keys = useMemo(() => Array.from({ length: bars }, (_, i) => `bar-${i}`), [bars]);

  const head = (percent / 100) * (bars - 1);
  const lanes = keys.map((key, i) => {
    const distance = Math.abs(i - head);
    return {
      key,
      distance,
      crest: Math.exp(-(distance ** 2) / (2 * SPREAD ** 2)),
      filled: i <= Math.round(head),
    };
  });

  return (
    <div
      {...trackProps}
      className={cn(
        "relative flex w-full touch-none items-center justify-between gap-1",
        height.track,
        TOUCH_GESTURE_CLASS,
        options.disabled ? "pointer-events-none opacity-50" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {lanes.map((lane) => (
        <motion.span
          key={lane.key}
          className={cn(
            "flex-1 origin-center rounded-full",
            height.bar,
            // /45 clears the 3:1 non-text contrast floor in both themes.
            lane.filled ? "bg-foreground" : "bg-foreground/45",
          )}
          animate={{
            scaleY: reduce ? 0.4 : 0.22 + lane.crest * (dragging ? 0.78 : 0.6),
          }}
          // No ripple delay while dragging: a delayed retarget freezes far bars behind the crest.
          transition={
            reduce
              ? INSTANT
              : { ...SPRING_BAR, delay: dragging ? 0 : Math.min(lane.distance * 0.012, 0.12) }
          }
        />
      ))}

      <button
        type="button"
        {...sliderProps}
        className="absolute inset-0 touch-none rounded-xl ring-ring outline-none focus-visible:ring-4"
      />
    </div>
  );
}
