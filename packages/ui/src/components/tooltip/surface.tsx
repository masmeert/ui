import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode, Ref } from "react";
import { spring, springExit } from "@/lib/springs";
import { SURFACE_OFFSET, SurfaceProvider, useElevation } from "@/lib/surface";
import { typeClass } from "@/lib/type-scale";
import { cn } from "cn";

/** Shared by trigger tooltips and chart readouts; the caller positions it. */
export function TooltipSurface({
  children,
  className,
  ref,
  ...props
}: Omit<ComponentProps<typeof motion.span>, "children"> & {
  children?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}) {
  const reduce = useReducedMotion();
  // Light fixed shadow: a label shouldn't read as a panel.
  const surface = useElevation(SURFACE_OFFSET.popover, { shadowLevel: 3 });
  return (
    <motion.span
      ref={ref}
      role="tooltip"
      variants={
        reduce
          ? {
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: spring.fast },
              exit: { opacity: 0, transition: springExit.fast },
            }
          : {
              initial: { opacity: 0, transform: "scale(0.97)" },
              animate: {
                opacity: 1,
                transform: "scale(1)",
                transition: spring.fast,
              },
              exit: {
                opacity: 0,
                transform: "scale(0.97)",
                transition: springExit.fast,
              },
            }
      }
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "block rounded-lg px-2.5 py-1 font-medium whitespace-nowrap text-foreground",
        surface.className,
        typeClass("caption"),
        className,
      )}
      {...props}
    >
      <SurfaceProvider value={surface.level}>{children}</SurfaceProvider>
    </motion.span>
  );
}
