import { IconCheck } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "cn";
import { Button } from "@/components/button";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { Kbd } from "@/components/kbd";
import { StableLabel } from "@/components/stable-label";
import { type FluidHover, useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover";
import { type Size, type SizeTokens, useSize } from "@/lib/size";
import { Elevated } from "@/lib/surface";
import { reducedTransition, spring, springExit } from "@/lib/springs";

export interface QuestionOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface Question {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  options: readonly QuestionOption[];
  /** Checkboxes instead of radios. */
  multiple?: boolean;
  /** Adds a last "Other" option with a free-text field. */
  allowOther?: boolean;
  otherLabel?: string;
  otherPlaceholder?: string;
  /** Show Skip for this question. Defaults to the component's `allowSkip`. */
  skippable?: boolean;
}

export interface QuestionAnswer {
  /** Picked option values, in option order. Empty when skipped or only "Other" was picked. */
  values: string[];
  /** The free text, when "Other" was picked. */
  other?: string;
  skipped?: boolean;
}

export type QuestionAnswers = Record<string, QuestionAnswer>;

export interface AskUserQuestionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  questions: readonly Question[];
  /** Every answer, keyed by question id. */
  onComplete: (answers: QuestionAnswers) => void;
  onStepChange?: (index: number) => void;
  /** A question's own `skippable` wins. */
  allowSkip?: boolean;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  submitLabel?: string;
  size?: Size;
}

/** Internal value for the "Other" row; never leaks into `values`. */
const OTHER = "\u0000other";

type Draft = { values: string[]; other: string; skipped?: boolean };

function emptyDraft(): Draft {
  return { values: [], other: "" };
}

function isComplete(question: Question, draft: Draft): boolean {
  if (draft.values.length === 0) return false;
  if (draft.values.includes(OTHER) && draft.other.trim() === "") return false;
  return true;
}

function toAnswer(question: Question, draft: Draft | undefined): QuestionAnswer {
  if (!draft || draft.skipped) return { values: [], skipped: true };
  const order = question.options.map((option) => option.value);
  const values = draft.values
    .filter((value) => value !== OTHER)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return draft.values.includes(OTHER) ? { values, other: draft.other.trim() } : { values };
}

type Row = QuestionOption & { isOther?: boolean };

function rowsFor(question: Question): Row[] {
  const rows: Row[] = [...question.options];
  if (question.allowOther) {
    rows.push({ value: OTHER, label: question.otherLabel ?? "Other", isOther: true });
  }
  return rows;
}

const TEXT_ENTRY = "input, textarea, [contenteditable='true'], [contenteditable='']";

