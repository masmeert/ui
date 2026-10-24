import { AlertTriangle, Check, Circle, Info, LoaderCircle, X, type LucideIcon } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import type { ReactNode } from "react";
import { type Size, useSizeContext } from "@/lib/size";
import { spring, springExit } from "@/lib/springs";
import { typeClass } from "@/lib/type-scale";
import { cn } from "cn";

export type BadgeStatus = "neutral" | "info" | "success" | "warning" | "danger" | "loading";

/** Unset, follows the nearest `SizeProvider`; a `large` region gets `default`. */
export type BadgeSize = Extract<Size, "compact" | "default">;

export interface BadgeProps extends Omit<HTMLMotionProps<"span">, "children"> {
  status?: BadgeStatus;
  size?: BadgeSize;
  children?: ReactNode;
  icon?: ReactNode;
  showIcon?: boolean;
  pulse?: boolean;
  contentKey?: string | number;
}

const STATUS_CLASS: Record<BadgeStatus, string> = {
  neutral: "border-border bg-card text-muted-foreground",
  info: "border-brand/30 bg-muted text-brand",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  loading: "border-brand/30 bg-muted text-brand",
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  compact: cn("h-6 gap-1.5 px-2", typeClass("micro")),
  default: cn("h-8 gap-2 px-3", typeClass("caption")),
};

const ICON_CLASS: Record<BadgeSize, string> = {
  compact: "size-3",
  default: "size-3.5",
};

const ICONS: Record<BadgeStatus, LucideIcon> = {
  neutral: Circle,
  info: Info,
  success: Check,
  warning: AlertTriangle,
  danger: X,
  loading: LoaderCircle,
};

// No blur: the roll window clips it into hard-edged blocks.
const ROLL_VARIANTS: Variants = {
  initial: { opacity: 0, y: "70%" },
  animate: {
    opacity: 1,
    y: "0%",
    transition: spring.fast,
  },
  exit: {
    opacity: 0,
    y: "-70%",
    transition: springExit.fast,
  },
};

// Pill and contents must share a curve, or the contents' scale correction squishes them.
const LAYOUT_TRANSITION = spring.moderate;

export function Badge({
  status = "neutral",
  size: sizeProp,
  children,
  icon,
  showIcon = true,
  pulse = status === "loading",
  contentKey,
  className,
  style,
  ...rest
}: BadgeProps) {
  const reduce = useReducedMotion();
  const size = sizeProp ?? (useSizeContext()?.size === "compact" ? "compact" : "default");
  const Icon = ICONS[status];
  const resolvedContentKey =
    contentKey ??
    (typeof children === "string" || typeof children === "number" ? children : status);

  return (
    <motion.span
      layout
      transition={LAYOUT_TRANSITION}
      data-size={size}
      style={{ borderRadius: 9999, ...style }}
      className={cn(
        "relative inline-flex shrink-0 items-center overflow-hidden border font-medium whitespace-nowrap tabular-nums",
        // Same tier as the layout resize, so the status change lands as one.
        "transition-colors duration-(--duration-moderate)",
        STATUS_CLASS[status],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {pulse && !reduce ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-current opacity-10"
          animate={{ opacity: [0.06, 0.16, 0.06] }}
          // A slow breathing loop while loading, not a transition: no tier applies.
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {showIcon ? (
        <motion.span
          layout="position"
          transition={LAYOUT_TRANSITION}
          className="relative z-10 inline-flex items-center justify-center overflow-hidden"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              aria-hidden
              data-badge-icon
              variants={ROLL_VARIANTS}
              initial={reduce ? false : "initial"}
              animate={reduce ? { opacity: 1 } : "animate"}
              exit={reduce ? undefined : "exit"}
              className="inline-flex"
            >
              {status === "loading" && !reduce && !icon ? (
                // CSS, not Motion: under initial={false} a Motion rotate starts at its target and never turns.
                <span className="inline-flex animate-spin">
                  <Icon className={ICON_CLASS[size]} />
                </span>
              ) : (
                (icon ?? <Icon className={ICON_CLASS[size]} />)
              )}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      ) : null}
      {children != null ? (
        <motion.span
          layout="position"
          transition={LAYOUT_TRANSITION}
          className="relative z-10 inline-flex overflow-hidden"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={resolvedContentKey}
              data-badge-label
              variants={ROLL_VARIANTS}
              initial={reduce ? false : "initial"}
              animate={reduce ? { opacity: 1 } : "animate"}
              exit={reduce ? undefined : "exit"}
              className="inline-block"
            >
              {children}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      ) : null}
    </motion.span>
  );
}
