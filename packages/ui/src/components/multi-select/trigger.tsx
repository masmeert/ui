import { ChevronsUpDown, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type {
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from "react";
import { type Size, useSize } from "@/lib/size";
import { INSTANT, spring, springExit } from "@/lib/springs";
import { cn } from "cn";
import { mergeRefs, useMultiSelectContext } from "./context";

// Chips wrap, so the field has a min height: one chip row + padding + border = control height.
const FIELD: Record<Size, { box: string; chip: string; radius: string }> = {
  compact: { box: "min-h-8 px-1.5 py-0.5", chip: "h-6", radius: "rounded-lg" },
  default: { box: "min-h-9 px-2 py-0.5", chip: "h-7", radius: "rounded-lg" },
  large: { box: "min-h-11 px-2.5 py-1", chip: "h-8", radius: "rounded-xl" },
};

export interface MultiSelectTriggerProps {
  children: ReactNode;
  className?: string;
}

export function MultiSelectTrigger({ children, className }: MultiSelectTriggerProps) {
  const context = useMultiSelectContext("MultiSelectTrigger");
  const tokens = useSize(context.size);

  return (
    <div
      ref={context.triggerRef}
      id={context.triggerId}
      data-state={context.open ? "open" : "closed"}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (
          context.disabled ||
          target === context.inputRef.current ||
          target.closest("[data-multi-select-remove]")
        ) {
          return;
        }
        event.preventDefault();
        context.inputRef.current?.focus({ preventScroll: true });
        context.setOpen(true);
      }}
      className={cn(
        "relative z-20 flex w-full min-w-52 cursor-text items-center border border-border bg-transparent text-foreground transition-[border-color] duration-(--duration-fast) hover:border-border-strong",
        FIELD[tokens.size].box,
        FIELD[tokens.size].radius,
        tokens.text,
        tokens.gap,
        "focus-within:border-brand/40",
        context.disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">{children}</div>
      <ChevronsUpDown
        aria-hidden="true"
        size={tokens.icon}
        className="mr-1 shrink-0 text-muted-foreground"
      />
    </div>
  );
}

export interface MultiSelectValueProps {
  placeholder?: ReactNode;
  children?: (value: string, label: string) => ReactNode;
  className?: string;
  chipClassName?: string;
}

export function MultiSelectValue({
  placeholder = "Select options",
  children,
  className,
  chipClassName,
}: MultiSelectValueProps) {
  const context = useMultiSelectContext("MultiSelectValue");
  const tokens = useSize(context.size);
  const showPlaceholder = context.values.length === 0 && !context.open;

  return (
    <div className={cn("contents", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {showPlaceholder ? (
          <span key="multi-select-placeholder" className="text-muted-foreground">
            {placeholder}
          </span>
        ) : null}
        {context.values.map((value) => {
          const label = context.labelFor(value);
          return (
            <motion.span
              layout={context.reduce ? false : "position"}
              key={`multi-select-value-${value}`}
              // y/scale, not a `transform` string: layout projection owns `transform`.
              initial={{
                opacity: 0,
                clipPath: "inset(0 0 0 0% round 0.375rem)",
                y: context.reduce ? 0 : 6,
                scale: context.reduce ? 1 : 0.92,
              }}
              animate={{
                opacity: 1,
                clipPath: "inset(0 0 0 0% round 0.375rem)",
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 1,
                clipPath: context.reduce
                  ? "inset(0 0 0 0% round 0.375rem)"
                  : "inset(0 0 0 100% round 0.375rem)",
                y: 0,
                scale: 1,
                transition: {
                  clipPath: context.reduce ? INSTANT : springExit.moderate,
                  y: INSTANT,
                  scale: INSTANT,
                },
              }}
              transition={
                context.reduce
                  ? { layout: INSTANT, opacity: spring.fast, y: INSTANT, scale: INSTANT }
                  : {
                      layout: spring.moderate,
                      opacity: spring.fast,
                      y: spring.fast,
                      scale: spring.fast,
                    }
              }
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-md bg-muted px-2 text-foreground",
                FIELD[tokens.size].chip,
                tokens.type.caption,
                chipClassName,
              )}
            >
              <span className="truncate">{children ? children(value, label) : label}</span>
              <button
                type="button"
                data-multi-select-remove=""
                aria-label={`Remove ${label}`}
                disabled={context.disabled}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  context.remove(value);
                  context.inputRef.current?.focus({ preventScroll: true });
                }}
                className="-mr-1 grid size-5 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-hover hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export interface MultiSelectInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "value"
> {
  ref?: Ref<HTMLInputElement>;
  showIcon?: boolean;
}

export function MultiSelectInput({
  ref,
  className,
  "aria-label": ariaLabel = "Search options",
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  onPointerDown,
  placeholder = "Search…",
  showIcon = false,
  ...props
}: MultiSelectInputProps) {
  const context = useMultiSelectContext("MultiSelectInput");
  const tokens = useSize(context.size);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "Backspace" && !context.query && context.values.length) {
      event.preventDefault();
      context.remove(context.values.at(-1) ?? "");
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!context.open) {
        context.setOpen(true);
        return;
      }
      context.moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Home" && context.open) {
      event.preventDefault();
      context.moveActive("first");
    } else if (event.key === "End" && context.open) {
      event.preventDefault();
      context.moveActive("last");
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (context.open) context.toggleActive();
      else context.setOpen(true);
    } else if (event.key === "Escape" && context.open) {
      event.preventDefault();
      context.setOpen(false, true);
    }
  };

  return (
    <div className={cn("flex min-w-20 flex-1 items-center pl-1", tokens.gap)}>
      {showIcon ? (
        <Search aria-hidden="true" size={tokens.icon} className="shrink-0 text-muted-foreground" />
      ) : null}
      <input
        {...props}
        ref={mergeRefs(ref, context.inputRef)}
        id={context.inputId}
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={context.open}
        aria-controls={context.listId}
        aria-activedescendant={context.open ? context.activeItemId : undefined}
        autoComplete="off"
        disabled={context.disabled}
        value={context.query}
        placeholder={context.values.length ? "" : placeholder}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || context.open) return;
          context.setOpen(true);
        }}
        onFocus={(event) => {
          context.setOpen(true);
          onFocus?.(event);
        }}
        onClick={(event) => {
          context.setOpen(true);
          onClick?.(event);
        }}
        onChange={(event) => {
          context.setOpen(true);
          context.setQuery(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-w-12 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          FIELD[tokens.size].chip,
          tokens.field,
          className,
        )}
      />
    </div>
  );
}