// Keyboard: arrows move (single-select follows focus, as a radio group), 1–9 picks, Space
// toggles, Enter continues. In the "Other" field only Enter is intercepted.
export function AskUserQuestions({
  questions,
  onComplete,
  onStepChange,
  allowSkip = true,
  nextLabel = "Next",
  backLabel = "Back",
  skipLabel = "Skip",
  submitLabel = "Submit",
  size,
  className,
  onKeyDown,
  ...props
}: AskUserQuestionsProps) {
  const tokens = useSize(size);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [navigated, setNavigated] = useState(false);
  // Set right before a pick that should land in the "Other" field (click, number key);
  // arrow keys leave focus on the row.
  const focusOther = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const question = questions[step];
  const draft = (question && drafts[question.id]) ?? emptyDraft();
  const last = step === questions.length - 1;
  const canSkip = question?.skippable ?? allowSkip;

  const updateDraft = useCallback(
    (id: string, next: Draft) => setDrafts((current) => ({ ...current, [id]: next })),
    [],
  );

  const goTo = (index: number, all: Record<string, Draft>) => {
    if (index >= questions.length) {
      const answers: QuestionAnswers = {};
      for (const q of questions) answers[q.id] = toAnswer(q, all[q.id]);
      onComplete(answers);
      return;
    }
    setDirection(index > step ? 1 : -1);
    setNavigated(true);
    setStep(index);
    onStepChange?.(index);
  };

  const next = (all = drafts) => {
    if (!question) return;
    const current = all[question.id] ?? emptyDraft();
    if (!isComplete(question, current)) return;
    goTo(step + 1, all);
  };

  const skip = () => {
    if (!question) return;
    const all = { ...drafts, [question.id]: { ...emptyDraft(), skipped: true } };
    setDrafts(all);
    goTo(step + 1, all);
  };

  /** Picks a row: selects it (single) or toggles it (multi). Returns the new drafts. */
  const pick = (row: Row, { toggle = true }: { toggle?: boolean } = {}) => {
    if (!question || row.disabled) return drafts;
    let values: string[];
    if (question.multiple) {
      const has = draft.values.includes(row.value);
      values = has
        ? toggle
          ? draft.values.filter((value) => value !== row.value)
          : draft.values
        : [...draft.values, row.value];
    } else {
      values = [row.value];
    }
    const nextDraft: Draft = { ...draft, values, skipped: false };
    updateDraft(question.id, nextDraft);
    return { ...drafts, [question.id]: nextDraft };
  };

  const optionElements = () =>
    Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-slot=question-option]") ?? [],
    );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !question || event.nativeEvent.isComposing) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement;
    const rows = rowsFor(question);

    if (target.closest(TEXT_ENTRY)) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        next();
      } else if (event.key === "Escape") {
        // Back out of the field onto its row.
        const options = optionElements();
        options[options.length - 1]?.focus();
      }
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      const index = Number(event.key) - 1;
      const row = rows[index];
      if (!row || row.disabled) return;
      event.preventDefault();
      focusOther.current = row.isOther === true;
      pick(row);
      if (!row.isOther) optionElements()[index]?.focus();
      return;
    }

    const optionIndex = optionElements().indexOf(target as HTMLButtonElement);
    if (optionIndex === -1) return;
    const row = rows[optionIndex];
    if (!row) return;

    if (event.key === "Enter") {
      event.preventDefault();
      if (question.multiple) {
        next();
      } else if (row.isOther) {
        focusOther.current = true;
        pick(row);
      } else {
        next(pick(row, { toggle: false }));
      }
    } else if (event.key === " ") {
      event.preventDefault();
      focusOther.current = row.isOther === true;
      pick(row);
    }
  };

  const stepVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : 16 * dir }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({
      opacity: 0,
      x: reduce ? 0 : -16 * dir,
      transition: springExit.moderate,
    }),
  };

  if (!question) return null;

  return (
    <Elevated
      offset={1}
      ref={rootRef}
      data-slot="ask-user-questions"
      className={cn(
        "flex w-full flex-col overflow-clip rounded-xl border border-border",
        className,
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={question.id}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reducedTransition(spring.moderate, reduce)}
          className={cn("flex flex-col p-2", tokens.gap)}
        >
          <div className="flex flex-col gap-1 px-2 pt-2 pb-1">
            <h3 id={titleId} className={cn(tokens.type.subtitle, "font-semibold text-foreground")}>
              {question.title}
            </h3>
            {question.description ? (
              <p className={cn(tokens.type.caption, "text-muted-foreground")}>
                {question.description}
              </p>
            ) : null}
          </div>
          <OptionList
            question={question}
            draft={draft}
            labelledBy={titleId}
            focusOnMount={navigated}
            tokens={tokens}
            onPick={(row) => {
              focusOther.current = row.isOther === true;
              pick(row);
            }}
          />
          {question.allowOther && draft.values.includes(OTHER) ? (
            <motion.div
              className="px-2 pb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={spring.fast}
            >
              <input
                ref={(element) => {
                  if (element && focusOther.current) {
                    focusOther.current = false;
                    element.focus();
                  }
                }}
                aria-label={question.otherLabel ?? "Other"}
                placeholder={question.otherPlaceholder ?? "Type your answer"}
                value={draft.other}
                onChange={(event) =>
                  updateDraft(question.id, { ...draft, other: event.target.value })
                }
                className={cn(
                  "w-full rounded-lg border border-border bg-transparent outline-none",
                  tokens.control,
                  tokens.controlPx,
                  tokens.field,
                  "transition-colors duration-(--duration-fast) placeholder:text-muted-foreground focus-visible:border-border-strong",
                )}
              />
            </motion.div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className={cn("flex items-center border-t border-border p-2", tokens.gap)}>
        <Button
          variant="ghost"
          disabled={step === 0}
          onClick={() => goTo(step - 1, drafts)}
          className={footerButton(tokens, step === 0 && "invisible")}
        >
          {backLabel}
        </Button>
        <StepDots count={questions.length} current={step} tokens={tokens} />
        <div className="flex-1" />
        {canSkip ? (
          <Button variant="ghost" onClick={skip} className={footerButton(tokens)}>
            {skipLabel}
          </Button>
        ) : null}
        <Button
          variant="primary"
          disabled={!isComplete(question, draft)}
          onClick={() => next()}
          className={footerButton(tokens)}
        >
          {last ? submitLabel : nextLabel}
        </Button>
      </div>
    </Elevated>
  );
}

function footerButton(tokens: SizeTokens, extra?: string | false) {
  return cn(
    tokens.control,
    tokens.controlPx,
    tokens.text,
    tokens.gap,
    "rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    "data-[variant=ghost]:hover:bg-hover",
    extra,
  );
}

function StepDots({
  count,
  current,
  tokens,
}: {
  count: number;
  current: number;
  tokens: SizeTokens;
}) {
  if (count < 2) return null;
  return (
    <div className={cn("flex items-center", tokens.gap)}>
      <div aria-hidden className="flex items-center gap-1">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-1.5 rounded-full transition-colors duration-(--duration-moderate)",
              index === current
                ? "bg-foreground"
                : index < current
                  ? "bg-muted-foreground"
                  : "bg-border-strong",
            )}
          />
        ))}
      </div>
      <span className={cn(tokens.type.caption, "text-muted-foreground tabular-nums")}>
        {current + 1} of {count}
      </span>
    </div>
  );
}

