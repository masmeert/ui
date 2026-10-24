import { createContext, useContext, useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NumberTicker } from "@/components/number-ticker";
import { Tooltip } from "@/components/tooltip";
import { useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";
import { cn } from "cn";
import { buildFunnel, funnelPath, type FunnelStage } from "./funnel-chart/model";

const defaultFormat = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const percentage = (value: number | null) => (value === null ? "—" : `${value.toFixed(1)}%`);
const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
export interface FunnelChartProps {
  /** Ordered stages with finite, nonnegative counts; duplicate IDs are omitted. */
  stages: readonly FunnelStage[];
  direction?: "vertical" | "horizontal";
  unit?: string;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
  children?: ReactNode;
}
const Context = createContext<
  | (ReturnType<typeof buildFunnel> & {
      direction: "vertical" | "horizontal";
      unit: string;
      formatValue: (value: number) => string;
    })
  | null
>(null);
export function useFunnelChart() {
  const context = useContext(Context);
  if (!context) throw new Error("Funnel chart parts must be inside FunnelChart");
  return context;
}
export function FunnelChart({
  stages,
  direction = "vertical",
  unit = "people",
  label = "Conversion funnel",
  formatValue = defaultFormat,
  className,
  children,
}: FunnelChartProps) {
  const model = useMemo(() => buildFunnel(stages), [stages]);
  return (
    <Context.Provider value={{ ...model, direction, unit, formatValue }}>
      <section aria-label={label} className={cn("w-full space-y-6", className)}>
        {children === undefined ? (
          <>
            <FunnelChartPlot />
            <FunnelChartSummary />
          </>
        ) : (
          children
        )}
      </section>
    </Context.Provider>
  );
}
export function FunnelChartPlot({ className }: { className?: string }) {
  const { rows, direction, unit, formatValue } = useFunnelChart();
  const reduced = useReducedMotion();
  const { type } = useSize();
  if (!rows.length)
    return (
      <p className={cn("py-16 text-center text-muted-foreground", type.body, className)}>
        No funnel data
      </p>
    );
  const horizontal = direction === "horizontal";
  const proportions = rows.map((stage) => stage.proportion);
  return (
    <div className={cn("space-y-5", className)}>
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{
            height: horizontal ? 300 : Math.max(320, rows.length * 72),
            minWidth: horizontal ? rows.length * 110 : 240,
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {rows.map((stage, index) => (
              <motion.path
                key={stage.id}
                fill={stage.color ?? colors[index % colors.length]}
                initial={false}
                animate={{ d: funnelPath(proportions, index, direction) }}
                // Every stage shares one critically damped spring, so seams stay joined mid-reshape.
                transition={reducedTransition(spring.moderate, reduced)}
              />
            ))}
          </svg>
          <ol
            aria-label="Funnel stages"
            className="absolute inset-0 grid"
            style={
              horizontal
                ? { gridTemplateColumns: `repeat(${rows.length}, 1fr)` }
                : { gridTemplateRows: `repeat(${rows.length}, 1fr)` }
            }
          >
            {rows.map((stage, index) => (
              <li key={stage.id} className="min-h-0 min-w-0">
                <Tooltip
                  wrapperClassName="block h-full w-full"
                  content={
                    <span className={cn("flex flex-col gap-1.5", type.caption)}>
                      <span className="text-muted-foreground">{stage.label}</span>
                      <NumberTicker
                        value={stage.value}
                        format={() => formatValue(stage.value)}
                        suffix={` ${unit}`}
                        duration={0.35}
                        startOnView={false}
                        className="font-mono"
                      />
                      {index > 0 && (
                        <>
                          <span>{percentage(stage.stepConversion)} from previous stage</span>
                          <span className="text-muted-foreground">
                            {formatValue(Math.abs(stage.change ?? 0))}{" "}
                            {(stage.change ?? 0) > 0 ? "gained" : "dropped"}
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">
                        {percentage(stage.conversion)} of starting total
                      </span>
                    </span>
                  }
                >
                  <button
                    type="button"
                    className="flex h-full w-full items-center justify-center transition-colors duration-(--duration-fast) outline-none hover:bg-hover focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset"
                    aria-label={`${stage.label}: ${formatValue(stage.value)} ${unit}, ${percentage(stage.conversion)} of starting total`}
                  >
                    <span
                      className={cn(
                        "rounded bg-background/85 px-2 py-1 font-mono font-semibold tabular-nums",
                        type.caption,
                      )}
                    >
                      {formatValue(stage.value)}
                    </span>
                  </button>
                </Tooltip>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {rows.map((stage, index) => (
          <span key={stage.id} className={cn("inline-flex items-center gap-2", type.caption)}>
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: stage.color ?? colors[index % colors.length] }}
            />
            <span>{stage.label}</span>
            <span className="font-mono text-muted-foreground">{percentage(stage.conversion)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
export function FunnelChartSummary({ className }: { className?: string }) {
  const { rows, first, last, conversion, formatValue, unit } = useFunnelChart();
  const { type } = useSize();
  if (!rows.length) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4",
        type.caption,
        className,
      )}
    >
      <span className="text-muted-foreground">
        {formatValue(first)} → {formatValue(last)} {unit}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-muted-foreground">Overall conversion</span>
        <span className="font-mono font-semibold tabular-nums">{percentage(conversion)}</span>
      </span>
    </div>
  );
}
export type { FunnelStage };
