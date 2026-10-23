import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DirectionProvider, useDirection } from "@masmeert/ui/direction";
import { Progress, ProgressLabel, ProgressValue } from "@masmeert/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@masmeert/ui/toggle-group";

type DirectionProviderProps = ComponentProps<typeof DirectionProvider>;

const meta = {
  title: "Display/Direction",
  component: DirectionProvider,
  args: { direction: "rtl" },
  argTypes: {
    direction: { control: "inline-radio", options: ["ltr", "rtl"] },
  },
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function DirectionReadout() {
  return (
    <span className="font-mono text-xs text-muted-foreground">
      useDirection() → {useDirection()}
    </span>
  );
}

function ThreadFilters(props: DirectionProviderProps) {
  return (
    <DirectionProvider {...props}>
      <div dir={props.direction} className="flex w-96 flex-col gap-4">
        <ToggleGroup defaultValue={["open"]} aria-label="Filter threads">
          <ToggleGroupItem value="open">Open</ToggleGroupItem>
          <ToggleGroupItem value="review">In review</ToggleGroupItem>
          <ToggleGroupItem value="merged">Merged</ToggleGroupItem>
        </ToggleGroup>
        <Progress value={62}>
          <ProgressLabel>Indexing repository</ProgressLabel>
          <ProgressValue />
        </Progress>
        <p className="text-sm text-muted-foreground">
          Focus a filter and press the arrow keys: navigation follows the reading direction.
        </p>
        <DirectionReadout />
      </div>
    </DirectionProvider>
  );
}

export const RightToLeft: Story = { render: ThreadFilters };
export const LeftToRight: Story = { args: { direction: "ltr" }, render: ThreadFilters };
