import type { CSSProperties } from "react";

// The marker class must not look like a Tailwind utility, or tailwind-merge drops it.
export const TEXT_SHIMMER_KEYFRAMES =
  "@keyframes text-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}" +
  "@media (prefers-reduced-motion: reduce){.ui-text-shimmer{animation:none !important;" +
  "background-image:none !important;color:var(--muted-foreground) !important}}";

export const TEXT_SHIMMER_CLASS_NAME =
  "ui-text-shimmer bg-[length:200%_100%] bg-clip-text text-transparent bg-[linear-gradient(110deg,var(--muted-foreground)_30%,var(--foreground)_50%,var(--muted-foreground)_70%)]";

/** `duration` is the loop period in seconds. */
export function textShimmerStyle(duration: number): CSSProperties {
  return {
    animation: `text-shimmer ${duration}s linear infinite`,
  };
}
