import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { INSTANT, reducedTransition, spring, springExit } from "@/lib/springs";
import { typeClass } from "@/lib/type-scale";
import { cn } from "cn";

export type InputOTPStatus = "idle" | "error" | "success";

export interface InputOTPProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once every slot is filled. */
  onComplete?: (value: string) => void;
  label?: string;
  /** Helper text shown below the slots while idle. */
  hint?: string;
  successMessage?: string;
  errorMessage?: string;
  /** External validation feedback. "error" shakes, "success" draws a check. */
  status?: InputOTPStatus;
  /** Render dots instead of the typed digits. */
  mask?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
  className?: string;
}

export function InputOTP({
  length = 6,
  value: controlledValue,
  defaultValue = "",
  onChange,
  onComplete,
  label,
  hint,
  successMessage,
  errorMessage,
  status = "idle",
  mask = false,
  disabled = false,
  autoFocus = false,
  "aria-label": ariaLabel = "One-time passcode",
  className,
}: InputOTPProps) {
  const uid = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);

  const controlled = controlledValue !== undefined;

  // A fixed-length array, so a cleared middle slot stays a hole instead of collapsing left.
  const [slots, setSlots] = useState<string[]>(() =>
    toSlots(controlled ? controlledValue : defaultValue, length),
  );
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);

  const joined = slots.join("");
  const joinedRef = useRef(joined);

  useEffect(() => {
    joinedRef.current = joined;
  }, [joined]);

  // Skip when the parent echoes our own onChange, so holes survive the controlled round-trip.
  useEffect(() => {
    if (!controlled) return;
    const incoming = sanitize(controlledValue, length);
    if (incoming !== joinedRef.current) setSlots(toSlots(incoming, length));
  }, [controlled, controlledValue, length]);

  const commit = (next: string[]) => {
    const wasComplete = slots.every((c) => c !== "");
    setSlots(next);
    const str = next.join("");
    onChange?.(str);
    // Fire only on the empty→full transition, not on every edit of a full code.
    if (!wasComplete && next.every((c) => c !== "")) onComplete?.(str);
  };

  const clearSlot = (idx: number) => {
    const next = [...slots];
    next[idx] = "";
    commit(next);
  };

  const slotFromClientX = (clientX: number) => {
    const els = slotsRef.current?.children;
    if (!els) return 0;
    for (let i = 0; i < els.length; i++) {
      if (clientX < els[i].getBoundingClientRect().right) return i;
    }
    return length - 1;
  };

  const insert = (raw: string, from = active) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const next = [...slots];
    let i = from;
    for (const ch of digits) {
      if (i >= length) break;
      next[i] = ch;
      i++;
    }
    commit(next);
    setActive(Math.min(i, length - 1));
  };

  // preventDefault on keydown reliably blocks native insertion (React's beforeinput doesn't),
  // so the hidden input never accumulates a competing string.
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      e.preventDefault();
      insert(k);
    } else if (k === "Backspace") {
      e.preventDefault();
      if (slots[active]) {
        clearSlot(active);
      } else if (active > 0) {
        clearSlot(active - 1);
        setActive((current) => Math.max(current - 1, 0));
      }
    } else if (k === "Delete") {
      e.preventDefault();
      clearSlot(active);
    } else if (k === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (k === "ArrowRight") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, length - 1));
    } else if (k === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (k === "End") {
      e.preventDefault();
      setActive(length - 1);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    // preventDefault suppresses the duplicate onChange, keeping that path autofill-only.
    e.preventDefault();
    insert(e.clipboardData.getData("text"), active);
  };

  // Only SMS autofill reaches here: keys go through onKeyDown, paste through onPaste.
  const onChangeNative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = sanitize(e.target.value, length);
    if (!digits) return;
    commit(toSlots(digits, length));
    setActive(Math.min(digits.length, length - 1));
  };

  // Imperative so it replays on every transition into "error".
  useEffect(() => {
    if (status !== "error" || reduce || !slotsRef.current) return;
    // A keyframed shake, not travel to a target: its length is the gesture, not a tier.
    animate(slotsRef.current, { x: [0, -5, 5, -3, 3, -1, 0] }, { duration: 0.45, ease: EASE_OUT });
  }, [status, reduce]);

  const showSuccess = status === "success";
  const activeIndex = focused ? active : -1;
  const message = showSuccess ? successMessage : status === "error" ? errorMessage : hint;

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      {label ? (
        <label
          htmlFor={`${uid}-input`}
          className={cn("font-medium text-foreground", typeClass("body"))}
        >
          {label}
        </label>
      ) : null}
      <fieldset
        className="relative m-0 inline-flex w-max border-0 p-0"
        onMouseDown={(e) => {
          if (disabled) return;
          // Suppress the native caret; we drive the active slot.
          e.preventDefault();
          // Clamp to the first empty slot so a click can't jump ahead of progress.
          const firstEmpty = slots.indexOf("");
          const cap = firstEmpty === -1 ? length - 1 : firstEmpty;
          setActive(Math.min(slotFromClientX(e.clientX), cap));
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          id={`${uid}-input`}
          inputMode="numeric"
          autoComplete="one-time-code"
          // biome-ignore lint/a11y/noAutofocus: opt-in via prop for OTP-first screens.
          autoFocus={autoFocus}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={status === "error"}
          // Always empty: state owns the digits.
          value=""
          maxLength={length}
          onKeyDown={onKeyDown}
          onChange={onChangeNative}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Transparent overlay owns focus, soft keyboard, paste and autofill; slots are presentational.
          className="absolute inset-0 z-20 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
        />

        <div ref={slotsRef} className="flex items-center gap-2">
          {Array.from({ length }, (_, i) => {
            const char = slots[i] ?? "";
            const isActive = i === activeIndex;
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length slot grid, never reordered.
                key={`${uid}-${i}`}
                data-active={isActive}
                data-filled={char !== ""}
                className={cn(
                  "relative grid h-14 w-12 place-items-center overflow-hidden rounded-xl border font-semibold tabular-nums transition-colors duration-(--duration-fast)",
                  typeClass("title"),
                  showSuccess
                    ? "border-emerald-500/60 text-foreground"
                    : status === "error"
                      ? "border-destructive/60 text-foreground"
                      : char
                        ? "border-border-strong text-foreground"
                        : "border-border text-muted-foreground",
                  // twMerge lets this win the border.
                  isActive && !showSuccess && status !== "error" && "border-foreground",
                  disabled && "opacity-50",
                )}
              >
                {isActive && !showSuccess ? (
                  <motion.span
                    aria-hidden
                    animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
                    transition={
                      reduce
                        ? undefined
                        : // Caret blink cadence: a loop, not a transition, so no tier applies.
                          { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
                    }
                    className={cn(
                      "pointer-events-none absolute top-1/2 h-6 w-px -translate-y-1/2 bg-foreground",
                      char ? "right-3" : "left-1/2 -translate-x-1/2",
                    )}
                  />
                ) : null}

                {/* Absolutely centered so enter and exit overlap in place. */}
                <AnimatePresence initial={false}>
                  {char ? (
                    <motion.span
                      key={char}
                      initial={reduce ? { opacity: 0 } : { y: 14, opacity: 0, filter: "blur(4px)" }}
                      animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1, filter: "blur(0px)" }}
                      exit={
                        reduce
                          ? { opacity: 0, transition: springExit.fast }
                          : { y: -14, opacity: 0, filter: "blur(4px)", transition: springExit.fast }
                      }
                      transition={spring.fast}
                      className="absolute inset-0 grid place-items-center leading-none"
                    >
                      {mask ? "•" : char}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {showSuccess ? (
            <motion.span
              initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={{
                ...(reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }),
                transition: springExit.moderate,
              }}
              transition={reducedTransition(spring.moderate, reduce)}
              className="pointer-events-none absolute top-1/2 -right-7 -translate-y-1/2 text-emerald-500"
              aria-hidden
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>Verified</title>
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  // Drawn once the badge has landed, so the stroke doesn't race the scale.
                  transition={reduce ? INSTANT : { ...spring.moderate, delay: 0.1 }}
                />
              </svg>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </fieldset>

      {message ? (
        <p
          aria-live="polite"
          className={cn(
            typeClass("caption"),
            showSuccess
              ? "text-emerald-500"
              : status === "error"
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function sanitize(raw: string, length: number) {
  return raw.replace(/\D/g, "").slice(0, length);
}

function toSlots(raw: string, length: number) {
  const digits = sanitize(raw, length);
  return Array.from({ length }, (_, i) => digits[i] ?? "");
}
