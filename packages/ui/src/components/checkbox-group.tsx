import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "cn";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { StableLabel } from "@/components/stable-label";
import { type ItemRect, useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover";
import { type Size, useSize } from "@/lib/size";
import { INSTANT, reducedTransition, spring, springExit } from "@/lib/springs";

export interface CheckboxGroupOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  options: readonly CheckboxGroupOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  /** Called with the checked values in option order. */
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  size?: Size;
}

/** Contiguous checked rows, by index, inclusive. */
interface Run {
  start: number;
  end: number;
}

interface Block extends Run {
  key: number;
  /** The range a split-off block grows out of, so a split reads as one block parting. */
  from?: Run;
}

interface BlockState {
  signature: string;
  blocks: Block[];
  /** Old blocks a merge swallowed: they vanish at once instead of fading over the merged one. */
  absorbed: ReadonlySet<number>;
  nextKey: number;
  rects: readonly (ItemRect | undefined)[];
  /** `spring` after a selection change; `snap` after a resize, so nothing lags a reflow. */
  motion: "spring" | "snap";
}

function runsOf(checked: readonly boolean[]): Run[] {
  const runs: Run[] = [];
  for (let index = 0; index < checked.length; index++) {
    if (!checked[index]) continue;
    const last = runs.at(-1);
    if (last && last.end === index - 1) last.end = index;
    else runs.push({ start: index, end: index });
  }
  return runs;
}

const overlap = (a: Run, b: Run) =>
  Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start) + 1);

/**
 * Maps new runs onto on-screen blocks by largest overlap: a merge keeps the biggest
 * block and swallows the rest; a split grows the new blocks out of the old range.
 */
function reconcile(previous: readonly Block[], runs: readonly Run[], nextKey: number) {
  const taken = new Set<number>();
  let key = nextKey;
  const blocks = runs.map((run): Block => {
    let best: Block | undefined;
    for (const block of previous) {
      if (taken.has(block.key)) continue;
      const amount = overlap(block, run);
      if (amount > 0 && (!best || amount > overlap(best, run))) best = block;
    }
    if (best) {
      taken.add(best.key);
      return { ...run, key: best.key };
    }
    const parent = previous.find((block) => overlap(block, run) > 0);
    return { ...run, key: key++, from: parent && { start: parent.start, end: parent.end } };
  });
  const absorbed = new Set(
    previous
      .filter((block) => !taken.has(block.key) && runs.some((run) => overlap(block, run) > 0))
      .map((block) => block.key),
  );
  return { blocks, absorbed, nextKey: key };
}

function spanRect(rects: readonly (ItemRect | undefined)[], run: Run) {
  const first = rects[run.start];
  const last = rects[run.end];
  if (!first || !last) return null;
  return {
    x: first.left,
    y: first.top,
    width: first.width,
    height: last.top + last.height - first.top,
  };
}

// Literal classes so Tailwind's scanner sees them.
const BOX: Record<Size, string> = {
  compact: "size-3.5 rounded-[4px]",
  default: "size-4 rounded-[5px]",
  large: "size-[18px] rounded-md",
};

