import { Check, ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { useFluidHoverDomItems } from "@/hooks/use-fluid-hover-dom-items";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { cn } from "cn";

const MORPH_OPEN: Transition = spring.slow;
const MORPH_CLOSE: Transition = springExit.slow;

// The header sits inside the panel's border, so it's the control height minus 2px.
const ROW = "flex w-full items-center justify-between";
const HEADER_HEIGHT: Record<Size, string> = {
  compact: "h-[30px]",
  default: "h-[34px]",
  large: "h-[42px]",
};

const LIST: Variants = {
  hidden: {},
  // Orchestration offsets, not durations.
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring.moderate },
};

interface MorphContextValue {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  select: (value: string) => void;
  register: (value: string, label: string) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  placeholder: string;
  setPlaceholder: (p: string) => void;
  reduce: boolean;
  layoutId: string;
  triggerId: string;
  listId: string;
  disabled: boolean;
  size: Size | undefined;
}

const MorphContext = createContext<MorphContextValue | null>(null);

function useMorphContext(component: string) {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error(`${component} must be used within <MorphingSelect>`);
  return ctx;
}

export interface MorphingSelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: Size;
  className?: string;
  children: ReactNode;
}

/** A select whose trigger morphs into the panel via a shared layoutId. */
export function MorphingSelect({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  size,
  className,
  children,
}: MorphingSelectProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  // Ref-counted: items render twice (hidden registrar + open panel).
  const [labels, setLabels] = useState<Map<string, { label: string; count: number }>>(new Map());
  const [placeholder, setPlaceholder] = useState("Select");

  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    },
    [controlled, onValueChange],
  );

  const register = useCallback((v: string, label: string) => {
    setLabels((m) => {
      const next = new Map(m);
      next.set(v, { label, count: (m.get(v)?.count ?? 0) + 1 });
      return next;
    });
  }, []);
  const unregister = useCallback((v: string) => {
    setLabels((m) => {
      const entry = m.get(v);
      if (!entry) return m;
      const next = new Map(m);
      if (entry.count <= 1) next.delete(v);
      else next.set(v, { label: entry.label, count: entry.count - 1 });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const ctx = useMemo<MorphContextValue>(
    () => ({
      value: current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labelFor: (v) => (v === undefined ? undefined : labels.get(v)?.label),
      placeholder,
      setPlaceholder,
      reduce,
      layoutId: `${baseId}-surface`,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      disabled,
      size,
    }),
    [
      current,
      open,
      select,
      register,
      unregister,
      labels,
      placeholder,
      reduce,
      baseId,
      disabled,
      size,
    ],
  );

  return (
    <MorphContext.Provider value={ctx}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </MorphContext.Provider>
  );
}

export interface MorphingSelectValueProps {
  placeholder?: string;
  className?: string;
}

export function MorphingSelectValue({ placeholder, className }: MorphingSelectValueProps) {
  const ctx = useMorphContext("MorphingSelectValue");
  // The panel header renders in content and needs the placeholder.
  const { setPlaceholder } = ctx;
  useEffect(() => {
    if (placeholder) setPlaceholder(placeholder);
  }, [placeholder, setPlaceholder]);
  const label = ctx.labelFor(ctx.value);
  return (
    <span className={cn(label ? "text-foreground" : "text-muted-foreground", className)}>
      {label ?? placeholder ?? "Select"}
    </span>
  );
}

export interface MorphingSelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export function MorphingSelectTrigger({ className, children }: MorphingSelectTriggerProps) {
  const ctx = useMorphContext("MorphingSelectTrigger");
  const tokens = useSize(ctx.size);
  const row = cn(ROW, tokens.control, tokens.controlPx, tokens.text, tokens.gap);
  return (
    <>
      {/* Reserves the closed height; the morph surface is absolute. */}
      <div aria-hidden inert className={cn(row, "invisible rounded-xl border border-border")}>
        {children}
        <ChevronDown size={tokens.icon} />
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {!ctx.open ? (
          <motion.button
            key="trigger"
            layoutId={ctx.layoutId}
            type="button"
            id={ctx.triggerId}
            disabled={ctx.disabled}
            aria-haspopup="listbox"
            aria-expanded={ctx.open}
            aria-controls={ctx.listId}
            onClick={() => ctx.setOpen(true)}
            // Plays when the trigger takes the shared layout back, i.e. on close.
            transition={reducedTransition(MORPH_CLOSE, ctx.reduce)}
            style={{ borderRadius: 12 }}
            className={cn(
              row,
              "absolute inset-x-0 top-0 z-10 border border-border bg-background text-foreground transition-colors duration-(--duration-fast) outline-none",
              "hover:border-border-strong focus-visible:ring-4 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50",
              className,
            )}
          >
            <motion.span layout="position" className="min-w-0 truncate">
              {children}
            </motion.span>
            <motion.span layout="position" className="text-muted-foreground">
              <ChevronDown size={tokens.icon} />
            </motion.span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export interface MorphingSelectContentProps {
  className?: string;
  children: ReactNode;
}

export function MorphingSelectContent({ className, children }: MorphingSelectContentProps) {
  const ctx = useMorphContext("MorphingSelectContent");
  const tokens = useSize(ctx.size);
  const surface = useElevation(SURFACE_OFFSET.popover, { shadowLevel: 3 });
  const label = ctx.labelFor(ctx.value);
  const listRef = useRef<HTMLUListElement>(null);
  const hover = useFluidHover(listRef);
  const { from, indexOf, refresh } = useFluidHoverDomItems(
    hover,
    listRef,
    '[role="option"]',
    '[aria-selected="true"]',
  );
  const { setActiveIndex } = hover;
  return (
    <>
      {/* Keeps label registrations alive so the trigger shows the value before first open. */}
      <div className="hidden">{children}</div>

      <AnimatePresence initial={false} mode="popLayout">
        {ctx.open ? (
          <motion.div
            key="panel"
            layoutId={ctx.layoutId}
            id={ctx.listId}
            role="listbox"
            aria-labelledby={ctx.triggerId}
            transition={reducedTransition(MORPH_OPEN, ctx.reduce)}
            style={{ borderRadius: 12 }}
            className={cn(
              "absolute inset-x-0 top-0 z-(--z-popup) overflow-hidden border border-border",
              surface.className,
              className,
            )}
          >
            <motion.button
              type="button"
              layout="position"
              aria-expanded
              onClick={() => ctx.setOpen(false)}
              className={cn(
                ROW,
                HEADER_HEIGHT[tokens.size],
                tokens.controlPx,
                tokens.text,
                tokens.gap,
                "outline-none",
              )}
            >
              <span
                className={cn(
                  "min-w-0 truncate",
                  label ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label ?? ctx.placeholder}
              </span>
              <motion.span
                animate={{ rotate: 180 }}
                transition={reducedTransition(spring.moderate, ctx.reduce)}
                className="text-muted-foreground"
              >
                <ChevronDown size={tokens.icon} />
              </motion.span>
            </motion.button>

            {/* `layout="position"` keeps the surface's size morph from squashing these. */}
            <motion.div layout="position" className="h-px bg-border" />

            {/* The stagger and morph run on transforms, which ResizeObserver misses: refresh once they land. */}
            <motion.ul
              ref={listRef}
              layout="position"
              initial="hidden"
              animate="show"
              variants={ctx.reduce ? undefined : LIST}
              onAnimationComplete={refresh}
              onLayoutAnimationComplete={refresh}
              {...hover.handlers}
              // Only a visible focus moves the highlight; a click's focus is already lit by the pointer.
              onFocus={(event) => {
                if (event.target.matches(":focus-visible")) setActiveIndex(indexOf(event.target));
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setActiveIndex(null);
                }
              }}
              className="relative p-1"
            >
              <FluidHoverHighlight hover={hover} from={from} />
              <SurfaceProvider value={surface.level}>{children}</SurfaceProvider>
            </motion.ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export interface MorphingSelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function MorphingSelectItem({
  value,
  disabled = false,
  className,
  children,
}: MorphingSelectItemProps) {
  const ctx = useMorphContext("MorphingSelectItem");
  const tokens = useSize(ctx.size);
  const selected = ctx.value === value;
  const label = typeof children === "string" ? children : value;

  const { register, unregister } = ctx;
  useLayoutEffect(() => {
    register(value, label);
    return () => unregister(value);
  }, [register, unregister, value, label]);

  return (
    <motion.li variants={ctx.reduce ? undefined : ITEM} className="relative">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
        onClick={() => ctx.select(value)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg text-left transition-colors duration-(--duration-fast) outline-none",
          tokens.row,
          tokens.text,
          tokens.gap,
          selected
            ? "bg-selected text-foreground"
            : "text-muted-foreground data-fluid-hover-active:text-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        {children}
        {selected ? <Check aria-hidden size={tokens.icon} className="shrink-0" /> : null}
      </button>
    </motion.li>
  );
}
