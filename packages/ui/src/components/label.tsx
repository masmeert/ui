import * as React from "react";
import { useSize } from "@/lib/size";
import { cn } from "cn";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  const { type } = useSize();
  return (
    <label
      data-slot="label"
      className={cn(
        type.body,
        // leading-none: line leading would offset the centring beside a checkbox.
        "flex items-center gap-2 leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
