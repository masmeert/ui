import { IconSearch, IconSelector } from "@tabler/icons-react";
import type {
  InputHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from "react";
import { type Size, useSize } from "@/lib/size";
import { cn } from "cn";
import { mergeRefs, useComboboxContext } from "./context";

// Matches `Input`'s radius per step.
const FIELD_RADIUS: Record<Size, string> = {
  compact: "rounded-lg",
  default: "rounded-lg",
  large: "rounded-xl",
};

export interface ComboboxTriggerProps {
  children: ReactNode;
  className?: string;
}

export function ComboboxTrigger({ children, className }: ComboboxTriggerProps) {
  const context = useComboboxContext("ComboboxTrigger");
  const tokens = useSize(context.size);

  return (
    <div
      ref={context.triggerRef}
      id={context.triggerId}
      data-state={context.open ? "open" : "closed"}
      onPointerDown={(event) => {
        if (context.disabled || event.target === context.inputRef.current) return;
        event.preventDefault();
        context.inputRef.current?.focus({ preventScroll: true });
        context.setOpen(true);
      }}
      className={cn(
        "relative z-20 flex w-full min-w-52 cursor-text items-center justify-between border border-border bg-transparent text-foreground transition-[border-color] duration-(--duration-fast) hover:border-border-strong",
        tokens.control,
        tokens.controlPx,
        tokens.text,
        tokens.gap,
        FIELD_RADIUS[tokens.size],
        "focus-within:border-brand/40",
        context.disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <span aria-hidden className="shrink-0 text-muted-foreground">
        <IconSelector size={tokens.icon} />
      </span>
    </div>
  );
}

export interface ComboboxValueProps {
  placeholder?: ReactNode;
  children?: ReactNode | ((value: string | undefined, label: string | undefined) => ReactNode);
  className?: string;
}

export function ComboboxValue({
  placeholder = "Select an option",
  children,
  className,
}: ComboboxValueProps) {
  const context = useComboboxContext("ComboboxValue");
  const label = context.labelFor(context.value);
  const content =
    typeof children === "function"
      ? children(context.value, label)
      : (children ?? label ?? placeholder);

  return (
    <span
      className={cn(
        "block truncate",
        context.value === undefined ? "text-muted-foreground" : "text-foreground",
        className,
      )}
    >
      {content}
    </span>
  );
}

export interface ComboboxInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "value"
> {
  ref?: Ref<HTMLInputElement>;
  wrapperClassName?: string;
}

export function ComboboxInput({
  ref,
  className,
  wrapperClassName,
  "aria-label": ariaLabel = "Search options",
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  onPointerDown,
  placeholder = "Search…",
  ...props
}: ComboboxInputProps) {
  const context = useComboboxContext("ComboboxInput");
  const tokens = useSize(context.size);
  const selectedLabel = context.labelFor(context.value);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      // Only open: while closed the list still filters by the last session's query,
      // so a step here would target rows the next render replaces.
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
      if (context.open) context.selectActive();
      else context.setOpen(true);
    } else if (event.key === "Escape" && context.open) {
      event.preventDefault();
      context.setOpen(false, true);
    }
  };

  return (
    <div className={cn("flex min-w-0 flex-1 items-center", tokens.gap, wrapperClassName)}>
      <IconSearch aria-hidden size={tokens.icon} className="shrink-0 text-muted-foreground" />
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
        value={context.open ? context.query : (selectedLabel ?? "")}
        placeholder={placeholder}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || context.open) return;
          event.preventDefault();
          context.inputRef.current?.focus({ preventScroll: true });
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
          "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          tokens.control,
          tokens.field,
          className,
        )}
      />
    </div>
  );
}
