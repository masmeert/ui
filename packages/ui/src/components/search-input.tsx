import { Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ButtonHTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { Kbd } from "@/components/kbd";
import { Input, type InputProps } from "@/components/input";

export interface SearchInputProps extends Omit<InputProps, "leftIcon" | "rightIcon" | "type"> {
  /** A single key that focuses the field from anywhere on the page, e.g. "/". Shown as a hint while empty. */
  shortcut?: string;
  clearLabel?: string;
}

const SWAP_TRANSITION = { duration: 0.14, ease: [0.33, 1, 0.68, 1] } as const;

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
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
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

  return (
    <Input
      ref={(node) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type="search"
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
        // One fixed cell for both, so the clear button and the shortcut hint cross-fade on the same centre.
        <span className="grid size-11 place-items-center">
          <AnimatePresence initial={false}>
            {value ? (
              <motion.button
                key="clear"
                type="button"
                aria-label={clearLabel}
                initial={hidden}
                animate={shown}
                exit={hidden}
                transition={SWAP_TRANSITION}
                onClick={() => {
                  update("");
                  inputRef.current?.focus();
                }}
                className="col-start-1 row-start-1 transition-colors hover:text-foreground"
              >
                <X />
              </motion.button>
            ) : shortcut ? (
              <motion.span
                key="shortcut"
                initial={hidden}
                animate={shown}
                exit={hidden}
                transition={SWAP_TRANSITION}
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

export interface SearchTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string;
  /** Hint for the shortcut that opens the search surface, e.g. "⌘K". */
  shortcut?: string;
}

/** A button dressed as the search field, for search that opens elsewhere (a command palette, a dialog). */
export const SearchTrigger = forwardRef<HTMLButtonElement, SearchTriggerProps>(
  function SearchTrigger({ placeholder = "Search", shortcut, className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        className={cn(
          "relative flex h-11 w-full items-center gap-3 rounded-xl border border-border px-3 text-left text-base text-muted-foreground/60 transition-colors outline-none hover:border-border-strong focus-visible:border-brand/40",
          className,
        )}
        {...rest}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">{placeholder}</span>
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </button>
    );
  },
);
