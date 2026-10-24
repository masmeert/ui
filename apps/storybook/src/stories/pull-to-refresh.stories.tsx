import type { Meta, StoryObj } from "@storybook/react-vite";
import { PullToRefresh, type PullToRefreshProps } from "@masmeert/ui/pull-to-refresh";
import { IconCircleCheck } from "@tabler/icons-react";
import { useState } from "react";
import { fn } from "storybook/test";

const meta = {
  title: "Motion/Pull To Refresh",
  component: PullToRefresh,
  args: {
    children: null,
    onRefresh: fn(),
    refreshing: false,
    disabled: false,
    threshold: 76,
    maxPull: 132,
    holdDistance: 68,
  },
  argTypes: {
    children: { control: false },
    refreshing: { control: "boolean" },
    disabled: { control: "boolean" },
    threshold: { control: { type: "range", min: 24, max: 160, step: 4 } },
    maxPull: { control: { type: "range", min: 60, max: 240, step: 4 } },
    holdDistance: { control: { type: "range", min: 0, max: 120, step: 4 } },
    pullingLabel: { control: "text" },
    releaseLabel: { control: "text" },
    refreshingLabel: { control: "text" },
  },
  render: function DeploymentFeed(args: PullToRefreshProps) {
    const [deployments, setDeployments] = useState([
      { id: 1287, branch: "main", time: "4m ago" },
      { id: 1286, branch: "feat/billing-v2", time: "22m ago" },
      { id: 1285, branch: "fix/session-timeout", time: "1h ago" },
      { id: 1284, branch: "main", time: "3h ago" },
      { id: 1283, branch: "chore/bump-deps", time: "5h ago" },
    ]);

    async function refresh() {
      await args.onRefresh();
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setDeployments((current) => [
        { id: current[0].id + 1, branch: "main", time: "just now" },
        ...current,
      ]);
    }

    return (
      <PullToRefresh
        {...args}
        onRefresh={refresh}
        className="h-80 w-80 rounded-2xl border border-border"
      >
        <p className="px-4 pt-3 pb-1 text-xs text-muted-foreground">
          Drag down with the mouse to refresh
        </p>
        <ul className="flex flex-col p-2">
          {deployments.map((deployment) => (
            <li key={deployment.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
              <IconCircleCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Deployment #{deployment.id}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {deployment.branch}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{deployment.time}</span>
            </li>
          ))}
        </ul>
      </PullToRefresh>
    );
  },
} satisfies Meta<typeof PullToRefresh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    pullingLabel: "Pull to check for deploys",
    releaseLabel: "Let go to sync",
    refreshingLabel: "Syncing with CI",
  },
};

export const ShortPull: Story = { args: { threshold: 40, maxPull: 80, holdDistance: 40 } };

export const RefreshingExternally: Story = { args: { refreshing: true } };
