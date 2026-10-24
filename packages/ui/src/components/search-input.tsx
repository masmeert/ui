import { Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ButtonHTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Kbd } from "@/components/kbd";
import { Input, type InputProps } from "@/components/input";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";

export interface SearchInputProps extends Omit<InputProps, "leftIcon" | "rightIcon" | "type"> {
  /** A single key that focuses the field from anywhere, e.g. "/". Shown as a hint while empty. */
  shortcut?: string;
  clearLabel?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value: valueProp,
    defaultValue,
    onChange,
    onKeyDown,
    shortcut,
    clearLabel = "Clear search",
    placeholder = "Search",
    classNames,
    size,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
  const tokens = useSize(size);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = valueProp ?? internal;

  function update(next: string) {
    if (valueProp === undefined) setInternal(next);
    onChange?.(next);
  }

  useEffect(() => {
    if (!shortcut) return;
    function focusOnShortcut(event: KeyboardEvent) {
      if (event.key !== shortcut || event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, select, [contenteditable]")
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", focusOnShortcut);
    return () => window.removeEventListener("keydown", focusOnShortcut);
  }, [shortcut]);

  const hidden = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const exit = { ...hidden, transition: springExit.fast };
  const swap = reducedTransition(spring.fast, reduce);

  return (
    <Input
      ref={(node) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type="search"
      size={size}
      enterKeyHint="search"
      placeholder={placeholder}
      value={value}
      onChange={update}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          if (value) {
            event.preventDefault();
            update("");
          } else {
            event.currentTarget.blur();
          }
        }
        onKeyDown?.(event);
      }}
      leftIcon={<Search />}
      rightIcon={
        // One fixed cell so the clear button and shortcut hint cross-fade on the same centre.
        <span className={cn("grid place-items-center", tokens.square)}>
          <AnimatePresence initial={false}>
            {value ? (
              <motion.button
                key="clear"
                type="button"
                aria-label={clearLabel}
                initial={hidden}
                animate={shown}
                exit={exit}
                transition={swap}
                onClick={() => {
                  update("");
                  inputRef.current?.focus();
                }}
                className="col-start-1 row-start-1 transition-colors duration-(--duration-fast) hover:text-foreground"
              >
                <X />
              </motion.button>
            ) : shortcut ? (
              <motion.span
                key="shortcut"
                initial={hidden}
                animate={shown}
                exit={exit}
                transition={swap}
                className="col-start-1 row-start-1 flex"
              >
                <Kbd>{shortcut}</Kbd>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      }
      classNames={{
        ...classNames,
        input: cn("[&::-webkit-search-cancel-button]:appearance-none", classNames?.input),
      }}
      {...rest}
    />
  );
});

// Matches `Input`'s radius per step.
const FIELD_RADIUS: Record<Size, string> = {
  compact: "rounded-lg",
  default: "rounded-lg",
  large: "rounded-xl",
};

export interface SearchTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  size?: Size;
  /** Hint for the shortcut that opens the search surface, e.g. "⌘K". */
  shortcut?: string;
}

/** A button dressed as the search field, for search that opens elsewhere (a command palette, a dialog). */
export const SearchTrigger = forwardRef<HTMLButtonElement, SearchTriggerProps>(
  function SearchTrigger({ placeholder = "Search", shortcut, size, className, ...rest }, ref) {
    const tokens = useSize(size);
    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        className={cn(
          "relative flex w-full items-center border border-border text-left text-muted-foreground transition-colors duration-(--duration-fast) outline-none hover:border-border-strong focus-visible:border-brand/40",
          tokens.control,
          tokens.controlPx,
          tokens.text,
          tokens.gap,
          FIELD_RADIUS[tokens.size],
          className,
        )}
        {...rest}
      >
        <Search size={tokens.icon} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">{placeholder}</span>
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </button>
    );
  },
);
