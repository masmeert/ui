// Arbitrary values on purpose: stock tailwind-merge reads a bare `text-caption` as a
// colour and drops it next to `text-muted-foreground`. No "use client": server-safe.
export type TypeRole = "display" | "title" | "subtitle" | "body" | "caption" | "micro";
export type TypeVariant = "default" | "compact";

const TYPE_CLASS: Record<TypeVariant, Record<TypeRole, string>> = {
  default: {
    display: "text-[length:var(--fs-display,28px)] leading-[var(--lh-display,34px)]",
    title: "text-[length:var(--fs-title,18px)] leading-[var(--lh-title,26px)]",
    subtitle: "text-[length:var(--fs-subtitle,16px)] leading-[var(--lh-subtitle,24px)]",
    body: "text-[length:var(--fs-body,14px)] leading-[var(--lh-body,20px)]",
    caption: "text-[length:var(--fs-caption,12px)] leading-[var(--lh-caption,16px)]",
    micro: "text-[length:var(--fs-micro,10px)] leading-[var(--lh-micro,12px)]",
  },
  compact: {
    display:
      "text-[length:var(--fs-display-compact,24px)] leading-[var(--lh-display-compact,30px)]",
    title: "text-[length:var(--fs-title-compact,16px)] leading-[var(--lh-title-compact,24px)]",
    subtitle:
      "text-[length:var(--fs-subtitle-compact,14px)] leading-[var(--lh-subtitle-compact,20px)]",
    body: "text-[length:var(--fs-body-compact,13px)] leading-[var(--lh-body-compact,18px)]",
    caption:
      "text-[length:var(--fs-caption-compact,11px)] leading-[var(--lh-caption-compact,14px)]",
    micro: "text-[length:var(--fs-micro-compact,10px)] leading-[var(--lh-micro-compact,12px)]",
  },
};

/** For SVG and canvas text, which can't take a class. */
export const TYPE_PX: Record<TypeVariant, Record<TypeRole, { size: number; leading: number }>> = {
  default: {
    display: { size: 28, leading: 34 },
    title: { size: 18, leading: 26 },
    subtitle: { size: 16, leading: 24 },
    body: { size: 14, leading: 20 },
    caption: { size: 12, leading: 16 },
    micro: { size: 10, leading: 12 },
  },
  compact: {
    display: { size: 24, leading: 30 },
    title: { size: 16, leading: 24 },
    subtitle: { size: 14, leading: 20 },
    body: { size: 13, leading: 18 },
    caption: { size: 11, leading: 14 },
    micro: { size: 10, leading: 12 },
  },
};

export function typeClass(role: TypeRole, variant: TypeVariant = "default"): string {
  return TYPE_CLASS[variant][role];
}

export function typeScale(variant: TypeVariant = "default"): Record<TypeRole, string> {
  return TYPE_CLASS[variant];
}

// iOS Safari zooms into any focused field under 16px.
export const fieldTouchClass = "pointer-coarse:text-[16px]";
