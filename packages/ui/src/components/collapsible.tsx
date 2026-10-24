import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { FOLD } from "@/lib/ease";
import { reducedTransition, springExit } from "@/lib/springs";

/**
 * Clipped only while moving, so focus rings aren't cut once open. Folds to `"auto"`, not a
 * measured height, so a nested collapsible doesn't trigger a second animation here.
 */
export function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, overflow: "hidden" }}
          animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
          exit={
            reduce
              ? { opacity: 0, transition: springExit.fast }
              : { height: 0, opacity: 0, overflow: "hidden" }
          }
          transition={reducedTransition(FOLD, reduce)}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
