import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "cn";
import { sizeTokens, useSize } from "@/lib/size";
import { SURFACE_OFFSET, useElevation } from "@/lib/surface";

// Toast actions stay compact whatever the region's size: they sit beside caption text.
const action = sizeTokens("compact");

function Toaster({ toastOptions, ...props }: ToasterProps) {
  const surface = useElevation(SURFACE_OFFSET.popover);
  const { type } = useSize();
  return (
    <Sonner
      className="toaster group"
      closeButton
      icons={{
        success: <IconCheck className="size-3.5" />,
        info: <IconInfoCircle className="size-3.5" />,
        warning: <IconAlertTriangle className="size-3.5" />,
        error: <IconAlertCircle className="size-3.5" />,
        loading: <IconLoader2 className="size-3.5 animate-spin" />,
      }}
      {...props}
      toastOptions={{
        ...toastOptions,
        // Keeps sonner's stacking, swiping and timing; drops its look.
        unstyled: true,
        classNames: {
          toast: cn(
            "pointer-events-auto grid w-(--width) grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[28px] p-3 has-data-description:items-start",
            surface.className,
          ),
          icon: "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
          content: "min-w-0",
          title: cn("truncate font-semibold text-foreground", type.body),
          description: cn("mt-0.5 line-clamp-2 text-muted-foreground", type.caption),
          actionButton: cn(
            "col-start-2 mt-2 inline-flex w-fit items-center rounded-lg bg-hover font-medium text-foreground transition-colors duration-(--duration-fast) hover:bg-selected",
            action.control,
            action.controlPx,
            action.text,
          ),
          cancelButton: cn(
            "col-start-2 mt-2 inline-flex w-fit items-center rounded-lg font-medium text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-hover hover:text-foreground",
            action.control,
            action.controlPx,
            action.text,
          ),
          closeButton: cn(
            "col-start-3 row-start-1 inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-hover hover:text-foreground [&_svg]:size-3.5",
            action.square,
          ),
          success: "[&_[data-icon]]:bg-success/10 [&_[data-icon]]:text-success",
          info: "[&_[data-icon]]:bg-muted [&_[data-icon]]:text-brand",
          loading: "[&_[data-icon]]:bg-muted [&_[data-icon]]:text-brand",
          warning: "[&_[data-icon]]:bg-warning/10 [&_[data-icon]]:text-warning",
          error: "[&_[data-icon]]:bg-destructive/10 [&_[data-icon]]:text-destructive",
          ...toastOptions?.classNames,
        },
      }}
    />
  );
}

export { Toaster };
export { toast } from "sonner";
