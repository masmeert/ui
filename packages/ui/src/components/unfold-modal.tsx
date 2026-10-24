import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  use,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { PresenceGate } from "@/components/presence-gate";
import { spring, springExit } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { cn } from "cn";

type UnfoldModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
};

const UnfoldModalContext = createContext<UnfoldModalContextValue | null>(null);

function useUnfoldModalContext(component: string) {
  const context = use(UnfoldModalContext);
  if (!context) {
    throw new Error(`${component} must be used within <UnfoldModal>`);
  }
  return context;
}

export interface UnfoldModalProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A modal whose full-size surface unfolds outward from its exact center. */
export function UnfoldModal({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: UnfoldModalProps) {
  const id = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const value = useMemo<UnfoldModalContextValue>(
    () => ({
      open,
      setOpen,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
    }),
    [id, open, setOpen],
  );

  return <UnfoldModalContext value={value}>{children}</UnfoldModalContext>;
}

export interface UnfoldModalTriggerProps {
  children: ReactElement;
}

export function UnfoldModalTrigger({ children }: UnfoldModalTriggerProps) {
  const context = useUnfoldModalContext("UnfoldModalTrigger");
  if (!isValidElement<React.HTMLAttributes<HTMLElement>>(children)) return children;

  return cloneElement(children, {
    id: context.triggerId,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      if (!event.defaultPrevented) context.setOpen(!context.open);
    },
    "aria-haspopup": "dialog",
    "aria-expanded": context.open,
    "aria-controls": context.open ? context.contentId : undefined,
  });
}

export interface UnfoldModalCloseProps {
  children: ReactElement;
}

export function UnfoldModalClose({ children }: UnfoldModalCloseProps) {
  const context = useUnfoldModalContext("UnfoldModalClose");
  if (!isValidElement<React.HTMLAttributes<HTMLElement>>(children)) return children;

  return cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      if (!event.defaultPrevented) context.setOpen(false);
    },
  });
}

export interface UnfoldModalContentProps {
  children: ReactNode;
  ariaLabel: string;
  ariaDescribedBy?: string;
  /** Close on Escape or backdrop press. */
  dismissible?: boolean;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  className?: string;
  backdropClassName?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// Same radius in both, so the motion doesn't spend its last frames rounding corners.
const FOLDED_CLIP = "inset(48% 48% 48% 48% round 30px)";
const OPEN_CLIP = "inset(0% 0% 0% 0% round 30px)";

function getFocusableElements(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0,
  );
}

export function UnfoldModalContent({
  children,
  ariaLabel,
  ariaDescribedBy,
  dismissible = true,
  showCloseButton = true,
  closeButtonLabel = "Close modal",
  className,
  backdropClassName,
}: UnfoldModalContentProps) {
  const context = useUnfoldModalContext("UnfoldModalContent");
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const surface = useElevation(SURFACE_OFFSET.dialog);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!context.open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      const [firstFocusable] = getFocusableElements(panelRef.current);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        context.setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.getElementById(context.triggerId)?.focus();
    };
  }, [context, dismissible]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {context.open ? (
        <PresenceGate>
          {({ isPresent, gate }) => (
            <>
              <motion.button
                type="button"
                aria-label="Dismiss modal"
                tabIndex={-1}
                disabled={!dismissible}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: springExit.slow }}
                {...gate}
                transition={spring.slow}
                onClick={() => context.setOpen(false)}
                className={cn(
                  "pointer-events-auto fixed inset-0 z-(--z-overlay) h-full w-full cursor-default bg-background/10 backdrop-blur-sm",
                  backdropClassName,
                )}
              />

              {/* Never takes pointer events, so it only needs `inert`. */}
              <div
                inert={!isPresent}
                className="pointer-events-none fixed inset-4 z-(--z-overlay) flex items-center justify-center overflow-y-auto [filter:drop-shadow(0_1px_1px_rgb(0_0_0/0.06))_drop-shadow(0_8px_20px_rgb(0_0_0/0.12))]"
              >
                <div className="flex w-full flex-col items-center py-8">
                  <motion.div
                    ref={panelRef}
                    id={context.contentId}
                    role="dialog"
                    aria-modal="true"
                    aria-label={ariaLabel}
                    aria-describedby={ariaDescribedBy}
                    tabIndex={-1}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0, clipPath: OPEN_CLIP }
                        : { opacity: 1, clipPath: FOLDED_CLIP }
                    }
                    animate={{
                      opacity: 1,
                      clipPath: OPEN_CLIP,
                    }}
                    exit={{
                      ...(prefersReducedMotion
                        ? { opacity: 0, clipPath: OPEN_CLIP }
                        : { opacity: 1, clipPath: FOLDED_CLIP }),
                      transition: springExit.slow,
                    }}
                    {...gate}
                    // A no-op onUpdate keeps Motion off WAAPI: a compositor clip-path animation doesn't repaint the parent's drop-shadow until it ends.
                    onUpdate={() => {}}
                    transition={prefersReducedMotion ? spring.fast : spring.slow}
                    className={cn(
                      "pointer-events-auto relative w-full max-w-104 origin-center overflow-hidden rounded-[30px] border border-border will-change-[clip-path]",
                      // clip-path cuts the box-shadow; depth comes from the wrapper's drop-shadow.
                      surface.className,
                      className,
                    )}
                  >
                    <SurfaceProvider value={surface.level}>{children}</SurfaceProvider>

                    {showCloseButton ? (
                      <motion.button
                        type="button"
                        aria-label={closeButtonLabel}
                        onClick={() => context.setOpen(false)}
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: prefersReducedMotion ? 1 : 0.88,
                          transition: springExit.fast,
                        }}
                        // Waits for the unfold to clear the corner before it pops in.
                        transition={
                          prefersReducedMotion ? spring.fast : { ...spring.moderate, delay: 0.16 }
                        }
                        className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full bg-hover text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-selected hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </motion.button>
                    ) : null}
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
