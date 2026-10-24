import { Moon, Sun } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, type ComponentPropsWithoutRef } from "react";
import { flushSync } from "react-dom";
import { ActionSwapIcon } from "@/components/action-swap";
import { EASE_OUT_CSS } from "@/lib/ease";
import { cn } from "cn";

export type ThemeVariant = "rectangle" | "circle" | "circle-blur" | "blinds";

export type RevealOrigin =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "bottom-up";

export interface ThemeToggleOptions {
  dark: boolean;
  /** Runs inside the view transition under flushSync: the theme must reach the DOM by commit. */
  onDarkChange: (dark: boolean) => void;
  variant?: ThemeVariant;
  origin?: RevealOrigin;
}

export interface ThemeToggleProps
  extends ThemeToggleOptions, Omit<ComponentPropsWithoutRef<"button">, "children" | "onClick"> {
  iconClassName?: string;
}

const VT_STYLE_ID = "theme-toggle-vt";

// A skipped transition still settles; only the latest may clear the variant,
// or the new reveal loses its styles mid-flight.
let latestViewTransition: unknown = null;

// View transitions run in CSS, outside the spring tiers. Durations match native OS
// mode switches; circles use the Material curve since they expand symmetrically.
const VT_CSS = `
html[data-theme-vt="rect"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-theme-vt="rect"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: theme-vt-rect-reveal 400ms ease-out;
}
html[data-theme-vt="circle"]::view-transition-old(root),
html[data-theme-vt="circle-blur"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
html[data-theme-vt="circle"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: theme-vt-circle-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
html[data-theme-vt="circle-blur"]::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: theme-vt-circle-blur-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
html[data-theme-vt="blinds"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}
/* mask-image isn't animatable but re-resolves as the registered property ticks.
   mask-size pins the tile at 72px so the 20px soft edge can't widen it and leave a gap. */
@property --theme-vt-slat {
  syntax: "<length>";
  inherits: false;
  initial-value: 72px;
}
html[data-theme-vt="blinds"]::view-transition-new(root) {
  mix-blend-mode: normal;
  mask-image: linear-gradient(
    90deg,
    #000 0 var(--theme-vt-slat),
    transparent calc(var(--theme-vt-slat) + 20px)
  );
  mask-size: 72px 100%;
  mask-repeat: repeat;
  animation: theme-vt-blinds-reveal 700ms ${EASE_OUT_CSS};
}
@keyframes theme-vt-rect-reveal {
  from { clip-path: var(--theme-vt-from, inset(100% 0 0 0)); }
  to   { clip-path: inset(0 0 0 0); }
}
@keyframes theme-vt-circle-reveal {
  from { clip-path: circle(0% at var(--theme-vt-origin, 50% 100%)); }
  to   { clip-path: circle(150% at var(--theme-vt-origin, 50% 100%)); }
}
@keyframes theme-vt-circle-blur-reveal {
  from { clip-path: circle(0% at var(--theme-vt-origin, 50% 100%)); filter: blur(8px); }
  to   { clip-path: circle(150% at var(--theme-vt-origin, 50% 100%)); filter: blur(0px); }
}
@keyframes theme-vt-blinds-reveal {
  from { --theme-vt-slat: -20px; }
  to   { --theme-vt-slat: 72px; }
}
`;

const RECTANGLE_CLIP_FROM: Record<RevealOrigin, string> = {
  "top-left": "inset(0 100% 100% 0)",
  "top-right": "inset(0 0 100% 100%)",
  "bottom-left": "inset(100% 100% 0 0)",
  "bottom-right": "inset(100% 0 0 100%)",
  center: "inset(50% 50% 50% 50%)",
  "bottom-up": "inset(100% 0 0 0)",
};

const CIRCLE_ORIGIN: Record<RevealOrigin, string> = {
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
  center: "50% 50%",
  "bottom-up": "50% 100%",
};

export function useThemeToggle({
  dark,
  onDarkChange,
  variant = "rectangle",
  origin = "bottom-up",
}: ThemeToggleOptions) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  useEffect(() => {
    if (document.getElementById(VT_STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = VT_STYLE_ID;
    el.textContent = VT_CSS;
    document.head.appendChild(el);
  }, []);

  const toggle = () => {
    const next = !dark;

    if (prefersReducedMotion || !("startViewTransition" in document)) {
      onDarkChange(next);
      return;
    }

    const root = document.documentElement;

    if (variant === "rectangle") {
      root.style.setProperty("--theme-vt-from", RECTANGLE_CLIP_FROM[origin]);
      root.dataset.themeVt = "rect";
    } else if (variant === "blinds") {
      root.dataset.themeVt = "blinds";
    } else {
      root.style.setProperty("--theme-vt-origin", CIRCLE_ORIGIN[origin]);
      root.dataset.themeVt = variant;
    }

    const viewTransition = (
      document as Document & {
        startViewTransition(cb: () => void): { finished: Promise<void> };
      }
    ).startViewTransition(() => flushSync(() => onDarkChange(next)));

    latestViewTransition = viewTransition;
    viewTransition.finished
      .finally(() => {
        if (latestViewTransition !== viewTransition) return;
        latestViewTransition = null;
        delete root.dataset.themeVt;
      })
      .catch(() => {});
  };

  return { toggle };
}

export function ThemeToggle({
  dark,
  onDarkChange,
  variant = "rectangle",
  origin = "bottom-up",
  className,
  iconClassName,
  ...rest
}: ThemeToggleProps) {
  const { toggle } = useThemeToggle({ dark, onDarkChange, variant, origin });

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn("flex items-center justify-center", className)}
      {...rest}
    >
      <ActionSwapIcon value={dark ? "dark" : "light"} animation="blur" className={iconClassName}>
        {dark ? <Sun className={iconClassName} /> : <Moon className={iconClassName} />}
      </ActionSwapIcon>
    </button>
  );
}
