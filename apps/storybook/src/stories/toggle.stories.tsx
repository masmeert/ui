import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconBell, IconPin } from "@tabler/icons-react";
import { fn } from "storybook/test";
import { Toggle } from "@masmeert/ui/toggle";

const meta = {
  title: "Inputs/Toggle",
  component: Toggle,
  args: {
    "aria-label": "Pin deployment",
    children: <IconPin />,
    variant: "default",
    size: "default",
    defaultPressed: false,
    disabled: false,
    onPressedChange: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outline"] },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    disabled: { control: "boolean" },
    children: { control: false },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const Pressed: Story = { args: { defaultPressed: true } };

export const WithText: Story = {
  args: {
    "aria-label": undefined,
    variant: "outline",
    children: (
      <>
        <IconBell />
        Notify on failure
      </>
    ),
  },
};

export const Compact: Story = { args: { size: "compact", variant: "outline" } };

export const Disabled: Story = { args: { disabled: true, variant: "outline" } };
