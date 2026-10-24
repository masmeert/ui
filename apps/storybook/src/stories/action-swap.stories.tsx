import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionSwapButton } from "@masmeert/ui/action-swap";
import { Check, Copy, GitMerge, Loader, Pause, Play, Rocket } from "lucide-react";
import { fn } from "storybook/test";

const meta = {
  title: "Motion/Action Swap",
  component: ActionSwapButton,
  args: {
    items: [
      { id: "copy", label: "Copy commit SHA", icon: <Copy /> },
      { id: "copied", label: "Copied", icon: <Check /> },
    ],
    variant: "secondary",
    size: "default",
    animation: "blur",
    cycle: true,
    onValueChange: fn(),
  },
  argTypes: {
    items: { control: false },
    animation: { control: "inline-radio", options: ["blur", "roll", "cascade"] },
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["compact", "default", "large", "icon"] },
    iconOnly: { control: "boolean" },
    cycle: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ActionSwapButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blur: Story = {};

export const Roll: Story = {
  args: {
    animation: "roll",
    variant: "primary",
    items: [
      { id: "deploy", label: "Deploy to production", icon: <Rocket /> },
      { id: "deploying", label: "Deploying", icon: <Loader /> },
      { id: "live", label: "Live on main", icon: <Check /> },
    ],
  },
};

export const Cascade: Story = {
  args: {
    animation: "cascade",
    variant: "outline",
    items: [
      { id: "merge", label: "Merge pull request", icon: <GitMerge /> },
      { id: "merged", label: "Merged into main", icon: <Check /> },
    ],
  },
};

export const IconOnly: Story = {
  args: {
    animation: "roll",
    size: "icon",
    items: [
      { id: "paused", label: "Resume build", icon: <Play /> },
      { id: "running", label: "Pause build", icon: <Pause /> },
    ],
  },
};

export const Compact: Story = { args: { size: "compact" } };
