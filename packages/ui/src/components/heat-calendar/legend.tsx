import { cn } from "cn";
import { useSize } from "@/lib/size";
import { useHeatCalendar } from "./context";
import { fmtRange, STEPS } from "./utils";

export function HeatCalendarLegend({ className }: { className?: string }) {
  const { start, end, step, setStep, fill, canHover, reduce } = useHeatCalendar();
  const { type } = useSize();
  return (
    <div className={cn("mt-3 flex flex-wrap items-center justify-between gap-3", className)}>
      <span className={cn("text-muted-foreground", type.caption)}>
        {start && end ? `${fmtRange.format(start)} – ${fmtRange.format(end)}` : "\u00a0"}
      </span>
      {/* hovering a step keeps only cells of that level lit, so the legend doubles as a filter */}
      <span className="flex items-center gap-1" onPointerLeave={() => setStep(null)}>
        <span className={cn("mr-0.5 text-muted-foreground", type.caption)}>less</span>
        {STEPS.map((s, i) => (
          <button
            type="button"
            aria-label={`Show activity level ${i}`}
            aria-pressed={step === i}
            key={s}
            onPointerEnter={() => {
              if (canHover) setStep(i);
            }}
            onFocus={() => setStep(i)}
            onBlur={() => setStep(null)}
            onClick={() => setStep(step === i ? null : i)}
            className="size-3 rounded-[3px] transition-transform duration-(--duration-fast)"
            style={{
              background: fill(i),
              transform: !reduce && step === i ? "scale(1.25)" : undefined,
            }}
          />
        ))}
        <span className={cn("ml-0.5 text-muted-foreground", type.caption)}>more</span>
      </span>
    </div>
  );
}
