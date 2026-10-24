import { motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type ItemRect, useFluidHover } from "@/hooks/use-fluid-hover";
import { useFluidHoverDomItems } from "@/hooks/use-fluid-hover-dom-items";
import { useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";
import { cn } from "cn";

type RadioCtx = {
  value: string;
  setValue: (value: string) => void;
  layoutId: string;
  disabled: boolean;
};

const RadioCtx = createContext<RadioCtx | null>(null);

function useRadioGroup() {
  const ctx = useContext(RadioCtx);
  if (!ctx) {
    throw new Error("RadioGroupItem must be used inside <RadioGroup>");
  }
  return ctx;
}

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const NEXT_KEYS = new Set(["ArrowDown", "ArrowRight"]);

// Rows have no padding (they align with other form rows), so the highlight grows past them.
const HOVER_INSET = { x: 8, y: 6 };
const ITEM_SELECTOR = '[data-slot="radio-group-item"]';

function inflate(rect: ItemRect | undefined): ItemRect | undefined {
  return (
    rect && {
      left: rect.left - HOVER_INSET.x,
      top: rect.top - HOVER_INSET.y,
      width: rect.width + HOVER_INSET.x * 2,
      height: rect.height + HOVER_INSET.y * 2,
    }
  );
}
const PREVIOUS_KEYS = new Set(["ArrowUp", "ArrowLeft"]);

export function RadioGroup({
  value,
  defaultValue = "",
  onValueChange,
  children,
  className,
  orientation = "vertical",
  disabled = false,
  ...labelling
}: RadioGroupProps) {
  const [internal, setInternal] = useState(defaultValue);
  const layoutId = useId();
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const setValue = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );
  const contextValue = useMemo(
    () => ({ value: current, setValue, layoutId, disabled }),
    [current, layoutId, setValue, disabled],
  );

  const groupRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(groupRef, { axis: orientation === "vertical" ? "y" : "xy" });
  const { from, indexOf } = useFluidHoverDomItems(hover, groupRef, ITEM_SELECTOR, "[data-checked]");
  const { setActiveIndex } = hover;
  const paddedHover = useMemo(
    () => ({ ...hover, itemRects: hover.itemRects.map((rect) => inflate(rect) as ItemRect) }),
    [hover],
  );

  return (
    <RadioCtx.Provider value={contextValue}>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        {...labelling}
        {...hover.handlers}
        // Arrow keys move focus and the choice together; a visible focus lights the highlight.
        onFocus={(event) => {
          if (event.target.matches(":focus-visible")) setActiveIndex(indexOf(event.target));
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setActiveIndex(null);
          }
        }}
        onKeyDown={(event) => {
          const forward = NEXT_KEYS.has(event.key);
          if (
            !forward &&
            !PREVIOUS_KEYS.has(event.key) &&
            event.key !== "Home" &&
            event.key !== "End"
          ) {
            return;
          }
          const radios = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "[role=radio]:not(:disabled)",
            ),
          ];
          if (radios.length === 0) return;
          event.preventDefault();
          const index = radios.indexOf(document.activeElement as HTMLButtonElement);
          const target =
            event.key === "Home"
              ? radios[0]
              : event.key === "End"
                ? radios[radios.length - 1]
                : radios[(index + (forward ? 1 : -1) + radios.length) % radios.length];
          target.focus();
          target.click();
        }}
        className={cn(
          "relative flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          className,
        )}
      >
        <FluidHoverHighlight hover={paddedHover} from={inflate(from ?? undefined)} />
        {children}
      </div>
    </RadioCtx.Provider>
  );
}

export interface RadioGroupItemProps {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function RadioGroupItem({
  value,
  label,
  description,
  disabled,
  className,
  id: idProp,
}: RadioGroupItemProps) {
  const { value: groupValue, setValue, layoutId, disabled: groupDisabled } = useRadioGroup();
  const autoId = useId();
  const id = idProp ?? autoId;
  const reduce = useReducedMotion();
  const tokens = useSize();
  const selected = groupValue === value;
  const isDisabled = disabled || groupDisabled;

  return (
    <label
      htmlFor={id}
      data-slot="radio-group-item"
      // Keeps a disabled row out of the hover list.
      data-disabled={isDisabled ? "" : undefined}
      className={cn(
        "relative inline-flex items-center gap-3",
        isDisabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <motion.button
        id={id}
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={isDisabled}
        // Roving focus: Tab lands on the selected radio, or any radio before a choice.
        tabIndex={selected || !groupValue ? 0 : -1}
        onClick={() => !isDisabled && setValue(value)}
        whileTap={reduce || isDisabled ? undefined : { scale: 0.95 }}
        transition={spring.fast}
        data-state={selected ? "checked" : "unchecked"}
        data-checked={selected ? "" : undefined}
        data-unchecked={selected ? undefined : ""}
        className={cn(
          "relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-(--duration-fast) outline-none",
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-60",
          selected ? "border-brand" : "border-muted-foreground/50 hover:border-muted-foreground",
        )}
      >
        {selected ? (
          <motion.span
            layoutId={layoutId}
            className="absolute inset-1 rounded-full bg-primary"
            transition={reducedTransition(spring.moderate, reduce)}
          />
        ) : null}
      </motion.button>
      {label ? (
        <span
          className={cn(
            "flex flex-col text-foreground select-none",
            tokens.type.body,
            isDisabled && "opacity-60",
          )}
        >
          {label}
          {description ? (
            <span className={cn("text-muted-foreground", tokens.type.caption)}>{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
