import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { type Size, useSize } from "@/lib/size";
import { spring, springExit, tierTween } from "@/lib/springs";
import { cn } from "cn";

export type ActionSwapItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
};

export type ActionSwapButtonVariant = "primary" | "secondary" | "outline" | "ghost";
/** `icon` is a square button at the surrounding size. */
export type ActionSwapButtonSize = Size | "icon";
export type ActionSwapAnimation = "blur" | "roll" | "cascade";

type CoreAnimation = "blur" | "roll";

export interface ActionSwapButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children" | "onChange"
> {
  items: ActionSwapItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, item: ActionSwapItem) => void;
  variant?: ActionSwapButtonVariant;
  size?: ActionSwapButtonSize;
  animation?: ActionSwapAnimation;
  iconOnly?: boolean;
  cycle?: boolean;
}

export interface ActionSwapTextProps {
  value: string;
  children: ReactNode;
  animation?: ActionSwapAnimation;
  className?: string;
}

export interface ActionSwapIconProps {
  value: string;
  children: ReactNode;
  animation?: ActionSwapAnimation;
  className?: string;
}

// Tweens: filter strings snap at the end of a spring's settling tail.
const BLUR_TRANSITION = tierTween.moderate;
const ROLL_TRANSITION = tierTween.moderate;
const EXIT_TRANSITION = springExit.moderate;
const SWAP_BLUR = "blur(8px)";
const ROLL_BLUR = "blur(3px)";

// Leaving and landing strings are independent layers, so proportional glyph widths never jitter.
const CASCADE_STAGGER = 0.025;

const CASCADE_LETTER_VARIANTS: Variants = {
  initial: { opacity: 0, transform: "translateY(105%)", filter: ROLL_BLUR },
  animate: (delay: number = 0) => ({
    opacity: 1,
    transform: "translateY(0%)",
    filter: "blur(0px)",
    transition: { ...tierTween.moderate, delay },
  }),
  exit: (delay: number = 0) => ({
    opacity: 0,
    transform: "translateY(-105%)",
    filter: ROLL_BLUR,
    transition: { ...springExit.moderate, delay: delay * 0.5 },
  }),
};

const TEXT_VARIANTS: Record<CoreAnimation, Variants> = {
  blur: {
    initial: { opacity: 0, transform: "scale(0.94)", filter: SWAP_BLUR },
    animate: {
      opacity: 1,
      transform: "scale(1)",
      filter: "blur(0px)",
      transition: BLUR_TRANSITION,
    },
    exit: {
      opacity: 0,
      transform: "scale(0.94)",
      filter: SWAP_BLUR,
      transition: EXIT_TRANSITION,
    },
  },
  roll: {
    initial: { opacity: 0, transform: "translateY(90%)", filter: ROLL_BLUR },
    animate: {
      opacity: 1,
      transform: "translateY(0%)",
      filter: "blur(0px)",
      transition: ROLL_TRANSITION,
    },
    exit: {
      opacity: 0,
      transform: "translateY(-90%)",
      filter: ROLL_BLUR,
      transition: EXIT_TRANSITION,
    },
  },
};

const ICON_VARIANTS: Record<CoreAnimation, Variants> = {
  blur: {
    initial: { opacity: 0, transform: "scale(0.9)", filter: SWAP_BLUR },
    animate: {
      opacity: 1,
      transform: "scale(1)",
      filter: "blur(0px)",
      transition: BLUR_TRANSITION,
    },
    exit: {
      opacity: 0,
      transform: "scale(0.9)",
      filter: SWAP_BLUR,
      transition: EXIT_TRANSITION,
    },
  },
  roll: {
    initial: { opacity: 0, transform: "translateY(12px)", filter: ROLL_BLUR },
    animate: {
      opacity: 1,
      transform: "translateY(0px)",
      filter: "blur(0px)",
      transition: ROLL_TRANSITION,
    },
    exit: {
      opacity: 0,
      transform: "translateY(-12px)",
      filter: ROLL_BLUR,
      transition: EXIT_TRANSITION,
    },
  },
};

const REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: spring.moderate },
  exit: { opacity: 0, transition: springExit.moderate },
};

const VARIANT_CLASS: Record<ActionSwapButtonVariant, string> = {
  primary: "sheen bg-primary text-primary-foreground",
  secondary: "border border-border bg-card text-foreground hover:border-border",
  outline: "border border-border bg-transparent text-foreground hover:bg-hover",
  ghost: "text-muted-foreground hover:bg-hover hover:text-foreground",
};

