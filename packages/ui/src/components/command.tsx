import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconSearch, type Icon as TablerIcon } from "@tabler/icons-react";
import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type FluidHover, useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover";
import { useOnOpen } from "@/hooks/use-on-open";
import { useRowCursor } from "@/hooks/use-row-cursor";
import { PresenceGate } from "@/components/presence-gate";
import { cn } from "cn";
import { searchCommands } from "@/lib/command-search";
import { type Size, type SizeTokens, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { typeClass } from "@/lib/type-scale";

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  hint?: string;
  keywords?: string[];
  icon?: TablerIcon;
  badge?: ReactNode;
  onSelect: () => void;
};

export interface CommandDialogProps {
  items: CommandItem[];
  /** Opens with Cmd/Ctrl + this key. Default "k". */
  shortcut?: string;
  placeholder?: string;
  emptyMessage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: Size;
}

// Deliberately faster than the dialog tier: summoned by shortcut many times a day.
const PANEL_ENTER = spring.moderate;
const PANEL_EXIT = springExit.moderate;

export function CommandDialog({
  items,
  shortcut = "k",
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  open: controlledOpen,
  onOpenChange,
  size: sizeProp,
}: CommandDialogProps) {
  const size = useSize(sizeProp);
  const surface = useElevation(SURFACE_OFFSET.dialog);
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (!controlled) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange],
  );

  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const uid = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        setOpen(!open);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shortcut, setOpen]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  const filtered = useMemo(() => searchCommands(items, query), [items, query]);

  const hasIcons = useMemo(() => items.some((it) => it.icon), [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((it) => {
      const g = it.group ?? "Results";
      const groupItems = map.get(g) ?? [];
      groupItems.push(it);
      map.set(g, groupItems);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Grouping reorders rows; the highlight, ids, Enter and scroll must all read this render order.
  const rows = useMemo(() => grouped.flatMap(([, list]) => list), [grouped]);

  const { activeIndex: active, moveTo, moveActive } = useRowCursor(rows, query);

  // The highlight is the cursor: pointer-lit becomes active, and on leave it returns to the active row.
  const hover = useFluidHover(listRef);
  const { activeIndex: lit, setActiveIndex, remeasure } = hover;
  const activeRow = rows.length > 0 ? active : null;
  // Only react to pointer moves of `lit`: after a key step it still names the old row.
  const litSeen = useRef<number | null>(null);
  useEffect(() => {
    if (lit === litSeen.current) return;
    litSeen.current = lit;
    if (lit === null) {
      if (activeRow !== null) setActiveIndex(activeRow);
      return;
    }
    const row = rows[lit];
    if (lit !== activeRow && row) moveTo(row.id);
  }, [lit, activeRow, rows, moveTo, setActiveIndex]);
  useEffect(() => {
    setActiveIndex(activeRow);
  }, [activeRow, setActiveIndex]);

  // `moveTo(null)` covers reopening on an already-empty query.
  useOnOpen(open, () => {
    setQuery("");
    moveTo(null);
    remeasure();
  });

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = rows[active];
      if (it) {
        it.onSelect();
        setOpen(false);
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!mounted) return null;

  // Backdrop and inset panel layer are separate fixed siblings (see
  // tests/fixed-overlay-edge-sampling.test.tsx). PresenceGate releases interaction as the exit starts.
  return createPortal(
    <AnimatePresence initial={false}>
      {open ? (
        <PresenceGate key="backdrop">
          {({ gate }) => (
            <motion.button
              type="button"
              aria-label="Close command palette"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: PANEL_EXIT }}
              transition={PANEL_ENTER}
              {...gate}
              onClick={() => setOpen(false)}
              className="pointer-events-auto fixed inset-0 z-(--z-overlay) bg-background/5 [backdrop-filter:blur(12px)_saturate(140%)] [-webkit-backdrop-filter:blur(12px)_saturate(140%)]"
            />
          )}
        </PresenceGate>
      ) : null}

      {open ? (
        <PresenceGate key="panel-layer">
          {({ isPresent, gate }) => (
            // Never takes pointer events, so only `inert` from the gate.
            <div
              inert={!isPresent}
              className="pointer-events-none fixed inset-x-4 top-[18vh] bottom-4 z-(--z-overlay) flex items-start justify-center"
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                initial={{
                  opacity: 0,
                  y: reduce ? 0 : -8,
                  scale: reduce ? 1 : 0.97,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: reduce ? 0 : -8,
                  scale: reduce ? 1 : 0.97,
                  transition: PANEL_EXIT,
                }}
                transition={reducedTransition(PANEL_ENTER, reduce)}
                {...gate}
                onKeyDown={onKeyDown}
                className={cn(
                  "pointer-events-auto w-full max-w-xl overflow-hidden rounded-2xl",
                  surface.className,
                )}
              >
                <SurfaceProvider value={surface.level}>
                  <div className="flex items-center gap-3 border-b border-border px-4">
                    <IconSearch size={size.icon} className="text-muted-foreground" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={placeholder}
                      role="combobox"
                      // The field only exists while the palette is open.
                      aria-expanded="true"
                      aria-controls={`${uid}-list`}
                      aria-activedescendant={rows.length > 0 ? `${uid}-opt-${active}` : undefined}
                      aria-autocomplete="list"
                      className={cn(
                        "h-12 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
                        // Auto-focused on open: `field` prevents iOS zoom on the fixed overlay.
                        size.field,
                      )}
                    />
                    <kbd
                      className={cn(
                        "hidden rounded border border-border bg-background px-1.5 py-0.5 text-muted-foreground sm:inline-block",
                        typeClass("micro"),
                      )}
                    >
                      ESC
                    </kbd>
                  </div>
                  <motion.div
                    layoutScroll
                    ref={listRef}
                    id={`${uid}-list`}
                    role="listbox"
                    aria-label="Commands"
                    {...hover.handlers}
                    className="relative max-h-[60vh] [scrollbar-width:none] overflow-y-auto overscroll-contain p-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    <FluidHoverHighlight hover={hover} className="rounded-md" />
                    {rows.length === 0 ? (
                      <div className={cn("p-8 text-center text-muted-foreground", size.type.body)}>
                        {emptyMessage}
                      </div>
                    ) : (
                      grouped.map(([group, list]) => (
                        <div key={group} className="mb-1 last:mb-0">
                          <div
                            aria-hidden
                            className={cn(
                              "px-2 py-1.5 font-medium text-muted-foreground",
                              size.type.caption,
                            )}
                          >
                            {group}
                          </div>
                          {list.map((it) => {
                            // `rows` holds these very objects, in render order.
                            const idx = rows.indexOf(it);
                            return (
                              <CommandRow
                                key={it.id}
                                item={it}
                                index={idx}
                                id={`${uid}-opt-${idx}`}
                                active={idx === active}
                                hasIcons={hasIcons}
                                size={size}
                                registerItem={hover.registerItem}
                                onSelect={() => {
                                  it.onSelect();
                                  setOpen(false);
                                }}
                              />
                            );
                          })}
                        </div>
                      ))
                    )}
                  </motion.div>
                </SurfaceProvider>
              </motion.div>
            </div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function CommandRow({
  item,
  index,
  id,
  active,
  hasIcons,
  size,
  registerItem,
  onSelect,
}: {
  item: CommandItem;
  index: number;
  id: string;
  active: boolean;
  hasIcons: boolean;
  size: SizeTokens;
  registerItem: FluidHover["registerItem"];
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useRegisterFluidHoverItem(registerItem, index, ref);
  const Icon = item.icon;
  return (
    <button
      ref={ref}
      type="button"
      id={id}
      role="option"
      aria-selected={active}
      data-index={index}
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-center rounded-md text-left transition-colors duration-(--duration-fast)",
        size.row,
        size.gap,
        size.text,
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {Icon ? (
        <Icon size={size.icon} className="shrink-0" />
      ) : hasIcons ? (
        <span className="shrink-0" style={{ width: size.icon, height: size.icon }} />
      ) : null}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
      {item.hint ? (
        <kbd
          className={cn(
            "rounded border border-border bg-background px-1.5 py-0.5 text-muted-foreground",
            typeClass("micro"),
          )}
        >
          {item.hint}
        </kbd>
      ) : null}
    </button>
  );
}
