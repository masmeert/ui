import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { type Size, sizeTokens, useSizeContext } from "@/lib/size";
import { spring } from "@/lib/springs";
import { cn } from "cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

/** `icon` is a square at the surrounding step; for a square at a pinned step, pass the step plus `square`. */
export type ButtonSize = Size | "icon";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** A square, icon-only button at the resolved step. `size="icon"` implies it. */
  square?: boolean;
  pressScale?: number;
  children?: ReactNode;
}

export interface ButtonLinkProps extends Omit<HTMLMotionProps<"a">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** A square, icon-only link at the resolved step. `size="icon"` implies it. */
  square?: boolean;
  pressScale?: number;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "sheen bg-primary text-primary-foreground transition-[color,box-shadow,opacity]",
  secondary: "border border-border bg-card text-foreground hover:border-border",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-hover",
  outline: "border border-border bg-transparent text-foreground hover:bg-hover",
};

const RADIUS: Record<Size, string> = {
  compact: "rounded-lg",
  default: "rounded-xl",
  large: "rounded-xl",
};

// Squares keep the key radius below `large` so an icon button reads as a key, not a dot.
const SQUARE_RADIUS: Record<Size, string> = {
  compact: "rounded-lg",
  default: "rounded-lg",
  large: "rounded-xl",
};

// `sizeTokens`, not `useSize`, so `buttonVariants` works outside React.
function sizeClass(step: Size, square: boolean) {
  const t = sizeTokens(step);
  return square
    ? cn(t.square, "p-0", t.text, t.iconClass, SQUARE_RADIUS[step])
    : cn(t.control, t.controlPx, t.gap, t.text, t.iconClass, RADIUS[step]);
}

const BASE_CLASS =
  "inline-flex items-center justify-center font-medium select-none transition-colors duration-(--duration-fast)";

export function resolveButtonSize(
  size: ButtonSize | undefined,
  square = false,
  contextSize: Size = "default",
): { step: Size; square: boolean } {
  if (size === undefined) return { step: contextSize, square };
  if (size === "icon") return { step: contextSize, square: true };
  return { step: size, square };
}

/** For elements that can't be the motion button. Can't read a `SizeProvider`, so an unset size is `default`. */
export function buttonVariants({
  variant = "primary",
  size,
  square,
}: { variant?: ButtonVariant; size?: ButtonSize; square?: boolean } = {}) {
  const resolved = resolveButtonSize(size, square);
  return cn(
    BASE_CLASS,
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASS[variant],
    sizeClass(resolved.step, resolved.square),
  );
}

function useButtonSize(size: ButtonSize | undefined, square: boolean | undefined) {
  const context = useSizeContext();
  return resolveButtonSize(size, square, context?.size);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size, square, pressScale, className, children, ...rest },
  ref,
) {
  const reduce = useReducedMotion();
  const resolved = useButtonSize(size, square);
  // A popup anchors to its trigger, so a press squish would drag the open panel along with the spring.
  const opensPopup = rest["aria-haspopup"] !== undefined && rest["aria-haspopup"] !== false;

  return (
    <motion.button
      ref={ref}
      type="button"
      data-size={resolved.step}
      whileTap={
        reduce || opensPopup ? undefined : { scale: pressScale ?? (resolved.square ? 0.95 : 0.97) }
      }
      transition={spring.fast}
      className={cn(
        BASE_CLASS,
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASS[variant],
        sizeClass(resolved.step, resolved.square),
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = "primary", size, square, pressScale, className, children, ...rest },
  ref,
) {
  const reduce = useReducedMotion();
  const resolved = useButtonSize(size, square);

  return (
    <motion.a
      ref={ref}
      data-size={resolved.step}
      whileTap={reduce ? undefined : { scale: pressScale ?? (resolved.square ? 0.95 : 0.97) }}
      transition={spring.fast}
      className={cn(
        BASE_CLASS,
        VARIANT_CLASS[variant],
        sizeClass(resolved.step, resolved.square),
        className,
      )}
      {...rest}
    >
      {children}
    </motion.a>
  );
});
