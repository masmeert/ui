import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkles, X } from "lucide-react";
import { fn } from "storybook/test";
import { ExpandableButton, ExpandableChip } from "@masmeert/ui/expandable-control";

const meta = {
  title: "Inputs/Expandable Control",
  component: ExpandableButton,
  args: {
    icon: <Sparkles className="size-4" />,
    label: "Explain this build failure",
    defaultExpanded: false,
    disabled: false,
    size: "default",
    onExpandedChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    label: { control: "text" },
    disabled: { control: "boolean" },
    icon: { control: false },
  },
} satisfies Meta<typeof ExpandableButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = { args: { defaultExpanded: true } };

export const Compact: Story = { args: { size: "compact", defaultExpanded: true } };

export const Disabled: Story = { args: { disabled: true } };

export const Chip: Story = {
  render: (args) => (
    <ExpandableChip
      label="env: production"
      actionIcon={<X className="size-4" />}
      actionLabel="Remove production filter"
      disabled={args.disabled}
      size={args.size}
      onExpandedChange={args.onExpandedChange}
      onAction={fn()}
    />
  ),
};
