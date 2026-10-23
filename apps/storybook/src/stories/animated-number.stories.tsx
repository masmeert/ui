import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedNumber, type AnimatedNumberProps } from "@masmeert/ui/animated-number";
import { Button } from "@masmeert/ui/button";
import { useState } from "react";

const meta = {
  title: "Motion/Animated Number",
  component: AnimatedNumber,
  args: {
    value: 12480,
    duration: 1.2,
    startOnView: true,
    className: "text-4xl font-semibold",
  },
  argTypes: {
    value: { control: "number" },
    duration: { control: { type: "range", min: 0.2, max: 4, step: 0.1 } },
    startOnView: { control: "boolean" },
    format: { control: false },
  },
  render: function AnimatedNumberDemo(args: AnimatedNumberProps) {
    const [increment, setIncrement] = useState(0);
    return (
      <div className="flex flex-col items-center gap-4">
        <AnimatedNumber {...args} value={args.value + increment} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIncrement((current) => current + Math.round(args.value * 0.18))}
        >
          Next
        </Button>
      </div>
    );
  },
} satisfies Meta<typeof AnimatedNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CommitCount: Story = {};

export const BuildMinutes: Story = {
  args: {
    value: 3420,
    format: (minutes) => `${Math.round(minutes).toLocaleString()} min`,
  },
};

export const MonthlySpend: Story = {
  args: {
    value: 1289.5,
    duration: 0.6,
    format: (amount) => amount.toLocaleString("en-US", { style: "currency", currency: "USD" }),
  },
};
