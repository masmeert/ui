import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";

import { SPRING_GLIDE } from "@/lib/ease";
import { type Size, useSize } from "@/lib/size";
import { spring } from "@/lib/springs";
import { type SliderOptions, useSlider } from "@/hooks/use-slider";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "cn";

export interface RangeSliderProps extends SliderOptions {
  showTicks?: boolean;
  size?: Size;
  className?: string;
}

const HANDLE_HEIGHT: Record<Size, string> = { compact: "h-5", default: "h-6", large: "h-8" };

export function RangeSlider({ showTicks = true, size, className, ...options }: RangeSliderProps) {
  const reduce = useReducedMotion();
  const tokens = useSize(size);
  const { percent, dragging, min, max, step, trackProps, sliderProps } = useSlider(options);
  const [trackWidth, setTrackWidth] = useState(292);
  useLayoutEffect(() => {
    const track = trackProps.ref.current;
    if (!track) return;
    // Layout width, not getBoundingClientRect: a parent scaling in shrinks the rect,
    // and ResizeObserver never re-fires for transforms.
    const measure = () => {
      const width = track.offsetWidth;
      if (width > 0) setTrackWidth(width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [trackProps.ref]);

  const target = useMotionValue(percent);
  useEffect(() => {
    target.set(percent);
  }, [percent, target]);
  const smooth = useSpring(target, SPRING_GLIDE);
  const pos = reduce ? target : smooth;
  const thumbX = useTransform(pos, (p) => 8 + (Math.max(0, trackWidth - 20) * p) / 100);
  // The 4px handle starts 8px inside the track and the fill extends 8px past it.
  // Translating a full-size fill inside the inset clip keeps its corner from stretching.
  const fillX = useTransform(pos, (p) =>
    p >= 100 ? "0%" : `calc(${p - 100}% + ${14 - 0.16 * p}px)`,
  );

  // Floor so an undivided range stops at the last whole step; toFixed first because
  // 0.3/0.1 is 2.9999999999999996.
  const steps = Math.floor(Number(((max - min) / step).toFixed(6)));
  const ticks =
    showTicks && steps > 0 && steps <= 50
      ? Array.from({ length: steps + 1 }, (_, i) => Number((min + i * step).toFixed(6)))
      : [];

  return (
    <div
      {...trackProps}
      className={cn(
        "relative flex w-full touch-none items-center overflow-hidden rounded-lg bg-muted",
        tokens.control,
        TOUCH_GESTURE_CLASS,
        options.disabled ? "pointer-events-none opacity-50" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[2px] inset-y-0 overflow-hidden rounded-lg"
      >
        <motion.div className="absolute inset-0 rounded-lg bg-foreground/15" style={{ x: fillX }} />
      </div>

      {/* Tick centres follow the same inset path as the handle centre. */}
      <div className="pointer-events-none absolute inset-x-[10px] inset-y-0">
        {ticks.map((t) => {
          const tp = ((t - min) / (max - min)) * 100;
          return (
            <span
              key={t}
              className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
              style={{ left: `${tp}%` }}
            />
          );
        })}
      </div>

      <motion.div
        {...sliderProps}
        animate={reduce ? undefined : { scaleY: dragging ? 1.15 : 1 }}
        transition={spring.fast}
        className={cn(
          "absolute top-1/2 left-0 w-1 rounded-full bg-foreground ring-foreground/30 outline-none ring-inset focus-visible:ring-4",
          HANDLE_HEIGHT[tokens.size],
        )}
        style={{ x: thumbX, y: "-50%" }}
      />
    </div>
  );
}
