import { AnimatePresence, motion, type Transition, useReducedMotion } from "motion/react";
import { Bell, CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { type HTMLAttributes, type ReactNode, useState } from "react";
import { cn } from "cn";
import { FOLD } from "@/lib/ease";
import { type Size, useSize } from "@/lib/size";
import { springExit } from "@/lib/springs";

export type BannerStatus = "info" | "success" | "warning" | "error" | "neutral";
export type BannerContrast = "subtle" | "strong";
export type BannerPosition = "inline" | "top";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  status?: BannerStatus;
  /** `subtle` tints the surface it sits on; `strong` fills with the status colour. */
  contrast?: BannerContrast;
  /** `top` is fixed to the viewport and pushes nothing; the page must leave room itself. */
  position?: BannerPosition;
  title?: ReactNode;
  description?: ReactNode;
  /** Replaces the status icon. `false` hides it. */
  icon?: ReactNode | false;
  actions?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Controlled visibility; unset, the close button hides the banner itself. */
  open?: boolean;
  size?: Size;
  /** A wrapper inside the fold. Put stacking gaps (`pb-3`) here so they fold away with the banner. */
  containerClassName?: string;
}

const ICONS: Record<BannerStatus, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  neutral: Bell,
};

// The stylesheet has no info/warning ink tokens, so those fall back to values that hold contrast in both themes.
const TONE: Record<BannerStatus, string> = {
  info: "[--tone:var(--info,oklch(58%_0.14_250))] [--tone-ink:var(--info-foreground,oklch(99%_0_0))]",
  success: "[--tone:var(--success)] [--tone-ink:var(--success-foreground)]",
  warning: "[--tone:var(--warning)] [--tone-ink:var(--warning-foreground,oklch(22%_0.04_70))]",
  error: "[--tone:var(--destructive)] [--tone-ink:var(--destructive-foreground)]",
  neutral: "[--tone:var(--foreground)] [--tone-ink:var(--background)]",
};

// Subtle tints over transparent so it reads on any surface; text never takes the tone, so it stays AA.
const CONTRAST: Record<BannerContrast, string> = {
  subtle:
    "border-[color-mix(in_oklab,var(--tone)_22%,transparent)] bg-[color-mix(in_oklab,var(--tone)_9%,transparent)] text-foreground",
  strong: "border-transparent bg-(--tone) text-(--tone-ink)",
};

// Taller than the line; the negative margin keeps the row at text height.
const DISMISS_SIZE: Record<Size, string> = {
  compact: "size-6",
  default: "size-7",
  large: "size-8",
};

// Errors and warnings interrupt; everything else waits its turn.
const ROLE: Record<BannerStatus, "alert" | "status"> = {
  info: "status",
  success: "status",
  warning: "alert",
  error: "alert",
  neutral: "status",
};

// Opacity leads, so the text is gone before the box crops it.
const FOLD_EXIT: Transition = {
  height: springExit.slow,
  opacity: springExit.fast,
};

export function Banner({
  status = "info",
  contrast = "subtle",
  position = "inline",
  title,
  description,
  icon,
  actions,
  dismissible = false,
  onDismiss,
  dismissLabel = "Dismiss",
  open: openProp,
  size: sizeProp,
  containerClassName,
  className,
  role,
  ...props
}: BannerProps) {
  const size = useSize(sizeProp);
  const reduce = useReducedMotion();
  const [internalOpen, setInternalOpen] = useState(true);
  const open = openProp ?? internalOpen;
  const Icon = ICONS[status];
  const top = position === "top";

  const dismiss = () => {
    if (openProp === undefined) setInternalOpen(false);
    onDismiss?.();
  };

  const iconNode = icon === false ? null : (icon ?? <Icon size={size.icon} aria-hidden />);

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="banner"
          data-slot="banner-fold"
          className={cn("overflow-clip", top && "fixed inset-x-0 top-0 z-(--z-sticky)")}
          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
          exit={
            reduce
              ? { opacity: 0, transition: springExit.fast }
              : { height: 0, opacity: 0, transition: FOLD_EXIT }
          }
          transition={reduce ? { opacity: FOLD.opacity } : FOLD}
        >
          <div className={containerClassName}>
            <div
              data-slot="banner"
              data-status={status}
              data-contrast={contrast}
              role={role ?? ROLE[status]}
              className={cn(
                "flex items-start border",
                size.gap,
                size.text,
                size.size === "large" ? "px-4 py-3" : "px-3 py-2.5",
                top ? "border-x-0 border-t-0" : "rounded-xl",
                TONE[status],
                CONTRAST[contrast],
                className,
              )}
              {...props}
            >
              {iconNode ? (
                // One line tall, so the icon centres on the first line however the text wraps.
                <span
                  data-slot="banner-icon"
                  className={cn(
                    "flex h-lh shrink-0 items-center",
                    contrast === "subtle" && "text-(--tone)",
                  )}
                >
                  {iconNode}
                </span>
              ) : null}
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex min-w-[min(100%,14rem)] flex-1 flex-col">
                  {title ? (
                    <p data-slot="banner-title" className="font-semibold">
                      {title}
                    </p>
                  ) : null}
                  {description ? (
                    <div
                      data-slot="banner-description"
                      className={cn(contrast === "subtle" && "text-muted-foreground")}
                    >
                      {description}
                    </div>
                  ) : null}
                </div>
                {actions ? (
                  <div data-slot="banner-actions" className={cn("flex items-center", size.gap)}>
                    {actions}
                  </div>
                ) : null}
              </div>
              {dismissible ? (
                <button
                  type="button"
                  data-slot="banner-dismiss"
                  aria-label={dismissLabel}
                  onClick={dismiss}
                  className={cn(
                    // Negative margins keep the X on the text line.
                    "-my-1 -mr-1.5 grid shrink-0 place-items-center rounded-lg outline-none",
                    DISMISS_SIZE[size.size],
                    "transition-[background-color,scale] duration-(--duration-fast) active:scale-95 motion-reduce:active:scale-100",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    // On a strong fill the overlay tint barely shows; a tint of the ink does.
                    contrast === "strong"
                      ? "hover:bg-[color-mix(in_oklab,currentColor_14%,transparent)]"
                      : "text-muted-foreground hover:bg-hover hover:text-foreground",
                  )}
                >
                  <X size={size.icon} aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
