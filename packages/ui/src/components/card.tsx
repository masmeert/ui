import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { typeClass } from "@/lib/type-scale";

/** `compact` tightens the card's spacing from 24px to 16px. */
export type CardSize = "default" | "compact";

function Card({
  className,
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & { size?: CardSize }) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "group/card flex flex-col gap-(--card-spacing) rounded-2xl border bg-card py-(--card-spacing) text-card-foreground [--card-spacing:--spacing(6)] data-[size=compact]:[--card-spacing:--spacing(4)]",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "card", size },
  });
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(typeClass("subtitle"), "font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(typeClass("body"), "text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

const CLICKABLE = 'a[href], button, [role="button"]';

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Fluid hover across link/button cards. A gutter click reaches the lit card only within 16px. */
function CardGrid({
  className,
  children,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  ...props
}: React.ComponentProps<"div">) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hover = useFluidHover(containerRef, { axis: "xy", gapClick: { maxDistance: 16 } });
  const { registerItem } = hover;

  // One stable ref callback per index, so React doesn't re-run them every render.
  const refCallbacks = React.useRef(new Map<number, React.RefCallback<HTMLElement>>());
  const itemRef = (index: number, childRef: React.Ref<HTMLElement> | undefined) => {
    let register = refCallbacks.current.get(index);
    if (!register) {
      register = (element: HTMLElement | null) =>
        registerItem(index, element?.matches(CLICKABLE) ? element : null);
      refCallbacks.current.set(index, register);
    }
    const callback = register;
    if (!childRef) return callback;
    return (element: HTMLElement | null) => {
      callback(element);
      setRef(childRef, element);
    };
  };

  const rendered = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child, index) => {
      const element = child as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;
      return React.cloneElement(element, { ref: itemRef(index, element.props.ref) });
    });

  return (
    <div
      data-slot="card-grid"
      {...props}
      ref={containerRef}
      className={cn("relative grid gap-4", className)}
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
      {rendered}
      {/* Above the cards: their fill is opaque, and the hover tint is translucent. */}
      <FluidHoverHighlight hover={hover} className="z-10 rounded-2xl" />
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardGrid,
};
