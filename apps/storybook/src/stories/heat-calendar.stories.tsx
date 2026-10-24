import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { HeatCalendar, type HeatCalendarSelection } from "@masmeert/ui/heat-calendar";
import { typeClass } from "@masmeert/ui/lib/type-scale";

type HeatCalendarProps = ComponentProps<typeof HeatCalendar>;

function activityLevels(weekCount: number) {
  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      // A fixed multiplicative hash stands in for randomness so every render matches.
      const noise = (((week * 7 + day) * 761 + 113) % 1000) / 1000;
      if (noise < 0.1) return 0;
      const weekend = day >= 5;
      return weekend ? noise * 0.35 : 0.2 + noise * 0.8;
    }),
  );
}

function describeSelection(selection: HeatCalendarSelection | null) {
  if (!selection) return "Click a day, then another, to total a span.";
  const start = `week ${selection.start.w + 1}, day ${selection.start.d + 1}`;
  if (!selection.end) return `Anchored at ${start}. Click another day to close the span.`;
  return `Span from ${start} to week ${selection.end.w + 1}, day ${selection.end.d + 1}.`;
}

const meta = {
  title: "Data/Heat Calendar",
  component: HeatCalendar,
  args: {
    unit: "commits",
    weeks: 16,
    maxCount: 14,
    values: activityLevels(53),
    endDate: new Date(Date.UTC(2026, 9, 23)),
  },
  argTypes: {
    weeks: { control: { type: "range", min: 4, max: 53, step: 1 } },
    maxCount: { control: { type: "number", min: 1 } },
    color: { control: "color" },
    values: { control: false },
    endDate: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof HeatCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

function SelectionReadout(props: HeatCalendarProps) {
  const [selection, setSelection] = useState<HeatCalendarSelection | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <HeatCalendar {...props} selection={selection} onSelectionChange={setSelection} />
      <div
        className={`flex items-center justify-between gap-3 text-muted-foreground ${typeClass("body")}`}
      >
        <span>{describeSelection(selection)}</span>
        <Button
          size="compact"
          variant="ghost"
          disabled={!selection}
          onClick={() => setSelection(null)}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

export const Commits: Story = {};

export const FullYear: Story = {
  args: { weeks: 53, unit: "deploys", maxCount: 6, color: "var(--chart-2)" },
};

export const SelectedSpan: Story = {
  args: { defaultSelection: { start: { w: 10, d: 0 }, end: { w: 11, d: 4 } } },
};

export const Controlled: Story = { render: SelectionReadout };
