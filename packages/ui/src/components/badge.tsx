import { AlertTriangle, Check, Circle, Info, LoaderCircle, X, type LucideIcon } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "cn";

export type BadgeStatus = "neutral" | "info" | "success" | "warning" | "danger" | "loading";

export type BadgeSize = "sm" | "md";

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
  sm: "h-6 gap-1.5 px-2 text-[11px]",
  md: "h-8 gap-2 px-3 text-xs",
};

const ICON_CLASS: Record<BadgeSize, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
};

const ICONS: Record<BadgeStatus, LucideIcon> = {
  neutral: Circle,
  info: Info,
  success: Check,
  warning: AlertTriangle,
  danger: X,
  loading: LoaderCircle,
};

// A crisp roll: no blur, since the roll window clips its edges and a blur there smears into hard-edged blocks.
const ROLL_VARIANTS: Variants = {
  initial: { opacity: 0, y: "70%" },
  animate: {
    opacity: 1,
    y: "0%",
    transition: {
      y: { type: "spring", stiffness: 380, damping: 30, mass: 0.7 },
      opacity: { duration: 0.18, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0,
    y: "-70%",
    transition: { duration: 0.15, ease: EASE_OUT },
  },
};

// Shared by the pill and its contents: the contents counter the pill's layout
// scale, and only stay unsquished if both settle on the same curve.
const LAYOUT_TRANSITION = { type: "spring", stiffness: 420, damping: 30, mass: 0.7 } as const;

export function Badge({
  status = "neutral",
  size = "md",
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
  const Icon = ICONS[status];
  const resolvedContentKey =
    contentKey ??
    (typeof children === "string" || typeof children === "number" ? children : status);

  return (
    <motion.span
      layout
      transition={LAYOUT_TRANSITION}
      style={{ borderRadius: 9999, ...style }}
      className={cn(
        "relative inline-flex shrink-0 items-center overflow-hidden border font-medium whitespace-nowrap tabular-nums",
        "transition-colors duration-300",
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
                // CSS rather than Motion: AnimatePresence's initial={false} makes Motion children start at their
                // target, so a rotate-to-360 spinner present on first render never turned.
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
