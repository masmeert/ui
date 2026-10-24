import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { type Size, useSize } from "@/lib/size";
import { spring, springExit } from "@/lib/springs";
import { cn } from "cn";

export type InputClassNames = {
  root?: string;
  label?: string;
  field?: string;
  input?: string;
  leftIcon?: string;
  rightIcon?: string;
  successIcon?: string;
  errorMessage?: string;
};

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size"
> {
  size?: Size;
  /** The native `size` attribute (visible width in characters). */
  htmlSize?: number;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Truthy error triggers a shake, red border and (if a string) a message. */
  error?: string | boolean;
  reserveErrorLine?: boolean;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  classNames?: InputClassNames;
}

// A 20px radius on a 36px field would read as a pill.
const FIELD_RADIUS: Record<Size, string> = {
  compact: "rounded-lg",
  default: "rounded-lg",
  large: "rounded-xl",
};

// `controlPx` split per side so it can't override the icon clearance.
const ICON_INSET: Record<
  Size,
  { left: string; right: string; padLeft: string; padRight: string; pl: string; pr: string }
> = {
  compact: {
    left: "left-2.5",
    right: "right-2.5",
    padLeft: "pl-8",
    padRight: "pr-8",
    pl: "pl-2.5",
    pr: "pr-2.5",
  },
  default: {
    left: "left-3",
    right: "right-3",
    padLeft: "pl-9",
    padRight: "pr-9",
    pl: "pl-3",
    pr: "pr-3",
  },
  large: {
    left: "left-4",
    right: "right-4",
    padLeft: "pl-11",
    padRight: "pr-11",
    pl: "pl-4",
    pr: "pr-4",
  },
};

const ICON_SIZE: Record<Size, string> = {
  compact: "[&_svg]:size-3.5",
  default: "[&_svg]:size-4",
  large: "[&_svg]:size-[18px]",
};

// A button in the right slot is a full-height square, so its hit area is the whole edge.
const SLOT_BUTTON: Record<Size, string> = {
  compact: "[&_button]:size-8",
  default: "[&_button]:size-9",
  large: "[&_button]:size-11",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    value: valueProp,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    error,
    reserveErrorLine = false,
    success,
    leftIcon,
    rightIcon,
    className,
    classNames,
    disabled,
    id: idProp,
    type,
    size,
    htmlSize,
    ...rest
  },
  ref,
) {
  const tokens = useSize(size);
  const reactId = useId();
  const id = idProp ?? reactId;
  const reduce = useReducedMotion();

  const controlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = controlled ? (valueProp ?? "") : internal;

  const [focused, setFocused] = useState(false);

  const fieldRef = useRef<HTMLDivElement>(null);

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : null;

  const rightSlot = success ? null : rightIcon;

  useEffect(() => {
    if (!fieldRef.current || reduce || !hasError) return;
    // A keyframed shake, not travel to a target: its length is the gesture, not a tier.
    animate(fieldRef.current, { x: [0, -6, 6, -4, 4, -2, 0] }, { duration: 0.45 });
  }, [hasError, reduce]);

  const handleChange = (next: string) => {
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className, classNames?.root)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn("px-1 font-medium text-foreground", tokens.type.body, classNames?.label)}
        >
          {label}
        </label>
      ) : null}

      <div
        ref={fieldRef}
        data-state={hasError ? "error" : success ? "success" : focused ? "focused" : "idle"}
        className={cn(
          "relative overflow-hidden border transition-colors duration-(--duration-fast)",
          tokens.control,
          FIELD_RADIUS[tokens.size],
          "border-border",
          focused && !hasError && "border-brand/40",
          hasError && "border-destructive ring-2 ring-destructive/25",
          disabled && "opacity-60",
          classNames?.field,
        )}
      >
        {leftIcon ? (
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center text-muted-foreground",
              ICON_INSET[tokens.size].left,
              ICON_SIZE[tokens.size],
              classNames?.leftIcon,
            )}
          >
            {leftIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={id}
          type={type}
          size={htmlSize}
          value={value}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
          {...rest}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            "peer h-full w-full bg-transparent text-foreground caret-foreground outline-none",
            "placeholder:text-muted-foreground",
            tokens.field,
            leftIcon ? ICON_INSET[tokens.size].padLeft : ICON_INSET[tokens.size].pl,
            rightSlot || success ? ICON_INSET[tokens.size].padRight : ICON_INSET[tokens.size].pr,
            disabled && "cursor-not-allowed",
            classNames?.input,
          )}
        />

        {success ? (
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-(--color-success)",
              ICON_INSET[tokens.size].right,
              tokens.size === "compact" ? "size-4" : "size-5",
              classNames?.successIcon,
            )}
          >
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={spring.moderate}
            />
          </motion.svg>
        ) : rightSlot ? (
          <span
            className={cn(
              "absolute top-0 right-0 flex h-full items-center text-muted-foreground [&_button]:grid [&_button]:place-items-center",
              SLOT_BUTTON[tokens.size],
              ICON_SIZE[tokens.size],
              classNames?.rightIcon,
            )}
          >
            {rightSlot}
          </span>
        ) : null}
      </div>

      <div className={reserveErrorLine ? "min-h-4" : "contents"}>
        <AnimatePresence initial={false}>
          {errorMessage ? (
            <motion.p
              id={`${id}-error`}
              role="alert"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0, transition: springExit.fast }
                  : { opacity: 0, y: -4, filter: "blur(4px)", transition: springExit.fast }
              }
              transition={spring.fast}
              className={cn("px-1 text-destructive", tokens.type.caption, classNames?.errorMessage)}
            >
              {errorMessage}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
});
