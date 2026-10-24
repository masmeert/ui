import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
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

type Placement = "bottom" | "top";

interface SelectContextValue {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  select: (value: string) => void;
  register: (value: string, label: string) => void;
  unregister: (value: string) => void;
  labelFor: (value: string | undefined) => string | undefined;
  reduce: boolean;
  triggerId: string;
  listId: string;
  disabled: boolean;
  placement: Placement;
  setPlacement: (p: Placement) => void;
  size: Size | undefined;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error(`${component} must be used within <Select>`);
  return ctx;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The panel is positioned inside the field, so stacked selects should keep only one open. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  size,
  className,
  children,
}: SelectProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internal, setInternal] = useState(defaultValue);
  const [labels, setLabels] = useState<Map<string, string>>(new Map());
  const [placement, setPlacement] = useState<Placement>("bottom");

  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const openControlled = openProp !== undefined;
  const open = openControlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!openControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, openControlled],
  );

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    },
    [controlled, onValueChange, setOpen],
  );

  const register = useCallback((v: string, label: string) => {
    setLabels((m) => (m.get(v) === label ? m : new Map(m).set(v, label)));
  }, []);
  const unregister = useCallback((v: string) => {
    setLabels((m) => {
      if (!m.has(v)) return m;
      const next = new Map(m);
      next.delete(v);
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
  }, [open, setOpen]);

  const ctx = useMemo<SelectContextValue>(
    () => ({
      value: current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labelFor: (v) => (v === undefined ? undefined : labels.get(v)),
      reduce,
      triggerId: `${baseId}-trigger`,
      listId: `${baseId}-list`,
      disabled,
      placement,
      setPlacement,
      size,
    }),
    [
      current,
      open,
      setOpen,
      select,
      register,
      unregister,
      labels,
      reduce,
      baseId,
      disabled,
      placement,
      size,
    ],
  );

  return (
    <SelectContext.Provider value={ctx}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// Matches `Input`'s radius per step.
const FIELD_RADIUS: Record<Size, string> = {
  compact: "rounded-lg",
  default: "rounded-lg",
  large: "rounded-xl",
};

export interface SelectTriggerProps {
  className?: string;
  children: ReactNode;
}

export function SelectTrigger({ className, children }: SelectTriggerProps) {
  const ctx = useSelectContext("SelectTrigger");
  const tokens = useSize(ctx.size);
  return (
    <button
      type="button"
      id={ctx.triggerId}
      disabled={ctx.disabled}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      aria-controls={ctx.listId}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "relative z-10 flex w-full items-center justify-between border border-border bg-background text-foreground transition-colors duration-(--duration-fast) outline-none",
        tokens.control,
        tokens.controlPx,
        tokens.text,
        tokens.gap,
        FIELD_RADIUS[tokens.size],
        "hover:border-border-strong focus-visible:ring-4 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
      <IconChevronDown
        aria-hidden
        size={tokens.icon}
        className={cn(
          "shrink-0 text-muted-foreground transition-transform duration-(--duration-moderate) ease-out",
          ctx.open && "rotate-180",
        )}
      />
    </button>
  );
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const ctx = useSelectContext("SelectValue");
  const label = ctx.labelFor(ctx.value);
  return (
    <span className={cn(label ? "text-foreground" : "text-muted-foreground", className)}>
      {label ?? placeholder ?? "Select"}
    </span>
  );
}

export interface SelectContentProps {
  className?: string;
  children: ReactNode;
}

export function SelectContent({ className, children }: SelectContentProps) {
  const ctx = useSelectContext("SelectContent");
  const surface = useElevation(SURFACE_OFFSET.popover, { shadowLevel: 3 });
  const innerRef = useRef<HTMLDivElement>(null);
  const open = ctx.open;
  const { setPlacement } = ctx;
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  const hover = useFluidHover(innerRef);
  const { from, indexOf } = useFluidHoverDomItems(
    hover,
    innerRef,
    '[role="option"]',
    '[aria-selected="true"]',
  );
  const { remeasure, setActiveIndex } = hover;
  useEffect(() => {
    // The panel scales in from 0.97, so rows measured while closed sit a hair off.
    if (open) remeasure();
    else setActiveIndex(null);
  }, [open, remeasure, setActiveIndex]);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = document.getElementById(ctx.triggerId);
    const node = innerRef.current;
    if (!trigger || !node) return;
    const rect = trigger.getBoundingClientRect();
    const h = node.offsetHeight;
    // Measure against the nearest clipping ancestor (e.g. a modal), not just the window.
    let top = 0;
    let bottom = window.innerHeight;
    for (let el = trigger.parentElement; el; el = el.parentElement) {
      if (getComputedStyle(el).overflowY === "visible") continue;
      const clip = el.getBoundingClientRect();
      top = Math.max(top, clip.top);
      bottom = Math.min(bottom, clip.bottom);
      break;
    }
    const below = bottom - rect.bottom;
    const above = rect.top - top;
    setPlacement(below < h + 16 && above > below ? "top" : "bottom");
  }, [open, ctx.triggerId, setPlacement]);

  const isTop = ctx.placement === "top";

  // Items stay mounted so their label registrations persist; otherwise the trigger
  // would show the placeholder once the panel closes.
  return (
    <motion.div
      id={ctx.listId}
      role="listbox"
      aria-labelledby={ctx.triggerId}
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={
        ctx.reduce
          ? { opacity: open ? 1 : 0 }
          : {
              opacity: open ? 1 : 0,
              transform: open ? "scale(1)" : "scale(0.97)",
            }
      }
      transition={open ? reducedTransition(spring.moderate, ctx.reduce) : springExit.moderate}
      onAnimationComplete={() => {
        if (!open) setShown(false);
      }}
      className={cn(
        "absolute right-0 left-0 z-(--z-popup) overflow-hidden rounded-[12px] border border-border",
        surface.className,
        isTop ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top",
        open ? "pointer-events-auto" : "pointer-events-none",
        !shown && "h-0",
        className,
      )}
    >
      <div
        ref={innerRef}
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
        className="relative flex flex-col gap-0.5 p-1"
      >
        <FluidHoverHighlight hover={hover} hidden={!open} from={from} />
        <SurfaceProvider value={surface.level}>{children}</SurfaceProvider>
      </div>
    </motion.div>
  );
}

export interface SelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  /** Text the trigger shows when this item is picked; needed when `children` isn't a plain string. */
  label?: string;
  children: ReactNode;
}

export function SelectItem({
  value,
  disabled = false,
  className,
  label: labelProp,
  children,
}: SelectItemProps) {
  const ctx = useSelectContext("SelectItem");
  const tokens = useSize(ctx.size);
  const selected = ctx.value === value;
  const label = labelProp ?? (typeof children === "string" ? children : value);

  const { register, unregister } = ctx;
  useLayoutEffect(() => {
    register(value, label);
    return () => unregister(value);
  }, [register, unregister, value, label]);

  return (
    <li className="relative">
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
        {selected ? <IconCheck aria-hidden size={tokens.icon} className="shrink-0" /> : null}
      </button>
    </li>
  );
}
