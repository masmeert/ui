import { motion, useReducedMotion, type Transition } from "motion/react";
import { IconChevronDown } from "@tabler/icons-react";
import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { useFluidHoverDomItems } from "@/hooks/use-fluid-hover-dom-items";
import { FOLD } from "@/lib/ease";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { typeClass } from "@/lib/type-scale";
import { cn } from "cn";

export type AccordionItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type AccordionClassNames = {
  root?: string;
  item?: string;
  trigger?: string;
  icon?: string;
  title?: string;
  chevron?: string;
  content?: string;
  description?: string;
};

export interface AccordionProps {
  items: AccordionItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  collapsible?: boolean;
  className?: string;
  classNames?: AccordionClassNames;
}

// Must not overshoot: a y overshoot briefly overlaps the next item.
const ROW_TRANSITION: Transition = spring.moderate;

// Folds to `"auto"`, not a measured height, so a nested collapsible doesn't animate twice.
const CONTENT_TRANSITION: Transition = FOLD;

const DESCRIPTION_OPEN_TRANSITION: Transition = spring.moderate;
const DESCRIPTION_CLOSE_TRANSITION: Transition = springExit.fast;

const CHEVRON_TRANSITION: Transition = spring.moderate;

const GROUP_RADIUS = 28;
const HIGHLIGHT_INSET = 6;

