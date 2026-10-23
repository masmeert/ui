import type { Meta, StoryObj } from "@storybook/react-vite";
import { SwipeableList, type SwipeAction } from "@masmeert/ui/swipeable-list";
import { Archive, GitMerge, GitPullRequest, Pin, RotateCcw, Trash2 } from "lucide-react";
import { fn } from "storybook/test";

const pinAction: SwipeAction = {
  id: "pin",
  label: "Pin",
  icon: <Pin className="size-4" />,
  tone: "primary",
};
const mergeAction: SwipeAction = {
  id: "merge",
  label: "Merge",
  icon: <GitMerge className="size-4" />,
  tone: "success",
};
const archiveAction: SwipeAction = {
  id: "archive",
  label: "Archive",
  icon: <Archive className="size-4" />,
  tone: "warning",
};
const deleteAction: SwipeAction = {
  id: "delete",
  label: "Delete branch",
  icon: <Trash2 className="size-4" />,
  tone: "danger",
};

const meta = {
  title: "Motion/Swipeable List",
  component: SwipeableList,
  args: {
    items: [
      {
        id: "pr-482",
        leading: <GitPullRequest className="size-5 text-emerald-600 dark:text-emerald-400" />,
        title: "Add usage-based billing tiers",
        description: "#482 · feat/billing-v2 · 12 files",
        meta: "2m",
        leftActions: [pinAction, mergeAction],
        rightActions: [archiveAction, deleteAction],
      },
      {
        id: "pr-479",
        leading: <GitPullRequest className="size-5 text-emerald-600 dark:text-emerald-400" />,
        title: "Fix session timeout on token refresh",
        description: "#479 · fix/session-timeout · 3 files",
        meta: "1h",
        leftActions: [pinAction, mergeAction],
        rightActions: [archiveAction, deleteAction],
      },
      {
        id: "pr-476",
        leading: <GitPullRequest className="size-5 text-muted-foreground" />,
        title: "Split search indexer into workers",
        description: "#476 · refactor/indexer · draft",
        meta: "1d",
        leftActions: [pinAction, { ...mergeAction, disabled: true }],
        rightActions: [archiveAction, deleteAction],
      },
      {
        id: "pr-471",
        leading: <GitPullRequest className="size-5 text-muted-foreground" />,
        title: "Bump TypeScript to 5.9",
        description: "#471 · renovate/typescript · locked",
        meta: "3d",
        disabled: true,
      },
    ],
    actionWidth: 56,
    revealThreshold: 34,
    closeOnAction: true,
    onAction: fn(),
    onValueChange: fn(),
    className: "w-96",
  },
  argTypes: {
    items: { control: false },
    actionWidth: { control: { type: "range", min: 40, max: 96, step: 4 } },
    revealThreshold: { control: { type: "range", min: 8, max: 96, step: 2 } },
    closeOnAction: { control: "boolean" },
    value: { control: false },
    defaultValue: { control: false },
    renderItem: { control: false },
  },
} satisfies Meta<typeof SwipeableList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PullRequests: Story = {};

export const OpenOnLoad: Story = {
  args: { defaultValue: { id: "pr-482", side: "right" } },
};

export const SingleSide: Story = {
  args: {
    items: [
      ["web-app", "a3f9c1e", "Failed after 2m 14s"],
      ["api-gateway", "7d02b4f", "Failed after 48s"],
      ["billing-worker", "e81c5a9", "Timed out after 10m"],
    ].map(([service, commit, reason]) => ({
      id: service,
      title: service,
      description: `${commit} · ${reason}`,
      meta: "failed",
      rightActions: [
        {
          id: "retry",
          label: "Retry deploy",
          icon: <RotateCcw className="size-4" />,
          tone: "primary",
        },
        archiveAction,
      ],
    })),
    classNames: { meta: "text-destructive" },
  },
};

export const WideActions: Story = { args: { actionWidth: 84, revealThreshold: 60 } };
