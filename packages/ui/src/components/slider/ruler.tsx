import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { type KeyboardEvent, useEffect, useRef } from "react";

import { type SliderOptions, snapSliderValue, useSlider } from "@/hooks/use-slider";
import { type Size, useSize } from "@/lib/size";
import { spring } from "@/lib/springs";
import { TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "cn";

export interface RulerSliderProps extends SliderOptions {
  /** Pixels between two steps. */
  gap?: number;
  /** Label every Nth step; those ticks are drawn tall. */
  majorEvery?: number;
  unit?: string;
  /** Sizes the readout text only; the scale keeps its geometry. */
  size?: Size;
  className?: string;
}

/** The scale scrolls under a fixed needle; flicks carry momentum and settle on a tick. */
export function RulerSlider({
  gap = 14,
  majorEvery = 5,
  unit,
  size,
  className,
  ...options
}: RulerSliderProps) {
  const reduce = useReducedMotion();
  const tokens = useSize(size);
  // Fixed decimals keep the readout from jittering; tick labels stay trimmed.
  // Reads 0 decimals for an exponential step (1e-7); no such ruler is legible anyway.
  const decimals = String(options.step ?? 1).split(".")[1]?.length ?? 0;
  const readout = (value: number) => value.toFixed(decimals);

  const { current, min, max, step, commit, sliderProps } = useSlider({
    ...options,
    formatValueText: options.formatValueText ?? (unit ? (v) => `${readout(v)} ${unit}` : undefined),
  });

  // The range may not divide by the step: ticks stop at the last whole one and max gets its own.
  const span = Number(((max - min) / step).toFixed(6));
  const wholeSteps = Math.floor(span);
  const remainder = span - wholeSteps;
  const maxOffset = span * gap;
  const x = useMotionValue(-((current - min) / step) * gap);
  // While dragging or coasting, x owns the value; otherwise the value owns x.
  const interacting = useRef(false);
  // Keeps a cancelled momentum's transition end from snapping under a fresh grab.
  const holding = useRef(false);
  // Bumped per gesture so a late snap can't clear `interacting` under an active drag.
  const gesture = useRef(0);

  // Every tick is in the DOM; fine to a few hundred. Ticks are absolutely offset
  // because max can sit inside the previous tick's box, where flex can't centre it.
  const ticks = Array.from({ length: wholeSteps + 1 }, (_, i) => ({
    // toFixed trims float dust (0.1 + 0.2).
    value: Number((min + i * step).toFixed(6)),
    major: i % majorEvery === 0,
    offset: i * gap,
  }));
  if (remainder > 0) ticks.push({ value: max, major: true, offset: maxOffset });

  const snapToTick = () => {
    const target = snapSliderValue(min + (-x.get() / gap) * step, min, max, step);
    const snapped = -((target - min) / step) * gap;
    const id = ++gesture.current;
    if (reduce) {
      x.set(snapped);
      interacting.current = false;
      return;
    }
    void animate(x, snapped, spring.moderate).then(() => {
      if (gesture.current === id) interacting.current = false;
    });
  };

  // A key press stops momentum; otherwise the coasting strip swallows the key's value.
  const rootProps = {
    ...sliderProps,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      x.stop();
      gesture.current++;
      interacting.current = false;
      holding.current = false;
      sliderProps.onKeyDown(event);
    },
  };

  useEffect(() => {
    if (interacting.current) return;
    x.set(-((current - min) / step) * gap);
  }, [current, min, step, gap, x]);

  useMotionValueEvent(x, "change", (v) => {
    if (!interacting.current) return;
    commit(min + (-v / gap) * step);
  });

  return (
    <div
      {...rootProps}
      className={cn(
        "relative w-full touch-none overflow-hidden",
        TOUCH_GESTURE_CLASS,
        options.disabled ? "pointer-events-none opacity-50" : "cursor-grab active:cursor-grabbing",
        "rounded-2xl ring-ring outline-none focus-visible:ring-4",
        className,
      )}
    >
      <div className="pointer-events-none flex items-baseline justify-center gap-1 pt-1 pb-3">
        <span className={cn("font-bold text-foreground tabular-nums", tokens.type.display)}>
          {readout(current)}
        </span>
        {unit ? (
          <span className={cn("text-muted-foreground", tokens.type.body)}>{unit}</span>
        ) : null}
      </div>

      {/* A mask, not a gradient overlay, so the fade works on any surface. */}
      <div className="relative h-12 [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]">
        <motion.div
          drag={options.disabled ? false : "x"}
          dragConstraints={{ left: -maxOffset, right: 0 }}
          dragElastic={0.03}
          dragMomentum={!reduce}
          // Coast straight onto a tick rather than lurching into place afterwards.
          dragTransition={{
            power: 0.22,
            timeConstant: 320,
            modifyTarget: (target) => Math.round(target / gap) * gap,
          }}
          onDragStart={() => {
            gesture.current++;
            interacting.current = true;
            holding.current = true;
          }}
          // Momentum end when there is momentum, drag end when there is not.
          onDragTransitionEnd={() => {
            if (!holding.current) snapToTick();
          }}
          onDragEnd={() => {
            holding.current = false;
            if (reduce) snapToTick();
          }}
          // Ticks are positioned, so the row needs an explicit width plus half a gap each side.
          style={{ x, marginLeft: -gap / 2, width: maxOffset + gap }}
          className="absolute inset-y-0 left-1/2"
        >
          {ticks.map((tick) => (
            <span
              key={tick.value}
              className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center pb-[18px]"
              style={{ left: tick.offset + gap / 2 }}
            >
              <span
                className={cn(
                  "w-px rounded-full",
                  // /45 clears the 3:1 non-text contrast floor in both themes.
                  tick.major ? "h-7 bg-foreground/70" : "h-3.5 bg-foreground/45",
                )}
              />
              {tick.major ? (
                <span
                  className={cn(
                    "absolute bottom-0 text-muted-foreground tabular-nums",
                    tokens.type.micro,
                  )}
                >
                  {tick.value}
                </span>
              ) : null}
            </span>
          ))}
        </motion.div>

        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2">
          <span className="block h-9 w-[3px] rounded-full bg-foreground" />
        </div>
      </div>
    </div>
  );
}
