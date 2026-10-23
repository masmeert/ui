import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { HoldActionButton } from "@masmeert/ui/hold-action-button";

const meta = {
  title: "Inputs/Hold Action Button",
  component: HoldActionButton,
  args: {
    children: "Hold to delete project",
    holdingLabel: "Keep holding…",
    completeLabel: "Project deleted",
    holdDuration: 1600,
    type: "vertical",
    disabled: false,
    onHoldComplete: fn(),
  },
  argTypes: {
    type: { control: "inline-radio", options: ["vertical", "horizontal"] },
    holdDuration: { control: { type: "range", min: 400, max: 4000, step: 100 } },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof HoldActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: {
    type: "horizontal",
    children: "Hold to rotate API keys",
    completeLabel: "Keys rotated",
  },
};

export const LongHold: Story = {
  args: {
    holdDuration: 3200,
    children: "Hold to wipe staging database",
    completeLabel: "Database wiped",
  },
};

export const Disabled: Story = { args: { disabled: true } };
