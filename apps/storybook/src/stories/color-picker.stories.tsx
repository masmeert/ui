import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { ColorPicker, ColorPickerPopover } from "@masmeert/ui/color-picker";

const SWATCHES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#0a0a0a",
  "#737373",
  "#ffffff",
];

const meta = {
  title: "Inputs/Color Picker",
  component: ColorPicker,
  args: {
    defaultValue: "#3b82f6",
    swatches: SWATCHES,
    alpha: true,
    onValueChange: fn(),
    onFormatChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    defaultFormat: { control: "inline-radio", options: ["hex", "rgb", "hsl", "oklch"] },
    swatches: { control: false },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Oklch: Story = {
  args: { defaultFormat: "oklch", defaultValue: "oklch(70% 0.15 160)" },
};

export const NoAlpha: Story = { args: { alpha: false, swatches: undefined } };

export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState("#a855f7");
    return (
      <div className="flex items-start gap-6">
        <ColorPicker {...args} value={value} onValueChange={setValue} />
        <div className="flex flex-col gap-2 text-sm">
          <div className="size-24 rounded-xl" style={{ background: value }} />
          <code className="font-mono text-muted-foreground">{value}</code>
        </div>
      </div>
    );
  },
};

/** A swatch trigger that opens the picker in a popover, two surface levels up. */
export const Popover: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <ColorPickerPopover {...args} />
      <ColorPickerPopover {...args} defaultValue="#22c55e" showValue={false} size="compact" />
    </div>
  ),
};
