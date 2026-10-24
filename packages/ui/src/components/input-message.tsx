import { IconArrowUp, IconSquare } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "cn";
import { Button } from "@/components/button";
import { Textarea } from "@/components/textarea";
import { type Size, useSize } from "@/lib/size";
import { Elevated } from "@/lib/surface";
import { reducedTransition, spring, springExit } from "@/lib/springs";

export interface InputMessageProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onSubmit" | "onChange" | "size" | "rows"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Receives the raw value; whitespace-only never submits. */
  onSubmit?: (value: string) => void;
  /** A reply is streaming: the send button becomes stop and Enter does nothing. */
  loading?: boolean;
  onStop?: () => void;
  /** Clear the field after a submit (uncontrolled only). Default true. */
  clearOnSubmit?: boolean;
  /** Actions at the start of the bottom row: attach, model picker… */
  leading?: ReactNode;
  /** Actions just before the send button. */
  trailing?: ReactNode;
  /** Above the field: pending attachment chips, a quoted reply… */
  header?: ReactNode;
  /** Rows before the field scrolls. Default 8. */
  maxRows?: number;
  /** Rows when empty. Default 1. */
  minRows?: number;
  submitLabel?: string;
  stopLabel?: string;
  size?: Size;
  /** Classes for the outer surface. `className` goes to the textarea. */
  containerClassName?: string;
}

export const InputMessage = forwardRef<HTMLTextAreaElement, InputMessageProps>(
  function InputMessage(
    {
      value: valueProp,
      defaultValue = "",
      onValueChange,
      onSubmit,
      loading = false,
      onStop,
      clearOnSubmit = true,
      leading,
      trailing,
      header,
      maxRows = 8,
      minRows = 1,
      submitLabel = "Send",
      stopLabel = "Stop",
      size,
      disabled,
      placeholder = "Message",
      className,
      containerClassName,
      onKeyDown,
      ...props
    },
    forwardedRef,
  ) {
    const tokens = useSize(size);
    const reduce = useReducedMotion();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);

    const [internal, setInternal] = useState(defaultValue);
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : internal;
    const empty = value.trim().length === 0;

    const setValue = useCallback(
      (next: string) => {
        if (!controlled) setInternal(next);
        onValueChange?.(next);
      },
      [controlled, onValueChange],
    );

    // Measured rather than `field-sizing: content`, which can't cap at a row count. Snaps:
    // a spring would lag the caret.
    const resize = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      const style = getComputedStyle(el);
      const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4;
      const chrome =
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth);
      const min = line * minRows + chrome;
      const max = line * maxRows + chrome;
      el.style.height = "auto";
      const content =
        el.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const next = Math.min(Math.max(content, min), max);
      el.style.height = `${next}px`;
      el.style.overflowY = content > max ? "auto" : "hidden";
    }, [maxRows, minRows]);

    useLayoutEffect(resize, [resize, value]);

    // A width change rewraps the text, so the row count can change without typing.
    useLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      let width = el.offsetWidth;
      const observer = new ResizeObserver(() => {
        if (el.offsetWidth === width) return;
        width = el.offsetWidth;
        resize();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [resize]);

    const submit = () => {
      if (loading || disabled || empty) return;
      onSubmit?.(value);
      if (clearOnSubmit && !controlled) setInternal("");
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key !== "Enter" || event.shiftKey || event.altKey) return;
      // IME confirm; Safari fires `compositionend` before this keydown, hence 229.
      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      submit();
    };

    const showStop = loading;
    const actionDisabled = showStop ? !onStop : disabled || empty;
    const swap = reducedTransition(spring.fast, reduce);

    return (
      <Elevated
        offset={1}
        data-slot="input-message"
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "flex w-full cursor-text flex-col rounded-xl border border-border p-2",
          tokens.gap,
          "transition-colors duration-(--duration-fast) focus-within:border-border-strong",
          disabled && "cursor-not-allowed opacity-50",
          containerClassName,
        )}
        // Clicking the surface's padding focuses the field, so the whole card is a target.
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          textareaRef.current?.focus();
        }}
      >
        {header}
        <Textarea
          ref={textareaRef}
          rows={minRows}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          enterKeyHint="send"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          // The surface is the border, so strip the Textarea's own chrome.
          style={{ backgroundImage: "none" }}
          className={cn(
            "field-sizing-fixed min-h-0 resize-none rounded-none border-0 bg-transparent px-2 py-1",
            "placeholder:text-muted-foreground focus-visible:border-0 disabled:opacity-100",
            tokens.field,
            className,
          )}
          {...props}
        />
        <div className={cn("flex items-center", tokens.gap)}>
          {leading ? <div className={cn("flex items-center", tokens.gap)}>{leading}</div> : null}
          <div className="flex-1" />
          {trailing ? <div className={cn("flex items-center", tokens.gap)}>{trailing}</div> : null}
          <Button
            variant="primary"
            aria-label={showStop ? stopLabel : submitLabel}
            title={showStop ? stopLabel : submitLabel}
            disabled={actionDisabled}
            onClick={showStop ? onStop : submit}
            className={cn(
              tokens.square,
              "shrink-0 gap-0 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={showStop ? "stop" : "send"}
                className="grid place-items-center"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: springExit.fast }}
                transition={swap}
              >
                {showStop ? (
                  <IconSquare size={tokens.icon - 4} fill="currentColor" aria-hidden />
                ) : (
                  <IconArrowUp size={tokens.icon} aria-hidden />
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </Elevated>
    );
  },
);
