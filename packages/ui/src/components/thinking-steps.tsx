import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "cn";
import { ThinkingGlyph, ThinkingIndicator } from "@/components/thinking-indicator";
import { FOLD } from "@/lib/ease";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";

export type ThinkingStepStatus = "pending" | "active" | "done";

export interface ThinkingStep {
  id: string;
  title: ReactNode;
  /** A step without detail has no toggle. */
  detail?: ReactNode;
  status: ThinkingStepStatus;
  defaultOpen?: boolean;
}

export interface ThinkingStepsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  steps: readonly ThinkingStep[];
  /** Defaults to "some step isn't done"; pass it while the model picks the next step. */
  thinking?: boolean;
  open?: boolean;
  /** Defaults to open while thinking. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fold to the summary when thinking ends, unless the reader has toggled it. */
  autoCollapse?: boolean;
  /** Seconds, for the summary. Defaults to the time measured since mount. */
  duration?: number;
  /** Replaces "Thought for 12s". */
  summary?: ReactNode;
  /** Show steps that haven't started yet. By default a step appears when it starts. */
  showPending?: boolean;
  size?: Size;
}

/** `12` → `12s`, `75` → `1m 15s`. */
export function formatThinkingDuration(seconds: number): string {
  const whole = Math.max(1, Math.round(seconds));
  if (whole < 60) return `${whole}s`;
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

// Clipped only while moving, so focus rings inside aren't cut. Height stays `auto`, never a
// measurement, so a nested step fold makes the block reflow instead of stacking animations.
function Fold({ open, id, children }: { open: boolean; id?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          id={id}
          key="fold"
          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, overflow: "hidden" }}
          animate={
            reduce
              ? { opacity: 1 }
              : { height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }
          }
          exit={
            reduce
              ? { opacity: 0, transition: springExit.fast }
              : { height: 0, opacity: 0, overflow: "hidden" }
          }
          transition={reduce ? spring.fast : FOLD}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ThinkingSteps({
  steps,
  thinking: thinkingProp,
  open: openProp,
  defaultOpen,
  onOpenChange,
  autoCollapse = true,
  duration,
  summary,
  showPending = false,
  size,
  className,
  ...props
}: ThinkingStepsProps) {
  const tokens = useSize(size);
  const reduce = useReducedMotion();
  const listId = useId();
  const thinking = thinkingProp ?? steps.some((step) => step.status !== "done");

  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? thinking);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  // Once the reader toggles the block, auto-collapse leaves it alone.
  const touched = useRef(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  // From mount until `thinking` first turns false.
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState<number | null>(null);
  useEffect(() => {
    if (thinking) return;
    setElapsed((current) => current ?? (Date.now() - startedAt) / 1000);
    if (autoCollapse && !touched.current) setOpen(false);
  }, [thinking, autoCollapse, setOpen, startedAt]);

  const visible = showPending ? steps : steps.filter((step) => step.status !== "pending");
  const active = steps.find((step) => step.status === "active");
  const seconds = duration ?? elapsed;
  const doneLabel =
    summary ?? (seconds === null ? "Thought" : `Thought for ${formatThinkingDuration(seconds)}`);

  return (
    <div
      data-slot="thinking-steps"
      data-state={thinking ? "thinking" : "done"}
      className={cn("flex w-full flex-col", tokens.text, className)}
      {...props}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          touched.current = true;
          setOpen(!open);
        }}
        className={cn(
          "group/header -mx-1 inline-flex max-w-full items-center self-start rounded-md px-1 py-1 text-left text-muted-foreground",
          tokens.gap,
          "transition-colors duration-(--duration-fast) outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span className="inline-grid min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={thinking ? "thinking" : "done"}
              className="col-start-1 row-start-1 flex min-w-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: springExit.fast }}
              transition={spring.fast}
            >
              {thinking ? (
                <ThinkingIndicator size={size} label={active?.title ?? "Thinking"} />
              ) : (
                <span className="truncate">{doneLabel}</span>
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.span
          aria-hidden
          className="grid shrink-0 place-items-center"
          initial={false}
          animate={{ rotate: open ? 90 : 0 }}
          transition={reducedTransition(spring.moderate, reduce)}
        >
          <IconChevronRight size={tokens.icon} />
        </motion.span>
      </button>

      <Fold open={open} id={listId}>
        <StepList steps={visible} size={size} />
      </Fold>
    </div>
  );
}

function StepList({ steps, size }: { steps: readonly ThinkingStep[]; size?: Size }) {
  const tokens = useSize(size);
  // Steps present when the list mounts don't replay their entrance.
  const [initialIds] = useState(() => new Set(steps.map((step) => step.id)));
  return (
    <ol className={cn("flex flex-col pt-1", tokens.gap)}>
      {steps.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          last={index === steps.length - 1}
          animateIn={!initialIds.has(step.id)}
          size={size}
        />
      ))}
    </ol>
  );
}

function StepRow({
  step,
  last,
  animateIn,
  size,
}: {
  step: ThinkingStep;
  last: boolean;
  animateIn: boolean;
  size?: Size;
}) {
  const tokens = useSize(size);
  const reduce = useReducedMotion();
  const detailId = useId();
  const [open, setOpen] = useState(step.defaultOpen ?? false);
  const hasDetail = step.detail !== undefined && step.detail !== null;
  const markerWidth = tokens.icon;

  const title = (
    <span
      className={cn(
        "min-w-0 flex-1",
        step.status === "active" ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {step.title}
    </span>
  );

  return (
    <motion.li
      data-status={step.status}
      className="relative flex"
      initial={animateIn ? { opacity: 0, y: 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedTransition(spring.moderate, reduce)}
    >
      {last ? null : (
        <span
          aria-hidden
          className="absolute top-[calc(1lh+2px)] -bottom-1 w-px -translate-x-1/2 bg-spine"
          style={{ left: markerWidth / 2 }}
        />
      )}
      <span
        className="flex h-[1lh] shrink-0 items-center justify-center"
        style={{ width: markerWidth }}
      >
        <StepMarker status={step.status} size={size} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col pl-2">
        {hasDetail ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setOpen(!open)}
            className={cn(
              "group/step -mx-1 flex items-start rounded-md px-1 text-left",
              tokens.gap,
              "transition-colors duration-(--duration-fast) outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {title}
            <motion.span
              aria-hidden
              className="grid h-[1lh] shrink-0 place-items-center text-muted-foreground"
              initial={false}
              animate={{ rotate: open ? 90 : 0 }}
              transition={reducedTransition(spring.moderate, reduce)}
            >
              <IconChevronRight size={tokens.icon - 2} />
            </motion.span>
          </button>
        ) : (
          <div className="flex">{title}</div>
        )}
        {hasDetail ? (
          <Fold open={open} id={detailId}>
            <div
              className={cn(
                "typeset pt-1 pb-1",
                tokens.typeVariant === "compact" && "typeset-compact",
                tokens.type.caption,
              )}
            >
              {step.detail}
            </div>
          </Fold>
        ) : null}
      </div>
    </motion.li>
  );
}

const STATUS_LABEL: Record<ThinkingStepStatus, string> = {
  pending: "Pending",
  active: "In progress",
  done: "Done",
};

function StepMarker({ status, size }: { status: ThinkingStepStatus; size?: Size }) {
  const tokens = useSize(size);
  const reduce = useReducedMotion();
  return (
    <span className="grid place-items-center" role="img" aria-label={STATUS_LABEL[status]}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className="col-start-1 row-start-1 grid place-items-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6, transition: springExit.fast }}
          transition={reducedTransition(spring.fast, reduce)}
        >
          {status === "done" ? (
            <IconCheck size={tokens.icon - 2} className="text-muted-foreground" aria-hidden />
          ) : status === "active" ? (
            <ThinkingGlyph pixelSize={tokens.icon - 4} />
          ) : (
            <span aria-hidden className="size-1.5 rounded-full bg-border-strong" />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
