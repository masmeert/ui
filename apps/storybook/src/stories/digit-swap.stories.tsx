import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { DigitSwap, type DigitSwapProps } from "@masmeert/ui/digit-swap";
import { useState } from "react";

function DigitSwapCycle({ readings, ...args }: DigitSwapProps & { readings: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <DigitSwap {...args} value={readings[index % readings.length]} />
      <Button variant="outline" size="sm" onClick={() => setIndex((current) => current + 1)}>
        Next
      </Button>
    </div>
  );
}

const meta = {
  title: "Motion/Digit Swap",
  component: DigitSwap,
  args: {
    value: "1,284",
    direction: "up",
    duration: 0.18,
    stagger: 0.006,
    suffixLength: 0,
    className: "font-mono text-4xl font-semibold",
  },
  argTypes: {
    value: { control: false },
    direction: { control: "inline-radio", options: ["up", "down"] },
    duration: { control: { type: "range", min: 0.05, max: 1, step: 0.01 } },
    stagger: { control: { type: "range", min: 0, max: 0.1, step: 0.002 } },
    suffixLength: { control: { type: "number", min: 0, max: 6 } },
    animationKey: { control: false },
  },
} satisfies Meta<typeof DigitSwap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CountingUp: Story = {
  render: (args) => <DigitSwapCycle {...args} readings={["1,284", "1,291", "1,307", "1,342"]} />,
};

export const CountingDown: Story = {
  args: { direction: "down", stagger: 0.03 },
  render: (args) => <DigitSwapCycle {...args} readings={["09:58", "09:57", "09:56", "09:55"]} />,
};

export const MaskedToken: Story = {
  args: { stagger: 0.02, duration: 0.24 },
  render: (args) => (
    <DigitSwapCycle {...args} readings={["•••• •••• 4f2a", "ghp_ 7Kq2 4f2a", "•••• •••• 4f2a"]} />
  ),
};

export const LatencyWithUnit: Story = {
  args: { suffixLength: 2, suffixClassName: "text-muted-foreground" },
  render: (args) => <DigitSwapCycle {...args} readings={["128ms", "094ms", "211ms", "087ms"]} />,
};
