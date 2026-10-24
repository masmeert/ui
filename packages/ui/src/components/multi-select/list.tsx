import { IconCheck } from "@tabler/icons-react";
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
import { MultiSelectGroupContext, useMultiSelectContext } from "./context";

const MultiSelectHoverContext = createContext<FluidHover["registerItem"] | null>(null);

export interface MultiSelectListProps {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function MultiSelectList({
  children,
  ariaLabel = "Options",
  className,
}: MultiSelectListProps) {
  const context = useMultiSelectContext("MultiSelectList");
  const listRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(listRef);
  const { remeasure, setActiveIndex } = hover;
  const { activeValue, indexOf, open, setActiveValue, values, valueAt } = context;
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

  const selectedRect = values.length ? hover.itemRects[indexOf(values[0])] : undefined;

  return (
    <div
      ref={listRef}
      id={context.listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable="true"
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
      <MultiSelectHoverContext.Provider value={hover.registerItem}>
        {children}
      </MultiSelectHoverContext.Provider>
    </div>
  );
}

export interface MultiSelectGroupProps {
  children: ReactNode;
  className?: string;
}

export function MultiSelectGroup({ children, className }: MultiSelectGroupProps) {
  const context = useMultiSelectContext("MultiSelectGroup");
  const groupId = useId();
  return (
    <MultiSelectGroupContext.Provider value={groupId}>
      <fieldset
        hidden={!context.hasVisibleItems(groupId)}
        className={cn("m-0 min-w-0 border-0 p-0 py-0.5", className)}
      >
        {children}
      </fieldset>
    </MultiSelectGroupContext.Provider>
  );
}

export interface MultiSelectLabelProps {
  children: ReactNode;
  className?: string;
}

export function MultiSelectLabel({ children, className }: MultiSelectLabelProps) {
  const context = useMultiSelectContext("MultiSelectLabel");
  const tokens = useSize(context.size);
  const groupId = useContext(MultiSelectGroupContext);
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

export interface MultiSelectItemProps {
  value: string;
  children: ReactNode;
  textValue?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
  className?: string;
}

export function MultiSelectItem({
  value,
  children,
  textValue,
  keywords = [],
  disabled = false,
  onSelect,
  className,
}: MultiSelectItemProps) {
  const context = useMultiSelectContext("MultiSelectItem");
  const tokens = useSize(context.size);
  const registerHover = useContext(MultiSelectHoverContext);
  const groupId = useContext(MultiSelectGroupContext);
  const id = useId();
  const itemRef = useRef<HTMLButtonElement>(null);
  const label = textValue ?? (typeof children === "string" ? children : value);
  const visible = context.isVisible(value);
  const active = context.activeValue === value;
  const selected = context.values.includes(value);
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
      data-multi-select-item=""
      data-active={active || undefined}
      data-selected={selected || undefined}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => {
        if (disabled) return;
        onSelect?.(value);
        context.toggle(value);
      }}
      className={cn(
        "relative flex w-full items-center rounded-lg text-left transition-colors duration-(--duration-fast) outline-none",
        tokens.row,
        tokens.text,
        tokens.gap,
        active || selected ? "text-foreground" : "text-muted-foreground",
        "disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: selected ? 1 : 0,
          transform: selected ? "scale(1)" : "scale(0.82)",
        }}
        transition={reducedTransition(spring.fast, context.reduce)}
        className="grid size-5 shrink-0 place-items-center text-foreground"
      >
        <IconCheck size={tokens.icon} />
      </motion.span>
    </button>
  );
}

export interface MultiSelectEmptyProps {
  children?: ReactNode;
  className?: string;
}

export function MultiSelectEmpty({
  children = "No options found.",
  className,
}: MultiSelectEmptyProps) {
  const context = useMultiSelectContext("MultiSelectEmpty");
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

export interface MultiSelectSeparatorProps {
  className?: string;
}

export function MultiSelectSeparator({ className }: MultiSelectSeparatorProps) {
  return <div aria-hidden="true" className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}
