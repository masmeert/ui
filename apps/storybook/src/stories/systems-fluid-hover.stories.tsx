import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { FluidHoverHighlight } from "@masmeert/ui/fluid-hover-highlight";
import {
  type FluidHoverAxis,
  useFluidHover,
  useRegisterFluidHoverItem,
  type FluidHover,
} from "@masmeert/ui/hooks/use-fluid-hover";

function Row({
  index,
  label,
  registerItem,
  onPick,
  className,
}: {
  index: number;
  label: string;
  registerItem: FluidHover["registerItem"];
  onPick: (label: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useRegisterFluidHoverItem(registerItem, index, ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onPick(label)}
      className={`relative z-10 rounded-lg px-3 py-2 text-left text-sm ${className ?? ""}`}
    >
      {label}
    </button>
  );
}

function Demo({ axis, items, gap }: { axis: FluidHoverAxis; items: string[]; gap: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hover = useFluidHover(containerRef, { axis });
  const [picked, setPicked] = useState<string | null>(null);
  const layout =
    axis === "y" ? "flex flex-col" : axis === "x" ? "flex flex-row" : "grid grid-cols-3";
  return (
    <div className="flex w-96 flex-col gap-3">
      <div ref={containerRef} className={`relative p-2 ${layout} ${gap}`} {...hover.handlers}>
        <FluidHoverHighlight hover={hover} />
        {items.map((label, index) => (
          <Row
            key={label}
            index={index}
            label={label}
            registerItem={hover.registerItem}
            onPick={setPicked}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {picked ? `Clicked: ${picked}` : "Hover anywhere, gaps included, then click."}
      </p>
    </div>
  );
}

const meta = {
  title: "Systems/Fluid Hover",
  component: Demo,
  args: {
    axis: "y",
    gap: "gap-3",
    items: ["Overview", "Deployments", "Pull requests", "Logs", "Settings"],
  },
  argTypes: {
    axis: { control: "inline-radio", options: ["y", "x", "xy"] },
    gap: { control: "inline-radio", options: ["gap-0", "gap-3", "gap-6"] },
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wide gaps on purpose: the highlight never blinks between rows, and a click in a gap hits the lit row. */
export const List: Story = {};

export const Strip: Story = { args: { axis: "x", items: ["Day", "Week", "Month", "Year"] } };

export const Grid: Story = {
  args: {
    axis: "xy",
    items: ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet", "Black", "White"],
  },
};
