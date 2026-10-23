import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Check, CircleAlert, Info, LoaderCircle, TriangleAlert } from "lucide-react";

function Toaster({ toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      closeButton
      icons={{
        success: <Check className="size-3.5" />,
        info: <Info className="size-3.5" />,
        warning: <TriangleAlert className="size-3.5" />,
        error: <CircleAlert className="size-3.5" />,
        loading: <LoaderCircle className="size-3.5 animate-spin" />,
      }}
      {...props}
      toastOptions={{
        ...toastOptions,
        // Unstyled keeps sonner's stacking, swiping and timing but drops its look for the kit's own.
        unstyled: true,
        classNames: {
          toast:
            "pointer-events-auto grid w-(--width) grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[28px] border border-border bg-popover/95 p-3 shadow-panel backdrop-blur-xl has-data-description:items-start",
          icon: "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground",
          content: "min-w-0",
          title: "truncate text-sm leading-5 font-medium text-foreground",
          description: "mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground",
          actionButton:
            "col-start-2 mt-2 inline-flex h-7 w-fit items-center rounded-lg bg-muted/80 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted",
          cancelButton:
            "col-start-2 mt-2 inline-flex h-7 w-fit items-center rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground",
          closeButton:
            "col-start-3 row-start-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground [&_svg]:size-3.5",
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
