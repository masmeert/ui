import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Slider } from "@masmeert/ui/slider";

const meta = {
  title: "Inputs/Slider",
  component: Slider,
  args: {
    "aria-label": "Instances",
    defaultValue: 4,
    min: 1,
    max: 10,
    step: 1,
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    variant: { control: false },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  decorators: [
    function FixedWidth(Story) {
      return (
        <div className="w-80">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Slider>;

export default meta;
// `typeof meta` narrows the variant union's args to `never`, so stories type against the component.
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { variant: "default", showTicks: true },
};

export const Bubble: Story = {
  args: {
    variant: "bubble",
    "aria-label": "CPU limit",
    defaultValue: 60,
    min: 0,
    max: 100,
    step: 5,
    format: (value: number) => `${value}%`,
  },
};

export const Fluid: Story = {
  args: {
    variant: "fluid",
    "aria-label": "Canary traffic",
    label: "Canary traffic",
    defaultValue: 10,
    min: 0,
    max: 100,
    step: 5,
  },
};

export const Inline: Story = {
  args: {
    variant: "inline",
    "aria-label": "Temperature",
    label: "Temperature",
    defaultValue: 0.7,
    min: 0,
    max: 2,
    step: 0.1,
    format: (value: number) => value.toFixed(1),
  },
};

export const Ruler: Story = {
  args: {
    variant: "ruler",
    "aria-label": "Memory",
    defaultValue: 16,
    min: 1,
    max: 64,
    step: 1,
    unit: "GB",
    majorEvery: 8,
  },
};

export const Wave: Story = {
  args: {
    variant: "wave",
    "aria-label": "Build concurrency",
    defaultValue: 8,
    min: 1,
    max: 16,
    bars: 32,
  },
};
