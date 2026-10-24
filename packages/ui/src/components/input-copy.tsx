import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import {
  forwardRef,
  type InputHTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "cn";
import { type Size, useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";

export interface InputCopyProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "readOnly" | "size" | "onCopy"
> {
  value: string;
  /** Without one, pass `aria-label`. */
  label?: string;
  /** Called only when the copy succeeded. */
  onCopy?: (value: string) => void;
  copyLabel?: string;
  /** Announced to screen readers after a copy. */
  copiedLabel?: string;
  failedLabel?: string;
  /** How long the check stays, in ms. */
  resetAfter?: number;
  mono?: boolean;
  size?: Size;
  className?: string;
  /** The bordered field (input + button). */
  fieldClassName?: string;
}

/** Falls back to `execCommand("copy")` where the Clipboard API is missing or refuses (http, iframes, older WebKit). */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand.
    }
  }
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  const previousFocus = document.activeElement as HTMLElement | null;
  document.body.append(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  textarea.remove();
  previousFocus?.focus({ preventScroll: true });
  return ok;
}

const ICON_SWAP = { opacity: 0, scale: 0.6 };

/** The result goes to a live region, not the button's name, so it isn't announced twice. */
export const InputCopy = forwardRef<HTMLInputElement, InputCopyProps>(function InputCopy(
  {
    value,
    label,
    onCopy,
    copyLabel = "Copy",
    copiedLabel = "Copied",
    failedLabel = "Couldn't copy",
    resetAfter = 1500,
    mono = false,
    size: sizeProp,
    className,
    fieldClassName,
    id: idProp,
    disabled,
    onFocus,
    ...props
  },
  ref,
) {
  const size = useSize(sizeProp);
  const reduce = useReducedMotion();
  const autoId = useId();
  const id = idProp ?? autoId;
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    const ok = await copyText(value);
    if (timer.current) clearTimeout(timer.current);
    setState(ok ? "copied" : "failed");
    // A second copy restarts the clock rather than cutting the check short.
    timer.current = setTimeout(() => setState("idle"), resetAfter);
    if (ok) onCopy?.(value);
  }, [value, resetAfter, onCopy]);

  const copied = state === "copied";
  const swap = reducedTransition(spring.fast, reduce);
  const hidden = reduce ? { opacity: 0 } : ICON_SWAP;

  return (
    <div data-slot="input-copy" className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className={cn("font-semibold text-foreground", size.text)}>
          {label}
        </label>
      ) : null}
      <div
        data-slot="input-copy-field"
        className={cn(
          "flex items-center rounded-lg border border-input bg-transparent transition-colors duration-(--duration-fast)",
          "focus-within:border-ring",
          size.control,
          // Segment padding, so the button matches a segmented control's inner height.
          size.segmentPad,
          "pl-0",
          disabled && "opacity-50",
          fieldClassName,
        )}
      >
        <input
          ref={ref}
          id={id}
          readOnly
          disabled={disabled}
          value={value}
          onFocus={(event) => {
            event.currentTarget.select();
            onFocus?.(event);
          }}
          className={cn(
            "h-full min-w-0 flex-1 truncate bg-transparent text-foreground outline-none",
            size.controlPx,
            size.field,
            mono && "font-mono",
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={copyLabel}
          aria-controls={id}
          disabled={disabled}
          onClick={copy}
          className={cn(
            "grid aspect-square shrink-0 place-items-center rounded-md text-muted-foreground outline-none",
            "transition-[background-color,color,scale] duration-(--duration-fast) hover:bg-hover hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring active:scale-95 motion-reduce:active:scale-100",
            "disabled:pointer-events-none",
            size.segmentItem,
            copied && "text-foreground",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "check" : "copy"}
              className="grid place-items-center"
              initial={hidden}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ ...hidden, transition: springExit.fast }}
              transition={swap}
            >
              {copied ? (
                <IconCheck size={size.icon} aria-hidden />
              ) : (
                <IconCopy size={size.icon} aria-hidden />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? copiedLabel : state === "failed" ? failedLabel : ""}
      </span>
    </div>
  );
});
