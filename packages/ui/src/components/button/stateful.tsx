import { Check, Loader2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { forwardRef, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { sizeTokens, useSizeContext } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { Button, type ButtonProps, resolveButtonSize } from "./base";

export type ButtonState = "idle" | "loading" | "success" | "error";

export interface StatefulButtonProps extends Omit<ButtonProps, "children"> {
  state?: ButtonState;
  children: ReactNode;
  loadingText?: ReactNode;
  successText?: ReactNode;
  errorText?: ReactNode;
  icon?: ReactNode;
}

const CASCADE_STAGGER = 0.025;
const ROLL_BLUR = "blur(6px)";

const CASCADE_LETTER_VARIANTS: Variants = {
  initial: { opacity: 0, y: "105%", filter: ROLL_BLUR },
  animate: (delay: number = 0) => ({
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: { ...spring.fast, delay },
  }),
  exit: (delay: number = 0) => ({
    opacity: 0,
    y: "-105%",
    filter: ROLL_BLUR,
    transition: { ...springExit.fast, delay: delay * 0.5 },
  }),
};

const ICON_VARIANTS: Variants = {
  // Width collapses too, so the row width doesn't pop in one frame.
  initial: { opacity: 0, width: 0, scale: 0.7, filter: ROLL_BLUR },
  animate: (width: number) => ({
    opacity: 1,
    width,
    scale: 1,
    filter: "blur(0px)",
    transition: spring.fast,
  }),
  exit: {
    opacity: 0,
    width: 0,
    scale: 0.7,
    filter: ROLL_BLUR,
    transition: springExit.fast,
  },
};

function IconSlot({
  keyId,
  width,
  children,
}: {
  keyId: string;
  width: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      key={keyId}
      variants={ICON_VARIANTS}
      custom={width}
      initial={reduce ? { opacity: 0, width } : "initial"}
      animate={reduce ? { opacity: 1, width } : "animate"}
      exit={reduce ? { opacity: 0, transition: springExit.fast } : "exit"}
      transition={reduce ? spring.fast : undefined}
      className="inline-grid shrink-0 place-items-center overflow-hidden"
    >
      {children}
    </motion.span>
  );
}

function TextSlot({ value, children }: { value: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();
  const label = typeof children === "string" ? children : null;
  const cascade = label !== null && !reduce;

  // Measure per letter like the cascade: whole-string kerning is narrower and clips the last glyph.
  useLayoutEffect(() => {
    const nextWidth = measureRef.current?.offsetWidth;
    if (!nextWidth) return;
    setWidth((current) => (current === nextWidth ? current : nextWidth));
  }, [children, cascade]);

  return (
    <motion.span
      initial={false}
      animate={{ width }}
      transition={reducedTransition(spring.fast, reduce)}
      className="relative inline-block overflow-hidden align-bottom whitespace-nowrap"
    >
      <span ref={measureRef} aria-hidden className="invisible inline-block whitespace-nowrap">
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
          <span className="sr-only">{label}</span>
          <AnimatePresence initial={false}>
            <motion.span
              key={`cascade-${value}`}
              aria-hidden
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute top-0 left-0 inline-block whitespace-pre"
            >
              {label.split("").map((char, index) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: position is the slot identity.
                  key={index}
                  custom={index * CASCADE_STAGGER}
                  variants={CASCADE_LETTER_VARIANTS}
                  className="inline-block whitespace-pre"
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
            key={`text-${value}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: ROLL_BLUR }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0, transition: springExit.fast }
                : { opacity: 0, y: -14, filter: ROLL_BLUR, transition: springExit.fast }
            }
            transition={spring.fast}
            className="absolute top-0 left-0 inline-block"
          >
            {children}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.span>
  );
}

export const StatefulButton = forwardRef<HTMLButtonElement, StatefulButtonProps>(
  function StatefulButton(
    {
      state = "idle",
      children,
      loadingText = "Loading",
      successText = "Done",
      errorText = "Try again",
      icon,
      disabled,
      size,
      square,
      ...rest
    },
    ref,
  ) {
    const context = useSizeContext();
    const { step } = resolveButtonSize(size, square, context?.size);
    const tokens = sizeTokens(step);
    const iconWidth = tokens.icon + (step === "compact" ? 4 : 8);
    const isBusy = state === "loading";
    const stateText =
      state === "loading"
        ? loadingText
        : state === "success"
          ? successText
          : state === "error"
            ? errorText
            : children;
    const textKey = typeof stateText === "string" ? `${state}-${stateText}` : state;

    return (
      <Button
        ref={ref}
        size={size}
        square={square}
        disabled={disabled || isBusy}
        aria-busy={isBusy}
        {...rest}
      >
        <span
          aria-live="polite"
          className="relative inline-flex items-center justify-center overflow-hidden"
        >
          <AnimatePresence initial={false}>
            {state === "loading" ? (
              <IconSlot keyId="loading-icon" width={iconWidth}>
                <Loader2 size={tokens.icon} className="animate-spin" />
              </IconSlot>
            ) : null}
            {state === "success" ? (
              <IconSlot keyId="success-icon" width={iconWidth}>
                <Check size={tokens.icon} />
              </IconSlot>
            ) : null}
            {state === "error" ? (
              <IconSlot keyId="error-icon" width={iconWidth}>
                <X size={tokens.icon} />
              </IconSlot>
            ) : null}
          </AnimatePresence>

          <TextSlot value={textKey}>{stateText}</TextSlot>

          <AnimatePresence initial={false}>
            {state === "idle" && icon ? (
              <IconSlot keyId="idle-icon" width={iconWidth}>
                {icon}
              </IconSlot>
            ) : null}
          </AnimatePresence>
        </span>
      </Button>
    );
  },
);