function OptionList({
  question,
  draft,
  labelledBy,
  focusOnMount,
  tokens,
  onPick,
}: {
  question: Question;
  draft: Draft;
  labelledBy: string;
  focusOnMount: boolean;
  tokens: SizeTokens;
  onPick: (row: Row) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(containerRef);
  const rows = rowsFor(question);
  const enabled = rows.map((row, index) => (row.disabled ? -1 : index)).filter((i) => i >= 0);
  const firstSelected = rows.findIndex((row) => draft.values.includes(row.value));
  const [focusIndex, setFocusIndex] = useState(
    firstSelected >= 0 ? firstSelected : (enabled[0] ?? 0),
  );

  const elements = () =>
    Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>("[data-slot=question-option]") ??
        [],
    );

  // Only steps reached with Next/Back take focus; the first render would yank it into a transcript.
  useEffect(() => {
    if (focusOnMount) elements()[focusIndex]?.focus();
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusAt = (index: number | undefined) => {
    if (index === undefined) return;
    elements()[index]?.focus();
    // `isOther: false`: arrowing onto "Other" picks it without jumping into its field.
    if (!question.multiple) onPick({ ...rows[index]!, isOther: false });
  };

  const step = (from: number, delta: number) => {
    const position = enabled.indexOf(from);
    if (position === -1) return focusAt(enabled[0]);
    focusAt(enabled[(position + delta + enabled.length) % enabled.length]);
  };

  return (
    <div
      ref={containerRef}
      role={question.multiple ? "group" : "radiogroup"}
      aria-labelledby={labelledBy}
      className="relative flex flex-col gap-0.5"
      {...hover.handlers}
      onKeyDown={(event) => {
        const index = elements().indexOf(event.target as HTMLButtonElement);
        if (index === -1) return;
        const key = event.key;
        if (key === "ArrowDown" || key === "ArrowRight") step(index, 1);
        else if (key === "ArrowUp" || key === "ArrowLeft") step(index, -1);
        else if (key === "Home") focusAt(enabled[0]);
        else if (key === "End") focusAt(enabled[enabled.length - 1]);
        else return;
        event.preventDefault();
      }}
    >
      <FluidHoverHighlight hover={hover} className="rounded-lg" />
      {rows.map((row, index) => (
        <OptionRow
          key={row.value}
          row={row}
          index={index}
          multiple={question.multiple === true}
          selected={draft.values.includes(row.value)}
          tabbable={index === focusIndex}
          tokens={tokens}
          registerItem={hover.registerItem}
          onFocus={() => {
            setFocusIndex(index);
            hover.setActiveIndex(index);
          }}
          onBlur={() => hover.setActiveIndex(null)}
          onClick={() => onPick(row)}
        />
      ))}
    </div>
  );
}

function OptionRow({
  row,
  index,
  multiple,
  selected,
  tabbable,
  tokens,
  registerItem,
  onFocus,
  onBlur,
  onClick,
}: {
  row: Row;
  index: number;
  multiple: boolean;
  selected: boolean;
  tabbable: boolean;
  tokens: SizeTokens;
  registerItem: FluidHover["registerItem"];
  onFocus: () => void;
  onBlur: () => void;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  useRegisterFluidHoverItem(registerItem, index, ref);

  return (
    <button
      ref={ref}
      type="button"
      data-slot="question-option"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-disabled={row.disabled || undefined}
      tabIndex={tabbable ? 0 : -1}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={row.disabled ? undefined : onClick}
      className={cn(
        "relative flex w-full items-start rounded-lg text-left outline-none",
        tokens.row,
        tokens.gap,
        tokens.text,
        "transition-colors duration-(--duration-fast)",
        "focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-selected",
        row.disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="flex h-[1lh] shrink-0 items-center">
        <span
          aria-hidden
          className={cn(
            "grid size-4 place-items-center border transition-colors duration-(--duration-fast)",
            multiple ? "rounded-[5px]" : "rounded-full",
            selected
              ? "border-foreground bg-foreground text-background"
              : "border-border-strong bg-transparent",
          )}
        >
          <AnimatePresence initial={false}>
            {selected ? (
              <motion.span
                key="mark"
                className="grid place-items-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: springExit.fast }}
                transition={reducedTransition(spring.fast, reduce)}
              >
                {multiple ? (
                  <IconCheck className="size-3" stroke={3} />
                ) : (
                  <span className="size-1.5 rounded-full bg-background" />
                )}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <StableLabel className={cn("text-foreground", selected && "font-semibold")}>
          {row.label}
        </StableLabel>
        {row.description ? (
          <span className={cn(tokens.type.caption, "text-muted-foreground")}>
            {row.description}
          </span>
        ) : null}
      </span>
      {index < 9 ? (
        <span className="flex h-[1lh] shrink-0 items-center">
          <Kbd aria-hidden className={cn(tokens.type.micro, "bg-hover")}>
            {index + 1}
          </Kbd>
        </span>
      ) : null}
    </button>
  );
}
