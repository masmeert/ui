import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect } from "react";

import { SPRING_GLIDE } from "@/lib/ease";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { type SliderOptions, useSlider } from "@/hooks/use-slider";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "cn";

// Physics, not a tier: loose enough that the bubble keeps leaning after the pointer stops.
const SPRING_TILT = { stiffness: 260, damping: 22, mass: 0.4 } as const;
/** Drag speed (px/s of track percent) that maxes out lean and squash. */
const FULL_TILT = 320;

export interface BubbleSliderProps extends SliderOptions {
  format?: (value: number) => string;
  size?: Size;
  className?: string;
}

const PARTS: Record<Size, { track: string; thumb: string }> = {
  compact: { track: "h-1.5", thumb: "size-4" },
  default: { track: "h-2", thumb: "size-5" },
  large: { track: "h-2.5", thumb: "size-6" },
};

/** A value bubble pops out of the thumb on grab and leans with drag velocity. */
export function BubbleSlider({ format, size, className, ...options }: BubbleSliderProps) {
  const reduce = useReducedMotion();
  const tokens = useSize(size);
  const parts = PARTS[tokens.size];
  // A bare number needs no valueText — it would only repeat aria-valuenow.
  const { percent, current, dragging, trackProps, sliderProps } = useSlider({
    ...options,
    formatValueText: options.formatValueText ?? format,
  });
  // Already snapped to the step; rounding would disagree with aria-valuenow.
  const readout = format ? format(current) : current;

  const target = useMotionValue(percent);
  useEffect(() => {
    target.set(percent);
  }, [percent, target]);
  const smooth = useSpring(target, SPRING_GLIDE);
  const pos = reduce ? target : smooth;
  const left = useMotionTemplate`${pos}%`;

  // One spring drives both: lean is signed, squash reads its magnitude.
  const velocity = useVelocity(pos);
  const lean = useSpring(
    useTransform(velocity, [-FULL_TILT, 0, FULL_TILT], [1, 0, -1], { clamp: true }),
    SPRING_TILT,
  );
  const tilt = useTransform(lean, (v) => v * 16);
  const squash = useTransform(lean, (v) => 1 + Math.abs(v) * 0.18);
  const stretch = useTransform(lean, (v) => 1 - Math.abs(v) * 0.12);

  return (
    <div
      className={cn(
        // Room for the thumb, bubble and 48px hit area to overhang the track.
        "relative flex h-20 w-full items-end px-5 pb-5",
        options.disabled ? "pointer-events-none opacity-50" : undefined,
        className,
      )}
    >
      <div
        {...trackProps}
        className={cn(
          "relative w-full touch-none rounded-full bg-muted",
          parts.track,
          TOUCH_GESTURE_CLASS,
          options.disabled ? undefined : "cursor-grab active:cursor-grabbing",
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-foreground"
          style={{ width: left }}
        />

        <motion.div
          className={cn(
            "absolute top-1/2 rounded-full border-2 border-foreground bg-background shadow-sm",
            parts.thumb,
          )}
          style={{ left, x: "-50%", y: "-50%" }}
          animate={reduce ? undefined : { scale: dragging ? 1.25 : 1 }}
          transition={spring.fast}
        />

        <motion.div className="pointer-events-none absolute bottom-6" style={{ left, x: "-50%" }}>
          <AnimatePresence>
            {dragging ? (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 10 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduce
                    ? { opacity: 0, transition: springExit.fast }
                    : { opacity: 0, scale: 0.5, y: 8, transition: springExit.fast }
                }
                // No overshoot, so it doesn't fight the lean.
                transition={reducedTransition(spring.moderate, reduce)}
                style={
                  reduce ? undefined : { rotate: tilt, scaleX: squash, scaleY: stretch, originY: 1 }
                }
                className={cn(
                  "relative rounded-xl bg-foreground px-2.5 py-1 font-medium text-background tabular-nums shadow-surface-3",
                  tokens.text,
                )}
              >
                {readout}
                <span className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-foreground" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* Pads the hit area out to 48px. */}
        <button
          type="button"
          {...sliderProps}
          className="absolute inset-x-0 -inset-y-5 touch-none rounded-full ring-ring outline-none focus-visible:ring-4"
        />
      </div>
    </div>
  );
}
