import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PresenceGate } from "@/components/presence-gate";
import { useSize } from "@/lib/size";
import { reducedTransition, spring, springExit } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { TOUCH_GESTURE_CONTENT_CLASS } from "@/lib/touch";
import { cn } from "cn";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heights (0-1 = fraction of viewport, or "auto"). First entry is default. */
  snapPoints?: (number | "auto")[];
  defaultSnap?: number;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Min drag distance (px) past current snap to dismiss. */
  dismissThreshold?: number;
}

export function Drawer({
  open,
  onOpenChange,
  snapPoints = [0.5, 0.92],
  defaultSnap = 0,
  title,
  description,
  children,
  className,
  dismissThreshold = 120,
}: DrawerProps) {
  const [snap, setSnap] = useState(defaultSnap);
  const [mounted, setMounted] = useState(false);
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const surface = useElevation(SURFACE_OFFSET.dialog);
  const { type } = useSize();
  const heightRef = useRef(0);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset during render, not in an effect: an effect lets the sheet paint at the last session's snap first.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSnap(defaultSnap);
  }

  // iOS Safari ignores overflow:hidden for scroll chaining; position:fixed is the lock that holds.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open, onOpenChange]);

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 600 || offset > dismissThreshold) {
      const smaller = snapPoints.map((_, i) => i).filter((i) => i < snap);
      if (smaller.length && velocity < 800 && offset < dismissThreshold * 1.6) {
        setSnap(smaller[smaller.length - 1]);
      } else {
        onOpenChange(false);
      }
      return;
    }

    if (velocity < -500) {
      setSnap((current) => Math.min(snapPoints.length - 1, current + 1));
      return;
    }

    setSnap((current) => {
      if (offset > 80 && current > 0) return current - 1;
      if (offset < -80 && current < snapPoints.length - 1) return current + 1;
      return current;
    });
  };

  const snapValue = snapPoints[snap];
  const height = snapValue === "auto" ? "auto" : `${snapValue * 100}vh`;

  // Portaled: an ancestor with backdrop-filter or transform would become the fixed containing block.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <PresenceGate key="backdrop">
          {({ gate }) => (
            <motion.button
              type="button"
              aria-label="Close bottom sheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: springExit.slow }}
              transition={spring.slow}
              {...gate}
              onClick={() => onOpenChange(false)}
              // Small blur radius: backdrop-blur re-rasterizes every frame the sheet drags over it.
              className="pointer-events-auto fixed inset-0 z-(--z-overlay) bg-background/40 backdrop-blur-sm"
            />
          )}
        </PresenceGate>
      ) : null}
      {open ? (
        <PresenceGate key="sheet">
          {({ gate }) => (
            <motion.div
              ref={sheetRef}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.02, bottom: 0.4 }}
              dragMomentum={false}
              onDragEnd={onDragEnd}
              initial={reduce ? { y: 0, opacity: 0, height } : { y: "100%", height }}
              animate={reduce ? { y: 0, opacity: 1, height } : { y: 0, height }}
              exit={{
                ...(reduce ? { y: 0, opacity: 0 } : { y: "100%" }),
                transition: springExit.slow,
              }}
              transition={reducedTransition(spring.slow, reduce)}
              onAnimationComplete={() => {
                if (sheetRef.current) heightRef.current = sheetRef.current.offsetHeight;
              }}
              {...gate}
              style={{ maxHeight: snapValue === "auto" ? "92vh" : undefined, ...gate.style }}
              className={cn(
                "pointer-events-auto fixed right-0 bottom-0 left-0 z-(--z-overlay) mx-auto flex max-w-2xl flex-col overflow-hidden rounded-t-3xl will-change-transform",
                surface.className,
                className,
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-describedby={description ? descriptionId : undefined}
              aria-label={title ? undefined : "Bottom sheet"}
            >
              <div className="flex flex-col items-center px-4 pt-3 pb-2">
                {/* Drag only the pill so the title and description stay selectable. */}
                <div
                  onPointerDown={(event) => dragControls.start(event)}
                  // Keeps iOS's callout from stealing a slow pull and freezing the sheet.
                  className={cn(
                    "flex cursor-grab touch-none items-center justify-center py-1 active:cursor-grabbing",
                    TOUCH_GESTURE_CONTENT_CLASS,
                  )}
                >
                  <div className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
                </div>
                {title || description ? (
                  <div className="mt-2 w-full">
                    {title ? (
                      <h2 id={titleId} className={cn(type.title, "font-semibold text-foreground")}>
                        {title}
                      </h2>
                    ) : null}
                    {description ? (
                      <p
                        id={descriptionId}
                        className={cn("mt-0.5", type.body, "text-muted-foreground")}
                      >
                        {description}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {/* overscroll-contain stops boundary scrolls from chaining to the page. */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
                <SurfaceProvider value={surface.level}>{children}</SurfaceProvider>
              </div>
            </motion.div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
