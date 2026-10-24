import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { CheckboxGroup, type CheckboxGroupProps } from "@masmeert/ui/checkbox-group";

const NOTIFICATIONS = [
  {
    value: "deploys",
    label: "Deployments",
    description: "Every production deploy and its status.",
  },
  { value: "comments", label: "Comments", description: "Replies and mentions on previews." },
  { value: "usage", label: "Usage alerts", description: "When a project nears its plan limit." },
  { value: "security", label: "Security", description: "New sign-ins and token changes." },
  { value: "billing", label: "Billing", description: "Invoices and failed payments." },
  { value: "digest", label: "Weekly digest", disabled: true, description: "Coming soon." },
];

const meta = {
  title: "Inputs/Checkbox Group",
  component: CheckboxGroup,
  args: {
    options: NOTIFICATIONS,
    defaultValue: ["deploys", "comments", "billing"],
    onValueChange: fn(),
    "aria-label": "Email notifications",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    options: { control: false },
  },
  render: (args: CheckboxGroupProps) => (
    <div className="w-80">
      <CheckboxGroup {...args} />
    </div>
  ),
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Labels only: the merged blocks read most clearly on short rows. */
export const Simple: Story = {
  args: {
    options: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      value: day,
      label: day,
    })),
    defaultValue: ["Mon", "Tue", "Thu"],
    "aria-label": "Working days",
  },
  render: (args) => (
    <div className="w-48">
      <CheckboxGroup {...args} />
    </div>
  ),
};

export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState<string[]>(["deploys", "usage"]);
    return (
      <div className="flex w-80 flex-col gap-3">
        <CheckboxGroup {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">{value.join(", ") || "Nothing selected"}</p>
      </div>
    );
  },
};

export const Compact: Story = { args: { size: "compact" } };
