import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { cn } from "cn";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { type FluidHover, useFluidHover } from "@/hooks/use-fluid-hover";
import { type Size, type SizeTokens, useSize } from "@/lib/size";

interface TableContextValue {
  size: SizeTokens;
  interactive: boolean;
  hover: FluidHover;
  trackRow: (row: HTMLTableRowElement, clickable: boolean) => void;
  untrackRow: (row: HTMLTableRowElement) => void;
  /** -1 when the row isn't a registered clickable row. */
  indexOfRow: (row: HTMLTableRowElement) => number;
}

const TableContext = createContext<TableContextValue | null>(null);

function useTable() {
  return use(TableContext);
}

// Literal classes so Tailwind's scanner sees them.
const CELL_PAD: Record<Size, string> = {
  compact: "px-2 py-2",
  default: "px-2.5 py-2",
  large: "px-3 py-2.5",
};

export interface TableProps extends ComponentProps<"table"> {
  size?: Size;
  /**
   * Body rows with `onClick` share a fluid hover highlight and become focusable (Enter/Space click).
   * Use only when every body row is clickable.
   */
  interactive?: boolean;
  containerClassName?: string;
}

export function Table({
  size: sizeProp,
  interactive = false,
  className,
  containerClassName,
  ...props
}: TableProps) {
  const size = useSize(sizeProp);
  const containerRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(containerRef, { axis: "y", gapClick: false });
  const { registerItem } = hover;

  // Rows can't know their index (mount order, sorting), so they report in and the table
  // numbers clickable ones in DOM order once per microtask.
  const rows = useRef(new Map<HTMLTableRowElement, boolean>());
  const registered = useRef<HTMLTableRowElement[]>([]);
  const pending = useRef(false);
  const sync = useCallback(() => {
    if (pending.current) return;
    pending.current = true;
    queueMicrotask(() => {
      pending.current = false;
      const next = [...rows.current]
        .filter(([row, clickable]) => clickable && row.isConnected)
        .map(([row]) => row)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      const previous = registered.current;
      for (let index = 0; index < Math.max(next.length, previous.length); index++) {
        if (next[index] !== previous[index]) registerItem(index, next[index] ?? null);
      }
      registered.current = next;
    });
  }, [registerItem]);

  const context = useMemo<TableContextValue>(
    () => ({
      size,
      interactive,
      hover,
      trackRow(row, clickable) {
        rows.current.set(row, clickable);
        sync();
      },
      untrackRow(row) {
        rows.current.delete(row);
        sync();
      },
      indexOfRow: (row) => registered.current.indexOf(row),
    }),
    [size, interactive, hover, sync],
  );

  return (
    <TableContext value={context}>
      <div
        ref={containerRef}
        data-slot="table-container"
        className={cn("relative w-full overflow-x-auto", containerClassName)}
      >
        {interactive ? <FluidHoverHighlight hover={hover} className="rounded-lg" /> : null}
        <table
          data-slot="table"
          className={cn("relative w-full caption-bottom border-collapse", size.text, className)}
          {...props}
        />
      </div>
    </TableContext>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-border", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: ComponentProps<"tbody">) {
  const table = useTable();
  // Listens here, not on the wrapper, so the header never lights a body row.
  const handlers = table?.interactive ? table.hover.handlers : null;
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
      onPointerEnter={(event) => {
        handlers?.onPointerEnter(event);
        onPointerEnter?.(event);
      }}
      onPointerMove={(event) => {
        handlers?.onPointerMove(event);
        onPointerMove?.(event);
      }}
      onPointerLeave={(event) => {
        handlers?.onPointerLeave(event);
        onPointerLeave?.(event);
      }}
    />
  );
}

export function TableRow({
  className,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  tabIndex,
  ref: refProp,
  ...props
}: ComponentProps<"tr">) {
  const table = useTable();
  const ref = useRef<HTMLTableRowElement>(null);
  const clickable = Boolean(table?.interactive && onClick);
  const trackRow = table?.trackRow;
  const untrackRow = table?.untrackRow;

  // No deps on purpose: a re-render may mean the row moved; sync is batched and idempotent.
  useLayoutEffect(() => {
    const row = ref.current;
    if (!row || !trackRow || row.parentElement?.tagName !== "TBODY") return;
    trackRow(row, clickable);
  });
  useLayoutEffect(() => {
    const row = ref.current;
    return () => {
      if (row) untrackRow?.(row);
    };
  }, [untrackRow]);

  const setActiveIndex = table?.hover.setActiveIndex;

  return (
    <tr
      ref={(element) => {
        ref.current = element;
        if (typeof refProp === "function") refProp(element);
        else if (refProp) refProp.current = element;
      }}
      data-slot="table-row"
      data-clickable={clickable ? "" : undefined}
      tabIndex={clickable ? (tabIndex ?? 0) : tabIndex}
      onClick={onClick}
      onKeyDown={(event: KeyboardEvent<HTMLTableRowElement>) => {
        onKeyDown?.(event);
        if (!clickable || event.defaultPrevented || event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (
          clickable &&
          event.target === event.currentTarget &&
          event.target.matches(":focus-visible")
        ) {
          const index = table?.indexOfRow(event.currentTarget) ?? -1;
          setActiveIndex?.(index >= 0 ? index : null);
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (clickable && event.target === event.currentTarget) setActiveIndex?.(null);
      }}
      className={cn(
        "relative border-b border-border outline-none",
        !table?.interactive && "[tbody_&]:hover:bg-hover",
        clickable &&
          "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        "data-[state=selected]:bg-selected",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  const table = useTable();
  const step = table?.size.size ?? "default";
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-left align-middle font-semibold whitespace-nowrap text-muted-foreground rtl:text-right",
        "[&:has([role=checkbox])]:w-px",
        CELL_PAD[step],
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  const table = useTable();
  const step = table?.size.size ?? "default";
  return (
    <td
      data-slot="table-cell"
      className={cn("align-middle text-foreground", CELL_PAD[step], className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  const table = useTable();
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-3 text-left text-muted-foreground rtl:text-right",
        table?.size.type.caption,
        className,
      )}
      {...props}
    />
  );
}
