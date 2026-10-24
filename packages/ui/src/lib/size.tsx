import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { type TypeRole, type TypeVariant, fieldTouchClass, typeScale } from "./type-scale";

export type Size = "compact" | "default" | "large";

export interface SizeTokens {
  size: Size;
  control: string;
  square: string;
  controlPx: string;
  /** Min-height, not height, so wrapped text grows the row. */
  row: string;
  gap: string;
  text: string;
  field: string;
  icon: number;
  iconClass: string;
  /** `segmentPad` + `segmentItem` add back up to `control`. */
  segmentPad: string;
  segmentItem: string;
  type: Record<TypeRole, string>;
  typeVariant: TypeVariant;
}

const TOKENS: Record<Size, Omit<SizeTokens, "type" | "typeVariant" | "field">> = {
  compact: {
    size: "compact",
    control: "h-8",
    square: "size-8",
    controlPx: "px-2.5",
    row: "min-h-8 px-2 py-2",
    gap: "gap-1",
    text: "text-[length:var(--fs-caption,12px)] leading-[var(--lh-caption,16px)]",
    icon: 14,
    iconClass: "[&_svg:not([class*='size-'])]:size-3.5",
    segmentPad: "p-0.5",
    segmentItem: "h-7",
  },
  default: {
    size: "default",
    control: "h-9",
    square: "size-9",
    controlPx: "px-3",
    row: "min-h-9 px-2.5 py-2",
    gap: "gap-2",
    text: "text-[length:var(--fs-body,14px)] leading-[var(--lh-body,20px)]",
    icon: 16,
    iconClass: "[&_svg:not([class*='size-'])]:size-4",
    segmentPad: "p-1",
    segmentItem: "h-7",
  },
  large: {
    size: "large",
    control: "h-11",
    square: "size-11",
    controlPx: "px-4",
    row: "min-h-11 px-3 py-2.5",
    gap: "gap-2",
    text: "text-[length:var(--fs-subtitle,16px)] leading-[var(--lh-subtitle,24px)]",
    icon: 18,
    iconClass: "[&_svg:not([class*='size-'])]:size-[18px]",
    segmentPad: "p-1",
    segmentItem: "h-9",
  },
};

function tokensFor(size: Size): SizeTokens {
  const typeVariant: TypeVariant = size === "compact" ? "compact" : "default";
  const base = TOKENS[size];
  return {
    ...base,
    field: `${base.text} ${fieldTouchClass}`,
    type: typeScale(typeVariant),
    typeVariant,
  };
}

const RESOLVED: Record<Size, SizeTokens> = {
  compact: tokensFor("compact"),
  default: tokensFor("default"),
  large: tokensFor("large"),
};

export function sizeTokens(size: Size = "default"): SizeTokens {
  return RESOLVED[size];
}

type SizeContextValue = { size: Size; setSize: (size: Size) => void };

const SizeContext = createContext<SizeContextValue | null>(null);

export function SizeProvider({
  size,
  defaultSize = "default",
  children,
}: {
  size?: Size;
  defaultSize?: Size;
  children: ReactNode;
}) {
  const [internal, setInternal] = useState<Size>(defaultSize);
  const value = useMemo(() => ({ size: size ?? internal, setSize: setInternal }), [size, internal]);
  return <SizeContext.Provider value={value}>{children}</SizeContext.Provider>;
}

export function useSizeContext(): SizeContextValue | null {
  return useContext(SizeContext);
}

/** A component's own `size` wins over the provider. */
export function useSize(override?: Size): SizeTokens {
  const context = useContext(SizeContext);
  return RESOLVED[override ?? context?.size ?? "default"];
}
