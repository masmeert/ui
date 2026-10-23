import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { NumberTicker, type NumberTickerProps } from "@masmeert/ui/number-ticker";
import { useState } from "react";

const meta = {
  title: "Motion/Number Ticker",
  component: NumberTicker,
  args: {
    value: 4821,
    duration: 0.9,
    stagger: 0.04,
    startOnView: true,
    blur: false,
    locale: true,
    className: "text-4xl font-semibold",
  },
  argTypes: {
    value: { control: "number" },
    pad: { control: { type: "number", min: 0, max: 10 } },
    duration: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
    stagger: { control: { type: "range", min: 0, max: 0.3, step: 0.01 } },
    startOnView: { control: "boolean" },
    blur: { control: "boolean" },
    locale: { control: "boolean" },
    prefix: { control: "text" },
    suffix: { control: "text" },
    format: { control: false },
  },
  render: function NumberTickerDemo(args: NumberTickerProps) {
    const [increment, setIncrement] = useState(0);
    return (
      <div className="flex flex-col items-center gap-4">
        <NumberTicker {...args} value={args.value + increment} />
        <Button variant="outline" size="sm" onClick={() => setIncrement((current) => current + 37)}>
          Next
        </Button>
      </div>
    );
  },
} satisfies Meta<typeof NumberTicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CommitCount: Story = {};

export const Blurred: Story = { args: { blur: true, duration: 1.4 } };

export const BuildNumber: Story = {
  args: { value: 42, pad: 5, locale: false, prefix: "#" },
};

export const ResponseTime: Story = {
  args: { value: 218, locale: false, suffix: " ms", stagger: 0.08 },
};