/** Contiguous checked rows merge into one `bg-selected` block. Each whole row is the checkbox. */
export function CheckboxGroup({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  size: sizeProp,
  className,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  ...props
}: CheckboxGroupProps) {
  const size = useSize(sizeProp);
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(containerRef, { axis: "y" });
  const [internal, setInternal] = useState<readonly string[]>(defaultValue ?? []);
  const value = valueProp ?? internal;

  const checked = useMemo(() => {
    const set = new Set(value);
    return options.map((option) => set.has(option.value));
  }, [options, value]);

  const toggle = useCallback(
    (optionValue: string) => {
      const set = new Set(value);
      if (set.has(optionValue)) set.delete(optionValue);
      else set.add(optionValue);
      const next = options.map((option) => option.value).filter((v) => set.has(v));
      if (valueProp === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [options, value, valueProp, onValueChange],
  );

  // Derived during render so the blocks land in the same commit as the checkmarks.
  const signature = checked.map((c) => (c ? "1" : "0")).join("");
  const [blockState, setBlockState] = useState<BlockState>(() => {
    const runs = runsOf(checked);
    return {
      signature,
      blocks: runs.map((run, key) => ({ ...run, key })),
      absorbed: new Set(),
      nextKey: runs.length,
      rects: hover.itemRects,
      motion: "snap",
    };
  });
  let current = blockState;
  if (signature !== blockState.signature) {
    const next = reconcile(blockState.blocks, runsOf(checked), blockState.nextKey);
    current = { ...next, signature, rects: hover.itemRects, motion: "spring" };
    setBlockState(current);
  } else if (hover.itemRects !== blockState.rects) {
    current = { ...blockState, rects: hover.itemRects, motion: "snap" };
    setBlockState(current);
  }

  const travel = current.motion === "snap" ? INSTANT : reducedTransition(spring.moderate, reduce);

  return (
    <div
      ref={containerRef}
      role="group"
      data-slot="checkbox-group"
      aria-disabled={disabled || undefined}
      className={cn("relative flex w-full flex-col", className)}
      {...props}
      onPointerEnter={(event) => {
        hover.handlers.onPointerEnter(event);
        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        hover.handlers.onPointerMove(event);
        onPointerMove?.(event);
      }}
      onPointerLeave={(event) => {
        hover.handlers.onPointerLeave(event);
        onPointerLeave?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        hover.handlers.onClick(event);
      }}
    >
      {hover.isMeasured ? (
        <AnimatePresence initial={false} custom={current.absorbed}>
          {current.blocks.map((block) => {
            const rect = spanRect(hover.itemRects, block);
            if (!rect) return null;
            const from = block.from ? spanRect(hover.itemRects, block.from) : null;
            return (
              <motion.div
                key={block.key}
                aria-hidden
                data-slot="checkbox-group-selection"
                className="pointer-events-none absolute top-0 left-0 rounded-lg bg-selected"
                initial={from && !reduce ? { ...from, opacity: 1 } : { ...rect, opacity: 0 }}
                animate={{ ...rect, opacity: 1 }}
                transition={{ ...travel, opacity: spring.fast }}
                variants={{
                  exit: (absorbed: ReadonlySet<number>) =>
                    absorbed.has(block.key)
                      ? { opacity: 0, transition: INSTANT }
                      : { opacity: 0, transition: springExit.moderate },
                }}
                exit="exit"
              />
            );
          })}
        </AnimatePresence>
      ) : null}
      <FluidHoverHighlight hover={hover} className="rounded-lg" />
      {options.map((option, index) => (
        <CheckboxGroupRow
          key={option.value}
          index={index}
          option={option}
          checked={checked[index] ?? false}
          disabled={disabled || Boolean(option.disabled)}
          onToggle={toggle}
          registerItem={hover.registerItem}
          setActiveIndex={hover.setActiveIndex}
          size={size.size}
        />
      ))}
    </div>
  );
}

interface CheckboxGroupRowProps {
  index: number;
  option: CheckboxGroupOption;
  checked: boolean;
  disabled: boolean;
  onToggle: (value: string) => void;
  registerItem: ReturnType<typeof useFluidHover>["registerItem"];
  setActiveIndex: ReturnType<typeof useFluidHover>["setActiveIndex"];
  size: Size;
}

function CheckboxGroupRow({
  index,
  option,
  checked,
  disabled,
  onToggle,
  registerItem,
  setActiveIndex,
  size: step,
}: CheckboxGroupRowProps) {
  const size = useSize(step);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();
  useRegisterFluidHoverItem(registerItem, index, ref);

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-describedby={option.description ? descriptionId : undefined}
      disabled={disabled}
      data-slot="checkbox-group-item"
      data-checked={checked ? "" : undefined}
      onClick={() => onToggle(option.value)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setActiveIndex(index);
      }}
      onBlur={() => setActiveIndex((active) => (active === index ? null : active))}
      className={cn(
        "relative z-10 flex w-full items-start rounded-lg text-left text-foreground outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size.row,
        size.gap,
        size.text,
      )}
    >
      {/* One line tall, so the box centres on the label's first line. */}
      <span className="flex h-lh shrink-0 items-center">
        <span
          aria-hidden
          className={cn(
            "grid place-items-center border-[1.5px] transition-colors duration-(--duration-fast)",
            BOX[step],
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground bg-transparent",
          )}
        >
          <AnimatePresence initial={false}>
            {checked ? (
              <motion.svg
                key="check"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="col-start-1 row-start-1 size-full p-px"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: springExit.fast }}
                transition={spring.fast}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduce ? INSTANT : spring.moderate}
                />
              </motion.svg>
            ) : null}
          </AnimatePresence>
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <StableLabel className={cn(checked && "font-semibold")}>{option.label}</StableLabel>
        {option.description ? (
          <span id={descriptionId} className={cn("text-muted-foreground", size.type.caption)}>
            {option.description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
