import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionSwapButton } from "@masmeert/ui/action-swap";
import {
  IconCheck,
  IconCopy,
  IconGitMerge,
  IconLoader,
  IconPlayerPause,
  IconPlayerPlay,
  IconRocket,
} from "@tabler/icons-react";
import { fn } from "storybook/test";

const meta = {
  title: "Motion/Action Swap",
  component: ActionSwapButton,
  args: {
    items: [
      { id: "copy", label: "Copy commit SHA", icon: <IconCopy /> },
      { id: "copied", label: "Copied", icon: <IconCheck /> },
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
      { id: "deploy", label: "Deploy to production", icon: <IconRocket /> },
      { id: "deploying", label: "Deploying", icon: <IconLoader /> },
      { id: "live", label: "Live on main", icon: <IconCheck /> },
    ],
  },
};

export const Cascade: Story = {
  args: {
    animation: "cascade",
    variant: "outline",
    items: [
      { id: "merge", label: "Merge pull request", icon: <IconGitMerge /> },
      { id: "merged", label: "Merged into main", icon: <IconCheck /> },
    ],
  },
};

export const IconOnly: Story = {
  args: {
    animation: "roll",
    size: "icon",
    items: [
      { id: "paused", label: "Resume build", icon: <IconPlayerPlay /> },
      { id: "running", label: "Pause build", icon: <IconPlayerPause /> },
    ],
  },
};

export const Compact: Story = { args: { size: "compact" } };
