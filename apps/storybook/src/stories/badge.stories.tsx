import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, type BadgeStatus } from "@masmeert/ui/badge";
import { Button } from "@masmeert/ui/button";

const meta = {
  title: "Display/Badge",
  component: Badge,
  args: { status: "success", size: "md", children: "Deployed", showIcon: true },
  argTypes: {
    status: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger", "loading"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    showIcon: { control: "boolean" },
    pulse: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const deployStatuses: { status: BadgeStatus; label: string }[] = [
  { status: "neutral", label: "Queued" },
  { status: "loading", label: "Building" },
  { status: "info", label: "Preview ready" },
  { status: "success", label: "Deployed" },
  { status: "warning", label: "Slow checks" },
  { status: "danger", label: "Failed" },
];

function AllStatuses() {
  return (
    <div className="flex flex-wrap gap-2">
      {deployStatuses.map(({ status, label }) => (
        <Badge key={status} status={status}>
          {label}
        </Badge>
      ))}
    </div>
  );
}

function DeployLifecycle() {
  const [stepIndex, setStepIndex] = useState(0);
  const { status, label } = deployStatuses[stepIndex];
  return (
    <div className="flex items-center gap-4">
      <Badge status={status}>{label}</Badge>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setStepIndex((index) => (index + 1) % deployStatuses.length)}
      >
        Next status
      </Button>
    </div>
  );
}

export const Default: Story = {};
export const Small: Story = { args: { size: "sm", status: "loading", children: "Building" } };
export const WithoutIcon: Story = {
  args: { status: "neutral", showIcon: false, children: "v0.1.11" },
};
export const Statuses: Story = { render: AllStatuses };
export const Lifecycle: Story = { render: DeployLifecycle };
