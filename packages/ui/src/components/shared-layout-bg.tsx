import {
  Children,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { cn } from "cn";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type FluidHoverAxis, useFluidHover } from "@/hooks/use-fluid-hover";
import { useFluidHoverDomItems } from "@/hooks/use-fluid-hover-dom-items";

export interface SharedLayoutBgProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children: ReactNode;
  as?: "div" | "ul";
  axis?: FluidHoverAxis;
  pillClassName?: string;
  /** px the pill extends past each row horizontally. */
  inset?: number;
}

export const SharedLayoutBg = forwardRef<HTMLElement, SharedLayoutBgProps>(function SharedLayoutBg(
  {
    children,
    as = "div",
    axis = "y",
    className,
    pillClassName,
    inset = 20,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onClick,
    ...props
  },
  forwardedRef,
) {
  const containerRef = useRef<HTMLElement>(null);
  useImperativeHandle(forwardedRef, () => containerRef.current as HTMLElement);
  const hover = useFluidHover(containerRef, { axis });
  // Rows are found in DOM order, not through refs: a `motion` child keeps the ref it mounted
  // with, so a row that moved would stay registered at its old index.
  useFluidHoverDomItems(hover, containerRef, ':scope > :not([data-slot="fluid-hover-highlight"])');

  const insetHover = useMemo(
    () => ({
      ...hover,
      itemRects: hover.itemRects.map(
        (rect) => rect && { ...rect, left: rect.left - inset, width: rect.width + inset * 2 },
      ),
    }),
    [hover, inset],
  );

  const rendered = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const el = child as ReactElement<{ className?: string }>;
      return cloneElement(el, { className: cn("relative z-10", el.props.className) });
    });

  const Tag = as;
  return (
    <Tag
      {...props}
      ref={containerRef as Ref<HTMLDivElement & HTMLUListElement>}
      className={cn("relative flex w-full flex-col", className)}
      onPointerEnter={(event) => {
        hover.handlers.onPointerEnter(event);
        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        hover.handlers.onPointerMove(event);
        onPointerMove?.(event);
      }}
      onPointerLeave={(event) => {
        hover.handlers.onPointerLeave(event);
        onPointerLeave?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        hover.handlers.onClick(event);
      }}
    >
      <FluidHoverHighlight hover={insetHover} className={cn("rounded-2xl", pillClassName)} />
      {rendered}
    </Tag>
  );
});
