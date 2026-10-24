import {
  Children,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { cn } from "cn";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type FluidHoverAxis, useFluidHover } from "@/hooks/use-fluid-hover";

export interface SharedLayoutBgProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children: ReactNode;
  as?: "div" | "ul";
  axis?: FluidHoverAxis;
  pillClassName?: string;
  /** px the pill extends past each row horizontally. */
  inset?: number;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
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
  const { registerItem } = hover;

  // Stable per index, so React doesn't re-run them every render.
  const refCallbacks = useRef(new Map<number, RefCallback<HTMLElement>>());
  const itemRef = useCallback(
    (index: number, childRef: Ref<HTMLElement> | undefined) => {
      let callback = refCallbacks.current.get(index);
      if (!callback) {
        callback = (element: HTMLElement | null) => registerItem(index, element);
        refCallbacks.current.set(index, callback);
      }
      const register = callback;
      if (!childRef) return register;
      return (element: HTMLElement | null) => {
        register(element);
        setRef(childRef, element);
      };
    },
    [registerItem],
  );

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
    .map((child, index) => {
      const el = child as ReactElement<{ className?: string; ref?: Ref<HTMLElement> }>;
      return cloneElement(el, {
        className: cn("relative z-10", el.props.className),
        ref: itemRef(index, el.props.ref),
      });
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