const ICON_CLASS: Record<Size, string> = {
  compact: "size-3.5",
  default: "size-4",
  large: "size-[18px]",
};

export function ActionSwapText({
  value,
  children,
  animation = "blur",
  className,
}: ActionSwapTextProps) {
  const reduce = useReducedMotion();

  // Cascade needs a plain string; otherwise (or with reduced motion) it falls back to roll.
  const label = typeof children === "string" ? children : null;
  const cascade = animation === "cascade" && label !== null && !reduce;
  const coreAnimation: CoreAnimation = animation === "cascade" ? "roll" : animation;

  return (
    <span
      className={cn(
        "relative -my-[0.08em] inline-block max-w-full py-[0.08em] align-bottom whitespace-nowrap",
        className,
      )}
      style={{
        clipPath: "inset(0 -999px)",
        WebkitClipPath: "inset(0 -999px)",
      }}
    >
      <span aria-hidden className="invisible inline-block whitespace-nowrap">
        {cascade
          ? label.split("").map((char, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity.
                key={index}
                className="inline-block whitespace-pre"
              >
                {char}
              </span>
            ))
          : children}
      </span>
      {cascade ? (
        <>
          {/* Letters are decorative fragments; readers get the whole label. */}
          <span className="sr-only">{label}</span>
          <AnimatePresence initial={false}>
            <motion.span
              key={`cascade-${value}`}
              aria-hidden
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute top-[0.08em] left-0 inline-block whitespace-pre"
            >
              {label.split("").map((char, i) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity — the letter at a position is exactly what rolls.
                  key={i}
                  custom={i * CASCADE_STAGGER}
                  variants={CASCADE_LETTER_VARIANTS}
                  className="inline-block whitespace-pre will-change-[opacity,filter,transform]"
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </>
      ) : (
        <AnimatePresence initial={false}>
          <motion.span
            key={`${animation}-${value}`}
            variants={reduce ? REDUCED_VARIANTS : TEXT_VARIANTS[coreAnimation]}
            initial="initial"
            animate="animate"
            exit="exit"
            // Truncate on the moving layer, so clipping never eats the roll.
            className="absolute top-[0.08em] left-0 inline-block max-w-full truncate will-change-[opacity,filter,transform]"
          >
            {children}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}

export function ActionSwapIcon({
  value,
  children,
  animation = "blur",
  className,
}: ActionSwapIconProps) {
  const reduce = useReducedMotion();
  const coreAnimation: CoreAnimation = animation === "cascade" ? "roll" : animation;

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden [&_svg]:size-full",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${animation}-${value}`}
          aria-hidden
          variants={reduce ? REDUCED_VARIANTS : ICON_VARIANTS[coreAnimation]}
          initial="initial"
          animate="animate"
          exit="exit"
          className="col-start-1 row-start-1 inline-flex items-center justify-center will-change-[opacity,filter,transform]"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function ActionSwapButton({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "secondary",
  size,
  animation = "blur",
  iconOnly = size === "icon",
  cycle = true,
  className,
  disabled,
  onClick,
  ...rest
}: ActionSwapButtonProps) {
  const reduce = useReducedMotion();
  const t = useSize(size === "icon" ? undefined : size);
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id);
  const currentValue = value ?? internalValue;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === currentValue),
  );
  const activeItem = items[activeIndex] ?? items[0];
  const hasIcon = items.some((item) => item.icon);
  const nextItem = cycle && items.length > 0 ? items[(activeIndex + 1) % items.length] : undefined;

  if (!activeItem) return null;

  const accessibleLabel =
    activeItem.ariaLabel ??
    (iconOnly && typeof activeItem.label === "string" ? activeItem.label : undefined);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
      transition={spring.fast}
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-colors duration-(--duration-fast)",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASS[variant],
        size === "icon" ? t.square : [t.control, t.controlPx, t.gap, t.text],
        className,
      )}
      aria-label={accessibleLabel}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled || !cycle || !nextItem) return;
        if (value === undefined) setInternalValue(nextItem.id);
        onValueChange?.(nextItem.id, nextItem);
      }}
      {...rest}
    >
      {hasIcon ? (
        <ActionSwapIcon value={activeItem.id} animation={animation} className={ICON_CLASS[t.size]}>
          {activeItem.icon ?? null}
        </ActionSwapIcon>
      ) : null}
      {!iconOnly ? (
        <ActionSwapText value={activeItem.id} animation={animation}>
          {activeItem.label}
        </ActionSwapText>
      ) : null}
    </motion.button>
  );
}
