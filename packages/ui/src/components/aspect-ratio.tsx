import { cn } from "cn";

function AspectRatio({
  ratio = 1,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio?: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio) w-full", className)}
      {...props}
    />
  );
}

export { AspectRatio };
