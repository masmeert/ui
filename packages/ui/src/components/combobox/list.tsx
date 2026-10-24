import { Check } from "lucide-react";
import { motion } from "motion/react";
import {
  createContext,
  type PointerEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type FluidHover, useFluidHover } from "@/hooks/use-fluid-hover";
import { useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";
import { cn } from "cn";
import { ComboboxGroupContext, useComboboxContext } from "./context";

const ComboboxHoverContext = createContext<FluidHover["registerItem"] | null>(null);

export interface ComboboxListProps {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function ComboboxList({ children, ariaLabel = "Options", className }: ComboboxListProps) {
  const context = useComboboxContext("ComboboxList");
  const listRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(listRef);
  const { remeasure, setActiveIndex } = hover;
  const { activeValue, indexOf, open, setActiveValue, value, valueAt } = context;
  const activeIndex = activeValue === null ? -1 : indexOf(activeValue);

  // The active option drives the highlight. Only a pointer pick flows back into it:
  // quick key steps leave the hook's index a step behind, and treating that echo as
  // a pick would bounce the two rows back and forth forever.
  const pointerPicked = useRef(false);
  useEffect(() => {
    pointerPicked.current = false;
    setActiveIndex(activeIndex < 0 ? null : activeIndex);
  }, [activeIndex, setActiveIndex]);

  // Read through a ref so this runs on a new pick only.
  const latest = useRef({ activeValue, valueAt });
  useLayoutEffect(() => {
    latest.current = { activeValue, valueAt };
  });
  useEffect(() => {
    if (hover.activeIndex === null || !pointerPicked.current) return;
    pointerPicked.current = false;
    const picked = latest.current.valueAt(hover.activeIndex);
    if (picked !== undefined && picked !== latest.current.activeValue) setActiveValue(picked);
  }, [hover.activeIndex, setActiveValue]);
  const handlers = useMemo(
    () => ({
      ...hover.handlers,
      onPointerEnter(event: PointerEvent<HTMLDivElement>) {
        pointerPicked.current = true;
        hover.handlers.onPointerEnter(event);
      },
      onPointerMove(event: PointerEvent<HTMLDivElement>) {
        pointerPicked.current = true;
        hover.handlers.onPointerMove(event);
      },
    }),
    [hover.handlers],
  );

  useEffect(() => {
    if (open) remeasure();
  }, [open, remeasure]);

  const selectedRect = value === undefined ? undefined : hover.itemRects[indexOf(value)];

  return (
    <div
      ref={listRef}
      id={context.listId}
      role="listbox"
      aria-label={ariaLabel}
      {...handlers}
      className={cn(
        "relative isolate max-h-64 scrollbar-none overflow-y-auto overscroll-contain p-1.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {/* Shows the active option (the Enter target), not the pointer's pick. A fixed
          session stops a pointer entry from re-fading a highlight already on screen. */}
      <FluidHoverHighlight
        hover={{ ...hover, activeIndex: activeIndex < 0 ? null : activeIndex, session: 0 }}
        from={selectedRect}
      />
      <ComboboxHoverContext.Provider value={hover.registerItem}>
        {children}
      </ComboboxHoverContext.Provider>
    </div>
  );
}

export interface ComboboxGroupProps {
  children: ReactNode;
  className?: string;
}

export function ComboboxGroup({ children, className }: ComboboxGroupProps) {
  const context = useComboboxContext("ComboboxGroup");
  const groupId = useId();
  return (
    <ComboboxGroupContext.Provider value={groupId}>
      <fieldset
        hidden={!context.hasVisibleItems(groupId)}
        className={cn("m-0 min-w-0 border-0 p-0 py-0.5", className)}
      >
        {children}
      </fieldset>
    </ComboboxGroupContext.Provider>
  );
}

export interface ComboboxLabelProps {
  children: ReactNode;
  className?: string;
}

export function ComboboxLabel({ children, className }: ComboboxLabelProps) {
  const context = useComboboxContext("ComboboxLabel");
  const tokens = useSize(context.size);
  const groupId = useContext(ComboboxGroupContext);
  const labelClassName = cn(
    "w-full px-2.5 py-1.5 text-muted-foreground",
    tokens.type.caption,
    className,
  );
  return groupId ? (
    <legend className={labelClassName}>{children}</legend>
  ) : (
    <div className={labelClassName}>{children}</div>
  );
}

export interface ComboboxItemProps {
  value: string;
  children: ReactNode;
  textValue?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
}

export function ComboboxItem({
  value,
  children,
  textValue,
  keywords = [],
  disabled = false,
  onSelect,
  className,
}: ComboboxItemProps) {
  const context = useComboboxContext("ComboboxItem");
  const tokens = useSize(context.size);
  const registerHover = useContext(ComboboxHoverContext);
  const groupId = useContext(ComboboxGroupContext);
  const id = useId();
  const itemRef = useRef<HTMLButtonElement>(null);
  const label = textValue ?? (typeof children === "string" ? children : value);
  const visible = context.isVisible(value);
  const active = context.activeValue === value;
  const selected = context.value === value;
  const keywordKey = keywords.join("\u0000");
  const normalizedKeywords = useMemo(
    () => (keywordKey ? keywordKey.split("\u0000") : []),
    [keywordKey],
  );
  const { registerItem, unregisterItem } = context;

  useLayoutEffect(() => {
    registerItem({
      value,
      label,
      keywords: normalizedKeywords,
      disabled,
      groupId,
      id,
      ref: itemRef,
    });
    return () => unregisterItem(value);
  }, [disabled, groupId, id, label, normalizedKeywords, registerItem, unregisterItem, value]);

  const slot = context.indexOf(value);
  useLayoutEffect(() => {
    if (!registerHover || !visible || slot < 0) return;
    registerHover(slot, itemRef.current);
    return () => registerHover(slot, null);
  }, [registerHover, slot, visible]);

  if (!visible) return null;

  return (
    <button
      ref={itemRef}
      id={id}
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      tabIndex={-1}
      data-combobox-item=""
      data-active={active || undefined}
      data-selected={selected || undefined}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => {
        if (disabled) return;
        onSelect?.(value);
        context.select(value);
      }}
      className={cn(
        "relative flex w-full items-center rounded-lg text-left transition-colors duration-(--duration-fast) outline-none",
        tokens.row,
        tokens.text,
        tokens.gap,
        active ? "text-foreground" : "text-muted-foreground",
        "disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          transform: selected ? "scale(1)" : "scale(0.82)",
        }}
        transition={reducedTransition(spring.fast, context.reduce)}
        className="grid size-5 shrink-0 place-items-center text-foreground"
      >
        <Check size={tokens.icon} />
      </motion.span>
    </button>
  );
}

export interface ComboboxEmptyProps {
  children?: ReactNode;
  className?: string;
}

export function ComboboxEmpty({ children = "No options found.", className }: ComboboxEmptyProps) {
  const context = useComboboxContext("ComboboxEmpty");
  const tokens = useSize(context.size);
  if (context.visibleCount > 0) return null;
  return (
    <div
      role="status"
      className={cn("px-3 py-8 text-center text-muted-foreground", tokens.type.body, className)}
    >
      {children}
    </div>
  );
}

export interface ComboboxSeparatorProps {
  className?: string;
}

export function ComboboxSeparator({ className }: ComboboxSeparatorProps) {
  return <div aria-hidden className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}
