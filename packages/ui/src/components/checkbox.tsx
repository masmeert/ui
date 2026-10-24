import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { useSize } from "@/lib/size";
import { INSTANT, reducedTransition, spring, springExit } from "@/lib/springs";
import { cn } from "cn";

const CHECK_PATH = "M5 13l4 4L19 7";
const INDETERMINATE_PATH = "M6 12h12";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  indeterminate,
  label,
  description,
  className,
  id: idProp,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: CheckboxProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const reduce = useReducedMotion();
  const tokens = useSize();
  const showMark = checked || indeterminate;
  const path = indeterminate ? INDETERMINATE_PATH : CHECK_PATH;

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <motion.button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        whileTap={reduce || disabled ? undefined : { scale: 0.95 }}
        transition={spring.fast}
        data-state={checked ? "checked" : indeterminate ? "indeterminate" : "unchecked"}
        data-checked={checked ? "" : undefined}
        data-unchecked={!checked && !indeterminate ? "" : undefined}
        data-indeterminate={indeterminate ? "" : undefined}
        className={cn(
          "inline-grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors duration-(--duration-fast) outline-none",
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          showMark
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50 bg-background hover:border-muted-foreground",
        )}
      >
        <AnimatePresence initial={false}>
          {showMark ? (
            <motion.svg
              key={indeterminate ? "indeterminate" : "checked"}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0, transition: springExit.fast }
                  : { opacity: 0, scale: 0.5, filter: "blur(4px)", transition: springExit.fast }
              }
              transition={reducedTransition(spring.fast, reduce)}
              aria-hidden
              className="col-start-1 row-start-1"
            >
              <title>{indeterminate ? "Partially selected" : "Selected"}</title>
              <motion.path
                d={path}
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={reduce ? INSTANT : spring.moderate}
              />
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </motion.button>
      {label ? (
        <span
          className={cn(
            "flex flex-col text-foreground select-none",
            tokens.type.body,
            disabled && "opacity-60",
          )}
        >
          {label}
          {description ? (
            <span className={cn("text-muted-foreground", tokens.type.caption)}>{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
