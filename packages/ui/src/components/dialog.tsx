import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PresenceGate } from "@/components/presence-gate";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { cn } from "cn";

export interface DialogProps {
  /** Which view is currently shown. `null` closes the modal. Escape and the backdrop call `onClose`. */
  viewId: string | null;
  onClose: () => void;
  children: ReactNode;
  /** "bottom" anchors to the viewport bottom (mobile-like). "center" centers vertically. */
  placement?: "bottom" | "center";
  className?: string;
}

export function Dialog({
  viewId,
  onClose,
  children,
  placement = "bottom",
  className,
}: DialogProps) {
  const open = viewId !== null;
  const reduce = useReducedMotion();
  const enterY = reduce ? 0 : placement === "bottom" ? 40 : 20;
  const enterScale = reduce ? 1 : 0.97;
  const surface = useElevation(SURFACE_OFFSET.dialog);

  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    // Focus left behind the modal keeps getting keys, and a terminal there swallows Escape.
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const takeFocus = !panel.current?.contains(previous);
    if (takeFocus) panel.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (takeFocus) previous?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Backdrop and panel layer are separate fixed siblings, each gated so interaction
  // releases when the exit starts, not when it ends.
  // Portaled so a caller inside a stacking context still paints above it.
  return createPortal(
    <AnimatePresence>
      {open ? (
        <PresenceGate key="backdrop">
          {({ gate }) => (
            <motion.button
              type="button"
              aria-label="Close modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: springExit.slow }}
              transition={spring.slow}
              {...gate}
              onClick={onClose}
              // Electron hit-tests `app-region: drag` regardless of stacking, so a drag
              // region under the modal would swallow its clicks and scrolling.
              className="pointer-events-auto fixed inset-0 z-(--z-overlay) bg-black/30 [backdrop-filter:blur(24px)_saturate(140%)] [-webkit-app-region:no-drag] [-webkit-backdrop-filter:blur(24px)_saturate(140%)]"
            />
          )}
        </PresenceGate>
      ) : null}

      {open ? (
        <PresenceGate key="panel-layer">
          {({ isPresent, gate }) => (
            // The layer never takes pointer events, so it only needs `inert`.
            <div
              inert={!isPresent}
              className={cn(
                "pointer-events-none fixed inset-4 z-(--z-overlay) flex justify-center",
                placement === "bottom" ? "items-end pb-4" : "items-center",
              )}
            >
              <motion.div
                key="panel"
                ref={panel}
                tabIndex={-1}
                layout={!reduce}
                initial={{ opacity: 0, y: enterY, scale: enterScale }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: enterY,
                  scale: reduce ? 1 : 0.98,
                  transition: springExit.slow,
                }}
                transition={reducedTransition(spring.slow, reduce)}
                {...gate}
                style={{ ...gate.style, borderRadius: 28 }}
                className={cn(
                  "pointer-events-auto relative w-full max-w-sm overflow-hidden border border-border outline-none",
                  surface.className,
                  className,
                )}
              >
                <motion.div layout={reduce ? false : "position"} className="p-5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={viewId}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{
                        opacity: 0,
                        ...(reduce ? {} : { y: -8, filter: "blur(4px)" }),
                        transition: springExit.moderate,
                      }}
                      transition={reducedTransition(spring.moderate, reduce)}
                    >
                      <SurfaceProvider value={surface.level}>{children}</SurfaceProvider>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
