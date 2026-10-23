import { useState, type ComponentProps, type KeyboardEvent, type PointerEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ResizeHandle } from "@masmeert/ui/resize-handle";

type ResizeHandleProps = ComponentProps<typeof ResizeHandle>;

const KEYBOARD_STEP_PX = 16;

const meta = {
  title: "Display/Resize Handle",
  component: ResizeHandle,
  args: {
    side: "end",
    axis: "x",
    dragging: false,
    label: "Resize sidebar",
    value: 240,
    onPointerDown: fn(),
    onDoubleClick: fn(),
    onKeyDown: fn(),
  },
  argTypes: {
    side: { control: "inline-radio", options: ["start", "end"] },
    axis: { control: "inline-radio", options: ["x", "y"] },
    dragging: { control: "boolean" },
  },
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

function useResizableSize({
  defaultSizePx,
  minSizePx,
  maxSizePx,
  axis,
  side,
}: {
  defaultSizePx: number;
  minSizePx: number;
  maxSizePx: number;
  axis: "x" | "y";
  side: "start" | "end";
}) {
  const [sizePx, setSizePx] = useState(defaultSizePx);
  const [dragging, setDragging] = useState(false);
  // A handle on the start edge grows the panel as the pointer moves backwards.
  const growth = side === "end" ? 1 : -1;

  function clampSize(nextSizePx: number) {
    return Math.min(maxSizePx, Math.max(minSizePx, nextSizePx));
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    event.preventDefault();
    const startPointerPx = axis === "x" ? event.clientX : event.clientY;
    const startSizePx = sizePx;
    setDragging(true);
    function onPointerMove(moveEvent: globalThis.PointerEvent) {
      const pointerPx = axis === "x" ? moveEvent.clientX : moveEvent.clientY;
      setSizePx(clampSize(startSizePx + (pointerPx - startPointerPx) * growth));
    }
    function onPointerUp() {
      setDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const forwardKey = axis === "x" ? "ArrowRight" : "ArrowDown";
    const backwardKey = axis === "x" ? "ArrowLeft" : "ArrowUp";
    if (event.key !== forwardKey && event.key !== backwardKey) return;
    event.preventDefault();
    const direction = event.key === forwardKey ? 1 : -1;
    setSizePx((current) => clampSize(current + direction * growth * KEYBOARD_STEP_PX));
  }

  return {
    sizePx,
    dragging,
    handlers: { onPointerDown, onKeyDown, onDoubleClick: () => setSizePx(defaultSizePx) },
  };
}

function PanelEdge(props: ResizeHandleProps) {
  return (
    <div className="relative flex h-48 w-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
      Hover or focus the {props.side} edge
      <ResizeHandle {...props} />
    </div>
  );
}

function ResizableSidebar() {
  const { sizePx, dragging, handlers } = useResizableSize({
    defaultSizePx: 240,
    minSizePx: 160,
    maxSizePx: 400,
    axis: "x",
    side: "end",
  });
  return (
    <div className="flex h-72 w-[40rem] overflow-hidden rounded-lg border">
      <aside className="relative shrink-0 border-r bg-card p-3 text-sm" style={{ width: sizePx }}>
        <div className="mb-2 text-xs font-medium text-muted-foreground">Threads</div>
        <div className="truncate py-1">Stream thread output</div>
        <div className="truncate py-1">Fix flaky keep-awake test</div>
        <div className="truncate py-1">Migrate settings to SQLite</div>
        <ResizeHandle
          side="end"
          dragging={dragging}
          label="Resize thread list"
          value={sizePx}
          {...handlers}
        />
      </aside>
      <main className="flex flex-1 items-center justify-center font-mono text-xs text-muted-foreground">
        sidebar {sizePx}px · drag, arrow keys, double-click to reset
      </main>
    </div>
  );
}

function ResizableTerminal() {
  const { sizePx, dragging, handlers } = useResizableSize({
    defaultSizePx: 120,
    minSizePx: 64,
    maxSizePx: 240,
    axis: "y",
    side: "start",
  });
  return (
    <div className="flex h-80 w-[40rem] flex-col overflow-hidden rounded-lg border">
      <main className="flex flex-1 items-center justify-center font-mono text-xs text-muted-foreground">
        terminal {sizePx}px · drag, arrow keys, double-click to reset
      </main>
      <section
        className="relative shrink-0 border-t bg-card p-3 font-mono text-xs"
        style={{ height: sizePx }}
      >
        <div className="text-muted-foreground">$ pnpm build</div>
        <div>✓ built in 1.2s</div>
        <ResizeHandle
          side="start"
          axis="y"
          dragging={dragging}
          label="Resize terminal"
          value={sizePx}
          {...handlers}
        />
      </section>
    </div>
  );
}

export const Default: Story = { render: PanelEdge };
export const Dragging: Story = { args: { dragging: true }, render: PanelEdge };
export const Sidebar: Story = { render: ResizableSidebar };
export const Terminal: Story = { render: ResizableTerminal };
