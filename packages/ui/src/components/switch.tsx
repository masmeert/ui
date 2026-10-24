import { animate, motion, MotionConfig, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";
import { cn } from "cn";

// The switch isn't a bounded control, so its track doesn't take the control height.
const TRACK: Record<Size, { track: string; thumb: string }> = {
  compact: { track: "h-5 w-9 px-0.5", thumb: "size-4" },
  default: { track: "h-7 w-12 px-1", thumb: "size-5" },
  large: { track: "h-8 w-14 px-1", thumb: "size-6" },
};

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
  size?: Size;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  ariaLabel,
  size,
  className,
  id: idProp,
}: SwitchProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const tokens = useSize(size);
  const parts = TRACK[tokens.size];
  const thumbRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    if (!thumbRef.current || reduce) return;
    if (disabled && isPressed) {
      // A keyframed shake: its length is the gesture, not a tier.
      animate(thumbRef.current, { x: [0, -2, 2, -1, 0] }, { delay: 0.2, duration: 0.6 });
    }
  }, [disabled, isPressed, reduce]);

  const squish = !disabled && isPointer && isPressed && !reduce;

  return (
    <MotionConfig transition={reducedTransition(spring.moderate, reduce)}>
      <span className={cn("inline-flex items-center gap-3", className)}>
        <motion.button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => !disabled && onCheckedChange(!checked)}
          onPointerDown={(e) => {
            setIsPressed(true);
            setIsPointer(e.type.startsWith("pointer"));
          }}
          onPointerUp={() => setIsPressed(false)}
          onPointerLeave={() => setIsPressed(false)}
          initial={false}
          data-state={checked ? "checked" : "unchecked"}
          data-checked={checked ? "" : undefined}
          data-unchecked={checked ? undefined : ""}
          data-size={tokens.size}
          className={cn(
            "group peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-(--duration-moderate) outline-none",
            parts.track,
            "focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-60",
            checked ? "justify-end bg-primary" : "justify-start bg-muted-foreground/60",
          )}
        >
          <motion.div
            ref={thumbRef}
            layout
            animate={{ scale: squish ? 0.9 : 1 }}
            transition={{ layout: reducedTransition(spring.moderate, reduce), scale: spring.fast }}
            className={cn(
              "pointer-events-none block rounded-full bg-background shadow-md",
              parts.thumb,
            )}
          >
            {/* Stretch toward the destination while active. */}
            <div className={cn(parts.thumb, squish && (checked ? "ml-1" : "mr-1"))} />
          </motion.div>
        </motion.button>
        {label ? (
          <label htmlFor={id} className={cn("cursor-pointer text-foreground", tokens.text)}>
            {label}
          </label>
        ) : null}
      </span>
    </MotionConfig>
  );
}