function useControllableAccordionValue({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null);
  const isControlled = value !== undefined;
  const currentValue = value ?? internalValue;

  const setValue = useCallback(
    (next: string | null) => {
      if (!isControlled) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue] as const;
}

function AccordionRow({
  item,
  open,
  startsGroup,
  endsGroup,
  separatedFromPrevious,
  contentId,
  triggerId,
  prefersReducedMotion,
  classNames,
  onToggle,
  onLayoutSettled,
}: {
  item: AccordionItem;
  open: boolean;
  startsGroup: boolean;
  endsGroup: boolean;
  separatedFromPrevious: boolean;
  contentId: string;
  triggerId: string;
  prefersReducedMotion: boolean | null;
  classNames?: AccordionClassNames;
  onToggle: () => void;
  onLayoutSettled: () => void;
}) {
  const [everOpened, setEverOpened] = useState(open);
  if (open && !everOpened) setEverOpened(true);

  return (
    <motion.div
      layout="position"
      initial={false}
      style={{ marginTop: separatedFromPrevious ? 12 : 0 }}
      transition={reducedTransition(ROW_TRANSITION, prefersReducedMotion)}
      onLayoutAnimationComplete={onLayoutSettled}
    >
      <motion.div
        data-state={open ? "open" : "closed"}
        initial={false}
        animate={{
          borderTopLeftRadius: startsGroup ? GROUP_RADIUS : 0,
          borderTopRightRadius: startsGroup ? GROUP_RADIUS : 0,
          borderBottomLeftRadius: endsGroup ? GROUP_RADIUS : 0,
          borderBottomRightRadius: endsGroup ? GROUP_RADIUS : 0,
        }}
        transition={reducedTransition(ROW_TRANSITION, prefersReducedMotion)}
        className={cn(
          "overflow-hidden bg-card text-card-foreground",
          item.disabled && "opacity-50",
          classNames?.item,
        )}
      >
        <button
          id={triggerId}
          type="button"
          disabled={item.disabled}
          aria-expanded={open}
          aria-controls={contentId}
          data-slot="accordion-trigger"
          onClick={onToggle}
          className={cn(
            "flex min-h-13.5 w-full items-center gap-4 px-5 text-left transition-colors duration-(--duration-fast) outline-none",
            "focus-visible:bg-hover",
            "disabled:pointer-events-none",
            classNames?.trigger,
          )}
        >
          {item.icon ? (
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center text-muted-foreground",
                classNames?.icon,
              )}
            >
              {item.icon}
            </span>
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate font-medium text-foreground",
              typeClass("subtitle"),
              classNames?.title,
            )}
          >
            {item.title}
          </span>
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={reducedTransition(CHEVRON_TRANSITION, prefersReducedMotion)}
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center text-muted-foreground",
              classNames?.chevron,
            )}
          >
            <IconChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <motion.div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          aria-hidden={!open}
          inert={!open}
          initial={false}
          animate={{ height: open && item.description ? "auto" : 0 }}
          transition={reducedTransition(CONTENT_TRANSITION, prefersReducedMotion)}
          className={cn("overflow-hidden", classNames?.content)}
        >
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
            }}
            transition={open ? DESCRIPTION_OPEN_TRANSITION : DESCRIPTION_CLOSE_TRANSITION}
            className="px-5 pb-5"
          >
            <div
              className={cn("text-muted-foreground", typeClass("body"), classNames?.description)}
            >
              {everOpened ? item.description : null}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function Accordion({
  items,
  value,
  defaultValue = null,
  onValueChange,
  collapsible = true,
  className,
  classNames,
}: AccordionProps) {
  const prefersReducedMotion = useReducedMotion();
  const baseId = useId();
  const [activeValue, setActiveValue] = useControllableAccordionValue({
    value,
    defaultValue,
    onValueChange,
  });
  const activeIndex = items.findIndex((item) => item.id === activeValue);
  const rootRef = useRef<HTMLDivElement>(null);
  // Rows slide on layout transforms ResizeObserver can't see, so they call refresh once settled.
  const hover = useFluidHover(rootRef);
  const hoverItems = useFluidHoverDomItems(
    hover,
    rootRef,
    '[data-slot="accordion-trigger"]',
    '[aria-expanded="true"]',
  );
  const inset = (rect: (typeof hover.itemRects)[number]) =>
    rect && {
      top: rect.top + HIGHLIGHT_INSET,
      left: rect.left + HIGHLIGHT_INSET,
      width: Math.max(0, rect.width - HIGHLIGHT_INSET * 2),
      height: Math.max(0, rect.height - HIGHLIGHT_INSET * 2),
    };
  const insetHover = { ...hover, itemRects: hover.itemRects.map(inset) };
  const from = insetHover.itemRects[hoverItems.fromIndex] ?? null;

  const toggleItem = useCallback(
    (id: string) => {
      if (activeValue === id) {
        if (collapsible) {
          setActiveValue(null);
        }
        return;
      }

      setActiveValue(id);
    },
    [activeValue, collapsible, setActiveValue],
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", className, classNames?.root)}
      {...hover.handlers}
    >
      {/* Above the cards, which paint their own fill. */}
      <FluidHoverHighlight
        hover={insetHover}
        from={from}
        // nestedRadius(GROUP_RADIUS, HIGHLIGHT_INSET) = 22: concentric with the cards.
        className="z-10 rounded-[22px]"
      />
      {items.map((item, index) => {
        const open = activeValue === item.id;
        const previousIsOpen = activeIndex === index - 1;
        const nextIsOpen = activeIndex === index + 1;
        const startsGroup = open || index === 0 || previousIsOpen;
        const endsGroup = open || index === items.length - 1 || nextIsOpen;
        const separatedFromPrevious = index > 0 && (open || previousIsOpen);
        const contentId = `${baseId}-${item.id}-content`;
        const triggerId = `${baseId}-${item.id}-trigger`;

        return (
          <AccordionRow
            key={item.id}
            item={item}
            open={open}
            startsGroup={startsGroup}
            endsGroup={endsGroup}
            separatedFromPrevious={separatedFromPrevious}
            contentId={contentId}
            triggerId={triggerId}
            prefersReducedMotion={prefersReducedMotion}
            classNames={classNames}
            onToggle={() => toggleItem(item.id)}
            onLayoutSettled={hoverItems.refresh}
          />
        );
      })}
    </div>
  );
}
