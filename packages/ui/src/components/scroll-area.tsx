import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { type ComponentProps, useSyncExternalStore } from "react";
import { cn } from "cn";

// Touch-primary devices keep the native indicator: a custom thumb there is a target nobody aims at.
const TOUCH_PRIMARY_QUERY = "(pointer: coarse)";
// Base UI hides the native scrollbar with this class; touch-primary devices keep it.
const DISABLE_SCROLLBAR_CLASS = "base-ui-disable-scrollbar";

function subscribeTouchPrimary(onChange: () => void) {
  const query = window.matchMedia?.(TOUCH_PRIMARY_QUERY);
  query?.addEventListener?.("change", onChange);
  return () => query?.removeEventListener?.("change", onChange);
}

/** Read synchronously, so a client render never flips. */
function useTouchPrimary() {
  return useSyncExternalStore(
    subscribeTouchPrimary,
    () => window.matchMedia?.(TOUCH_PRIMARY_QUERY).matches ?? false,
    () => false,
  );
}

function withoutDisableScrollbar(className: string | undefined) {
  return className
    ?.split(" ")
    .filter((name) => name !== DISABLE_SCROLLBAR_CLASS)
    .join(" ");
}

export interface ScrollAreaProps extends ScrollAreaPrimitive.Root.Props {
  /** Draw a hairline at each edge that has more content past it. */
  divider?: boolean;
}

function ScrollArea({ className, children, divider = false, ...props }: ScrollAreaProps) {
  const touchPrimary = useTouchPrimary();
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn(
        "relative",
        divider && [
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-border before:opacity-0 before:transition-opacity before:duration-(--duration-fast)",
          "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-px after:bg-border after:opacity-0 after:transition-opacity after:duration-(--duration-fast)",
          "data-overflow-y-end:after:opacity-100 data-overflow-y-start:before:opacity-100",
        ],
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // Always a plain div, so switching input modes never remounts the content.
        render={(viewportProps: ComponentProps<"div">) => (
          <div
            {...viewportProps}
            className={
              touchPrimary
                ? withoutDisableScrollbar(viewportProps.className)
                : viewportProps.className
            }
          />
        )}
        className="size-full rounded-[inherit] transition-[color,box-shadow] duration-(--duration-fast) outline-none focus-visible:ring-4 focus-visible:ring-ring"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      {touchPrimary ? null : <ScrollAreaPrimitive.Corner />}
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  const touchPrimary = useTouchPrimary();
  if (touchPrimary) return null;
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/scrollbar flex touch-none select-none",
        // Hide delay lets the thumb visibly narrow before it fades.
        "opacity-0 transition-opacity delay-160 duration-(--duration-exit-moderate) ease-(--ease-exit)",
        "data-hovering:opacity-100 data-hovering:delay-0 data-hovering:duration-160 data-hovering:ease-out",
        "data-scrolling:opacity-100 data-scrolling:delay-0 data-scrolling:duration-160 data-scrolling:ease-out",
        "data-vertical:h-full data-vertical:w-2.5 data-vertical:justify-end data-vertical:pr-0.5",
        "data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:justify-end data-horizontal:pb-0.5",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative shrink-0 rounded-full bg-[color-mix(in_oklab,var(--overlay)_8%,transparent)]",
          "transition-[width,height,background-color] duration-(--duration-fast)",
          "group-hover/scrollbar:bg-[color-mix(in_oklab,var(--overlay)_12%,transparent)]",
          "active:bg-[color-mix(in_oklab,var(--overlay)_16%,transparent)]",
          "data-vertical:w-1 data-vertical:group-hover/scrollbar:w-1.5 data-vertical:active:w-1.5",
          "data-horizontal:h-1 data-horizontal:group-hover/scrollbar:h-1.5 data-horizontal:active:h-1.5",
        )}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
