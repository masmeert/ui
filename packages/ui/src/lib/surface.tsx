import { cn } from "cn";
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
} from "react";

export type SurfaceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const SURFACE_OFFSET = { popover: 2, dialog: 4 } as const;

// Literal strings so Tailwind's scanner sees them.
const BG: Record<SurfaceLevel, string> = {
  1: "bg-surface-1",
  2: "bg-surface-2",
  3: "bg-surface-3",
  4: "bg-surface-4",
  5: "bg-surface-5",
  6: "bg-surface-6",
  7: "bg-surface-7",
  8: "bg-surface-8",
};

const SHADOW: Record<SurfaceLevel, string> = {
  1: "shadow-surface-1",
  2: "shadow-surface-2",
  3: "shadow-surface-3",
  4: "shadow-surface-4",
  5: "shadow-surface-5",
  6: "shadow-surface-6",
  7: "shadow-surface-7",
  8: "shadow-surface-8",
};

function clampLevel(level: number): SurfaceLevel {
  return Math.max(1, Math.min(8, Math.round(level))) as SurfaceLevel;
}

export function surfaceBg(level: number): string {
  return BG[clampLevel(level)];
}

export function surfaceClasses(bgLevel: number, shadowLevel: number = bgLevel): string {
  return `${BG[clampLevel(bgLevel)]} ${SHADOW[clampLevel(shadowLevel)]}`;
}

const SurfaceContext = createContext<SurfaceLevel>(1);

export function SurfaceProvider({ value, children }: { value: number; children: ReactNode }) {
  return <SurfaceContext.Provider value={clampLevel(value)}>{children}</SurfaceContext.Provider>;
}

export function useSurface(): SurfaceLevel {
  return useContext(SurfaceContext);
}

/** Wrap the popup's children in `<SurfaceProvider value={level}>` so nested popups climb. */
export function useElevation(offset: number, { shadowLevel }: { shadowLevel?: number } = {}) {
  const substrate = useSurface();
  const level = clampLevel(substrate + offset);
  return { level, className: surfaceClasses(level, shadowLevel ?? level) };
}

export interface ElevatedProps extends ComponentPropsWithoutRef<"div"> {
  offset: number;
  /** Pins the shadow weight however deep the surface nests. */
  shadowLevel?: number;
}

export const Elevated = forwardRef<HTMLDivElement, ElevatedProps>(function Elevated(
  { offset, shadowLevel, className, children, ...props },
  ref,
) {
  const substrate = useSurface();
  const level = clampLevel(substrate + offset);
  return (
    <div
      ref={ref}
      className={cn(surfaceClasses(level, shadowLevel ?? level), className)}
      {...props}
    >
      <SurfaceContext.Provider value={level}>{children}</SurfaceContext.Provider>
    </div>
  );
});

/** Concentric corners: max(0, outer - inset - border). */
export function nestedRadius(outerRadius: number, inset: number, borderWidth = 0): number {
  return Math.max(0, outerRadius - inset - borderWidth);
}
