import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefCallback,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useDismiss } from "@/hooks/use-dismiss";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { useHoverGesture } from "@/hooks/use-hover-gesture";
import { useTapGesture } from "@/hooks/use-tap-gesture";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { cn } from "cn";

export type ExpandableActionBarItem = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: ReactNode;
  shortcut?: ReactNode;
};

export type ExpandableActionBarClassNames = {
  root?: string;
  track?: string;
  item?: string;
  activeItem?: string;
  icon?: string;
  label?: string;
  badge?: string;
  shortcut?: string;
};

export interface ExpandableActionBarProps {
  items: ExpandableActionBarItem[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  activeId?: string;
  onAction?: (item: ExpandableActionBarItem) => void;
  size?: Size;
  /**
   * Expand when a hovering pointer rests on the bar. On touch, the first tap
   * expands and the second acts; set false to make every tap act immediately.
   */
  expandOnHover?: boolean;
  expandOnFocus?: boolean;
  collapseDelay?: number;
  className?: string;
  classNames?: ExpandableActionBarClassNames;
  renderItem?: (
    item: ExpandableActionBarItem,
    state: { expanded: boolean; active: boolean },
  ) => ReactNode;
}

// Track padding + item height add up to the step's control height, like a segmented control.
const ITEM_SIZE_CLASS: Record<Size, string> = {
  compact: "h-7 min-w-7 px-1.5",
  default: "h-7 min-w-7 px-1.5",
  large: "h-9 min-w-9 px-2",
};

const ICON_SIZE_CLASS: Record<Size, string> = {
  compact: "size-3.5",
  default: "size-4",
  large: "size-[18px]",
};

function useControllableExpanded({
  expanded,
  defaultExpanded,
  onExpandedChange,
}: {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded ?? false);
  const isControlled = expanded !== undefined;
  const value = expanded ?? internalExpanded;

  const setValue = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  return [value, setValue] as const;
}

export function ExpandableActionBar({
  items,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  activeId,
  onAction,
  size: sizeProp,
  expandOnHover = true,
  expandOnFocus = true,
  collapseDelay = 90,
  className,
  classNames,
  renderItem,
}: ExpandableActionBarProps) {
  const reduce = useReducedMotion();
  const layoutId = useId();
  const t = useSize(sizeProp);
  const surface = useElevation(SURFACE_OFFSET.popover);
  const itemTransition = { ...spring.moderate, scale: spring.fast };
  const labelTransition = reducedTransition(spring.moderate, reduce);
  const [isExpanded, setIsExpanded] = useControllableExpanded({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });
  // Set by the tap that expands the bar; arms the outside-tap dismisser.
  const [tapExpanded, setTapExpanded] = useState(false);
  const collapseTimer = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fluid = useFluidHover(trackRef, { axis: "x" });
  const { registerItem, setActiveIndex } = fluid;
  // Gap clicks go to the lit action for a mouse only: a finger's first tap must expand, not act.
  const lastPointerType = useRef<string | null>(null);
  // Stable ref callback per index, so React doesn't re-run them every render.
  const refCallbacks = useRef(new Map<number, RefCallback<HTMLButtonElement>>());
  const itemRef = useCallback(
    (index: number) => {
      let callback = refCallbacks.current.get(index);
      if (!callback) {
        callback = (element: HTMLButtonElement | null) => registerItem(index, element);
        refCallbacks.current.set(index, callback);
      }
      return callback;
    },
    [registerItem],
  );
  // State: whether the bar was already expanded when the gesture started.
  const tap = useTapGesture<boolean>();
  const hover = useHoverGesture();

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) window.clearTimeout(collapseTimer.current);
    collapseTimer.current = null;
  }, []);

  const open = useCallback(() => {
    clearCollapseTimer();
    setIsExpanded(true);
  }, [clearCollapseTimer, setIsExpanded]);

  const close = useCallback(() => {
    clearCollapseTimer();
    const timer = window.setTimeout(() => {
      setIsExpanded(false);
      setActiveIndex(null);
      setTapExpanded(false);
    }, collapseDelay);
    collapseTimer.current = timer;
  }, [clearCollapseTimer, collapseDelay, setIsExpanded, setActiveIndex]);

  useEffect(() => clearCollapseTimer, [clearCollapseTimer]);

  // A collapse from outside disarms the tap, or the next tap runs an action with no visible label.
  // Only on expanded -> collapsed: a controlled bar that never expanded keeps its arm.
  const wasExpanded = useRef(isExpanded);
  useEffect(() => {
    if (wasExpanded.current && !isExpanded) setTapExpanded(false);
    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  // A finger never hovers and Safari doesn't focus on tap, so an outside tap closes a tap-expanded bar.
  // Consumed: people dismiss it by tapping just past it, over whatever control is there.
  useDismiss(tapExpanded && isExpanded, close, trackRef, {
    behavior: "consume",
  });

  const onRootPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    // Always report the enter, even without `expandOnHover`: the matching leave is read against it.
    if (hover.enter(event) && expandOnHover) open();
  };

  const onRootPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (!hover.leave(event)) return;
    setActiveIndex(null);
    if (expandOnHover) close();
  };

  const onRootFocus = () => {
    if (expandOnFocus) open();
  };

  const onRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node) && expandOnFocus) {
      close();
    }
  };

  const activeItemId = activeId ?? items.find((item) => item.active)?.id;

  return (
    <LayoutGroup id={layoutId}>
      <motion.div
        layout="size"
        // Pointer events, not mouseenter/leave: a tap's compat mouse events carry no pointerType,
        // and the bar growing under the finger fired a leave before the click landed.
        onPointerEnter={onRootPointerEnter}
        onPointerLeave={onRootPointerLeave}
        onFocus={onRootFocus}
        onBlur={onRootBlur}
        transition={itemTransition}
        className={cn("inline-flex max-w-full", classNames?.root, className)}
      >
        <SurfaceProvider value={surface.level}>
          <motion.div
            ref={trackRef}
            layout="size"
            className={cn(
              // Scrolls rather than overflowing, so the last action stays reachable.
              "relative scrollbar-hide inline-flex max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden rounded-full border border-border",
              surface.className,
              t.segmentPad,
              t.text,
              classNames?.track,
            )}
            transition={itemTransition}
            {...fluid.handlers}
            onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
              lastPointerType.current = event.pointerType;
            }}
            onClick={(event: MouseEvent<HTMLDivElement>) => {
              if (lastPointerType.current === "mouse") fluid.handlers.onClick(event);
            }}
          >
            <FluidHoverHighlight hover={fluid} className="z-0 rounded-full" />
            {items.map((item, index) => {
              const isActive = item.active || activeId === item.id;

              return (
                <motion.button
                  key={item.id}
                  layout="position"
                  ref={itemRef(index)}
                  type="button"
                  disabled={item.disabled}
                  title={typeof item.label === "string" ? item.label : undefined}
                  onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
                    if (!hover.enter(event)) return;
                    clearCollapseTimer();
                  }}
                  onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                    tap.start(event, isExpanded);
                  }}
                  onFocus={(event: FocusEvent<HTMLButtonElement>) => {
                    if (event.currentTarget.matches(":focus-visible")) setActiveIndex(index);
                  }}
                  // A cancelled gesture sends no click, and a key press has no pointer: drop the
                  // stale tap so the next click doesn't spend it.
                  onPointerCancel={tap.drop}
                  onKeyDown={tap.drop}
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.currentTarget.blur();
                    const gesture = tap.take();
                    // First touch tap expands, the second acts. Expanded state is read from the
                    // gesture start: focus-on-contact expands mid-tap. `tapExpanded` lets a
                    // controlled bar that declines to expand still act on the second tap.
                    const firstTap =
                      gesture !== null &&
                      gesture.pointerType !== "mouse" &&
                      !gesture.state &&
                      !tapExpanded;
                    if (firstTap && expandOnHover) {
                      setTapExpanded(true);
                      open();
                      setActiveIndex(index);
                      return;
                    }
                    item.onClick?.();
                    onAction?.(item);
                  }}
                  whileTap={reduce || item.disabled ? undefined : { scale: 0.96 }}
                  transition={itemTransition}
                  className={cn(
                    "relative isolate z-10 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium text-muted-foreground transition-colors duration-(--duration-fast) ease-out outline-none",
                    "focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-40",
                    "data-fluid-hover-active:text-foreground",
                    isActive && "text-foreground",
                    ITEM_SIZE_CLASS[t.size],
                    classNames?.item,
                    isActive && classNames?.activeItem,
                  )}
                >
                  {item.id === activeItemId ? (
                    <motion.span
                      layoutId="action-bar-active"
                      className="absolute inset-0 -z-10 rounded-full bg-selected"
                      transition={reducedTransition(spring.moderate, reduce)}
                    />
                  ) : null}

                  {renderItem ? (
                    renderItem(item, { expanded: isExpanded, active: isActive })
                  ) : (
                    <>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-full",
                          ICON_SIZE_CLASS[t.size],
                          classNames?.icon,
                        )}
                      >
                        {item.icon}
                      </span>

                      <motion.span
                        aria-hidden={!isExpanded}
                        animate={
                          reduce
                            ? {
                                width: isExpanded ? "auto" : 0,
                                opacity: isExpanded ? 1 : 0,
                                marginLeft: isExpanded ? 8 : 0,
                                x: 0,
                                filter: "blur(0px)",
                              }
                            : {
                                width: isExpanded ? "auto" : 0,
                                opacity: isExpanded ? 1 : 0,
                                x: isExpanded ? 0 : -4,
                                marginLeft: isExpanded ? 8 : 0,
                                filter: isExpanded ? "blur(0px)" : "blur(3px)",
                              }
                        }
                        transition={labelTransition}
                        className={cn(
                          "inline-block overflow-hidden whitespace-nowrap",
                          classNames?.label,
                        )}
                      >
                        {item.label}
                      </motion.span>

                      {item.shortcut ? (
                        <motion.span
                          aria-hidden={!isExpanded}
                          animate={{
                            width: isExpanded ? "auto" : 0,
                            opacity: isExpanded ? 1 : 0,
                            marginLeft: isExpanded ? 4 : 0,
                          }}
                          transition={labelTransition}
                          className={cn(
                            "hidden overflow-hidden whitespace-nowrap text-muted-foreground sm:inline-block",
                            t.type.micro,
                            classNames?.shortcut,
                          )}
                        >
                          {item.shortcut}
                        </motion.span>
                      ) : null}

                      {item.badge ? (
                        <span
                          className={cn(
                            "ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-primary-foreground",
                            t.type.micro,
                            "leading-none",
                            !isExpanded && "absolute top-0.5 right-0.5",
                            classNames?.badge,
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </SurfaceProvider>
      </motion.div>
    </LayoutGroup>
  );
}

export function useExpandableActionBar(items: ExpandableActionBarItem[]) {
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id);

  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [activeId, items]);

  return useMemo(
    () => ({ expanded, setExpanded, activeId, setActiveId, activeItem }),
    [activeId, activeItem, expanded],
  );
}
