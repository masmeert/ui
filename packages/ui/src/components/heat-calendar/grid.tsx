import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { typeClass } from "@/lib/type-scale";
import { cn } from "cn";
import { useHeatCalendar } from "./context";
import { DAYS, fmtDay, GAP, LIFT, MONTH_ROW, PITCH } from "./utils";

export function HeatCalendarGrid({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const {
    weeks,
    reduce,
    canHover,
    pinned,
    step,
    settled,
    level,
    bucket,
    fill,
    count,
    dateOf,
    future,
    cols,
    clear,
    span,
    select,
    hot,
    hotMonth,
    setHover,
    gridRef,
    tooltipId,
    unit,
  } = useHeatCalendar();
  return (
    <div
      ref={gridRef}
      className={cn("relative grid", className)}
      style={{
        width: weeks * PITCH - GAP,
        maxWidth: "100%",
        gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
        gridTemplateRows: `${MONTH_ROW}px repeat(7, auto)`,
        gap: GAP,
      }}
      onPointerLeave={() => setHover(null)}
    >
      {cols.map((c) =>
        c.label ? (
          <span
            key={c.id}
            // micro's 12px leading is exactly MONTH_ROW, which the tooltip's offset relies on
            className={cn(
              typeClass("micro"),
              "whitespace-nowrap transition-colors duration-(--duration-fast)",
              hotMonth === c.m ? "text-foreground" : "text-muted-foreground",
            )}
            style={{ gridColumn: c.w + 1, gridRow: 1 }}
          >
            {c.label}
          </span>
        ) : null,
      )}
      {cols.map(({ id, w }) =>
        DAYS.map(({ id: dayId, d }) => {
          const date = dateOf(w, d);
          if (future(w, d)) return null;
          const v = level(w, d);
          const b = bucket(v);
          const i = w * 7 + d;
          const on = hot?.w === w && hot?.d === d;
          const isEnd = span ? i === span.lo || i === span.hi : pinned?.w === w && pinned?.d === d;
          const dim =
            (step !== null && step !== b) || (span !== null && (i < span.lo || i > span.hi));
          const dist = hot ? Math.max(Math.abs(hot.w - w), Math.abs(hot.d - d)) : 9;
          const lift =
            reduce || !canHover
              ? 1
              : dist === 0
                ? LIFT[0]
                : canHover && dist < LIFT.length
                  ? LIFT[dist]
                  : 1;
          return (
            // the outer span owns the legend dim so it never fights the transforms inside
            <span
              key={`${id}-${dayId}`}
              className="relative block aspect-square w-full transition-opacity duration-(--duration-fast)"
              style={{
                gridColumn: w + 1,
                gridRow: d + 2,
                opacity: dim ? 0.25 : 1,
                zIndex: lift > 1 ? LIFT.length - dist : 0,
              }}
            >
              {/* Hit area covers half the gap on every side so a fast pointer never falls
                  through; the visual ignores pointers so a lifted neighbour can't steal clicks. */}
              <motion.button
                type="button"
                aria-label={`${count(v)} ${unit}${date ? ` on ${fmtDay.format(date)}` : ""}`}
                data-heat-cell={`${w}-${d}`}
                aria-pressed={isEnd}
                aria-describedby={on ? tooltipId : undefined}
                onPointerEnter={() => setHover({ w, d })}
                onFocus={() => setHover({ w, d })}
                onBlur={() => setHover(null)}
                onClick={() => select({ w, d })}
                onKeyDown={(e) => {
                  if (e.key === "Escape") clear();
                }}
                className="absolute -inset-0.5 block rounded-[5px] outline-none focus-visible:ring-4 focus-visible:ring-ring"
                whileTap={reduce ? undefined : { scale: 0.9, transition: spring.fast }}
              >
                <motion.span
                  className="pointer-events-none absolute inset-0.5 block rounded-[4px]"
                  style={{
                    background: fill(b),
                    boxShadow: isEnd
                      ? "0 0 0 2px var(--background), 0 0 0 3.5px var(--foreground)"
                      : "none",
                    transition: "box-shadow var(--duration-fast)",
                  }}
                  // Diagonal entrance wave; once settled, the hover ripple delays by distance.
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                  animate={
                    settled
                      ? {
                          opacity: 1,
                          scale: lift,
                          transition: reducedTransition(
                            { ...spring.fast, delay: Math.min(dist, 3) * 0.03 },
                            reduce,
                          ),
                        }
                      : {
                          opacity: 1,
                          scale: 1,
                          transition: reducedTransition(
                            { ...spring.fast, delay: (w + d) * 0.018 },
                            reduce,
                          ),
                        }
                  }
                >
                  {/* Inside the cell so it inherits its size, lift scale and radius. */}
                  <AnimatePresence>
                    {on && !isEnd ? (
                      <motion.span
                        className="pointer-events-none absolute inset-0 block border-[1.5px]"
                        style={{
                          borderRadius: "inherit",
                          borderColor: "color-mix(in srgb, var(--foreground) 55%, transparent)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: springExit.fast }}
                        transition={spring.fast}
                      />
                    ) : null}
                  </AnimatePresence>
                </motion.span>
              </motion.button>
            </span>
          );
        }),
      )}

      {children}
    </div>
  );
}
