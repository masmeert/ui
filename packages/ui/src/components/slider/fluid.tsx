import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

import { SPRING_GLIDE } from "@/lib/ease";
import { type Size, useSize } from "@/lib/size";
import { spring } from "@/lib/springs";
import { type SliderOptions, useSlider } from "@/hooks/use-slider";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "cn";

export interface FluidSliderProps extends SliderOptions {
  label?: string;
  format?: (value: number) => string;
  size?: Size;
  className?: string;
}

// The whole pill is the control, so it sits a step above the bounded controls.
const PILL_HEIGHT: Record<Size, string> = { compact: "h-10", default: "h-12", large: "h-14" };

/** Thumbless slider: the whole pill is the control, and the label inverts under the fill. */
export function FluidSlider({
  label,
  // Already snapped to the step; rounding would disagree with aria-valuenow.
  format = (v) => `${v}%`,
  size,
  className,
  ...options
}: FluidSliderProps) {
  const reduce = useReducedMotion();
  const tokens = useSize(size);
  const { percent, current, dragging, trackProps, sliderProps } = useSlider({
    ...options,
    formatValueText: options.formatValueText ?? format,
  });

  const target = useMotionValue(percent);
  useEffect(() => {
    target.set(percent);
  }, [percent, target]);
  const smooth = useSpring(target, SPRING_GLIDE);
  const pos = reduce ? target : smooth;
  // Clip rather than animate width: no sub-pixel hairline at 0%, and the label never re-lays out.
  const uncovered = useTransform(pos, (v) => 100 - v);
  const clipPath = useMotionTemplate`inset(0 ${uncovered}% 0 0 round 9999px)`;

  const row = (
    <>
      {label ? <span className="truncate">{label}</span> : <span />}
      <span className="tabular-nums">{format(current)}</span>
    </>
  );

  return (
    <motion.div
      {...trackProps}
      animate={reduce ? undefined : { scale: dragging ? 1.03 : 1 }}
      transition={spring.fast}
      className={cn(
        "relative flex w-full touch-none overflow-hidden rounded-full bg-muted",
        PILL_HEIGHT[tokens.size],
        TOUCH_GESTURE_CLASS,
        options.disabled ? "pointer-events-none opacity-50" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-between px-5 font-medium text-foreground",
          tokens.text,
        )}
      >
        {row}
      </div>

      {/* The same label clipped with the fill, so it inverts glyph for glyph. */}
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <div className="absolute inset-0 bg-foreground" />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-between px-5 font-medium text-background",
            tokens.text,
          )}
        >
          {row}
        </div>
      </motion.div>

      {/* Inset ring: an outset one is clipped by the track's overflow-hidden. */}
      <button
        type="button"
        {...sliderProps}
        className="absolute inset-0 touch-none rounded-full ring-ring outline-none ring-inset focus-visible:ring-4"
      />
    </motion.div>
  );
}
