import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { type MouseEvent, type ReactNode, useCallback, useRef, useState } from "react";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { cn } from "cn";

const CONTINUITY = { ...spring.moderate, scale: spring.fast };

const MIN_WIDTH: Record<Size, string> = {
  compact: "min-w-8",
  default: "min-w-9",
  large: "min-w-11",
};

// Control height minus the 4px padding on each side.
const ICON_SLOT: Record<Size, string> = {
  compact: "size-6",
  default: "size-7",
  large: "size-9",
};

const CONTINUITY_LABEL: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)", transition: springExit.fast },
};

type ExpandableStateProps = {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export interface ExpandableButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">, ExpandableStateProps {
  icon: ReactNode;
  label: ReactNode;
  size?: Size;
}

export interface ExpandableChipProps extends ExpandableStateProps {
  label: ReactNode;
  actionIcon: ReactNode;
  actionLabel: string;
  onAction?: () => void;
  collapseOnAction?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  actionClassName?: string;
  size?: Size;
}

function useExpandableState({
  expanded,
  defaultExpanded = false,
  onExpandedChange,
}: ExpandableStateProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const currentExpanded = expanded ?? internalExpanded;

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (!isControlled) {
        setInternalExpanded(nextExpanded);
      }
      onExpandedChange?.(nextExpanded);
    },
    [isControlled, onExpandedChange],
  );

  return [currentExpanded, setExpanded] as const;
}

export function ExpandableButton({
  icon,
  label,
  expanded,
  defaultExpanded,
  onExpandedChange,
  className,
  onClick,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
  size,
  ...props
}: ExpandableButtonProps) {
  const reduce = useReducedMotion();
  const t = useSize(size);
  const [isExpanded, setExpanded] = useExpandableState({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setExpanded(!isExpanded);
    }
  };

  const transition = reducedTransition(CONTINUITY, reduce);

  return (
    <motion.span layout transition={transition} className="inline-flex">
      <motion.button
        {...props}
        layout
        type={type}
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        aria-expanded={isExpanded}
        disabled={disabled}
        className={cn(
          "relative inline-flex items-center overflow-hidden rounded-full border border-border bg-transparent p-1 pr-1 font-medium text-foreground transition-colors duration-(--duration-fast) outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50",
          t.control,
          t.text,
          MIN_WIDTH[t.size],
          className,
        )}
        style={{ borderRadius: 9999 }}
        onClick={handleClick}
        whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
        transition={transition}
      >
        <motion.span
          layout="position"
          className={cn("grid shrink-0 place-items-center", ICON_SLOT[t.size])}
          aria-hidden="true"
          transition={transition}
        >
          {icon}
        </motion.span>
        <AnimatePresence mode="popLayout" initial={false}>
          {isExpanded ? (
            <motion.span
              key="label"
              layout
              variants={CONTINUITY_LABEL}
              initial={reduce ? { opacity: 0 } : "hidden"}
              animate={reduce ? { opacity: 1 } : "visible"}
              exit={reduce ? { opacity: 0 } : "exit"}
              transition={transition}
              className="relative inline-flex w-max items-center pr-3 whitespace-nowrap"
              aria-hidden="true"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>
    </motion.span>
  );
}

export function ExpandableChip({
  label,
  actionIcon,
  actionLabel,
  onAction,
  collapseOnAction = true,
  expanded,
  defaultExpanded,
  onExpandedChange,
  disabled,
  className,
  labelClassName,
  actionClassName,
  size,
}: ExpandableChipProps) {
  const reduce = useReducedMotion();
  const t = useSize(size);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setExpanded] = useExpandableState({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });

  const handleAction = () => {
    onAction?.();
    if (collapseOnAction) {
      setExpanded(false);
      triggerRef.current?.focus();
    }
  };

  const transition = reducedTransition(CONTINUITY, reduce);

  return (
    <motion.span layout transition={transition} className="inline-flex">
      <motion.div
        layout
        className={cn(
          "inline-flex items-center overflow-hidden rounded-full border border-border bg-transparent text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-inset",
          t.control,
          t.text,
          className,
        )}
        style={{ borderRadius: 9999 }}
        transition={transition}
      >
        <motion.button
          layout="position"
          ref={triggerRef}
          type="button"
          aria-expanded={isExpanded}
          disabled={disabled}
          className={cn(
            "h-full py-0 pl-3 font-medium whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50",
            isExpanded ? "pr-1" : "pr-3",
            labelClassName,
          )}
          onClick={() => setExpanded(!isExpanded)}
          transition={transition}
        >
          {label}
        </motion.button>
        {/* Needs `layout` or the chip's scale-based resize squashes it. Must not clip:
            it collapses to w-0 at once, and the chip's edge wipes the action away. */}
        <motion.span
          layout="position"
          variants={CONTINUITY_LABEL}
          className={cn(
            "relative inline-flex h-full shrink-0 items-center",
            isExpanded ? "w-8" : "w-0",
          )}
          aria-hidden={!isExpanded}
          initial={false}
          animate={reduce ? { opacity: isExpanded ? 1 : 0 } : isExpanded ? "visible" : "hidden"}
          transition={transition}
        >
          <motion.button
            type="button"
            aria-label={actionLabel}
            disabled={disabled || !isExpanded}
            className={cn(
              "flex h-full w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-(--duration-fast) outline-none hover:text-foreground disabled:pointer-events-none",
              disabled && "opacity-50",
              actionClassName,
            )}
            onClick={handleAction}
            whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
            transition={transition}
          >
            <span aria-hidden="true">{actionIcon}</span>
          </motion.button>
        </motion.span>
      </motion.div>
    </motion.span>
  );
}
