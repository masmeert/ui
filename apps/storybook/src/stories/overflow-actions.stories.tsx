import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Archive, Copy, GitPullRequest, Pencil, Play, Share2, Trash2 } from "lucide-react";
import { OverflowActions } from "@masmeert/ui/overflow-actions";

const meta = {
  title: "Navigation/Overflow Actions",
  component: OverflowActions,
  args: {
    primaryActions: [
      { id: "run", label: "Run", icon: <Play className="size-full" /> },
      { id: "open-pr", label: "Open PR", icon: <GitPullRequest className="size-full" /> },
    ],
    overflowActions: [
      { id: "rename", label: "Rename", icon: <Pencil className="size-full" /> },
      { id: "copy-link", label: "Copy link", icon: <Copy className="size-full" /> },
      { id: "share", label: "Share", icon: <Share2 className="size-full" /> },
      { id: "archive", label: "Archive", icon: <Archive className="size-full" /> },
    ],
    size: "default",
    defaultExpanded: false,
    collapseOnAction: false,
    openLabel: "Show extra actions",
    closeLabel: "Hide extra actions",
    onAction: fn(),
    onExpandedChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    primaryActions: { control: false },
    overflowActions: { control: false },
    expanded: { control: false },
  },
} satisfies Meta<typeof OverflowActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = { args: { size: "compact" } };

export const Large: Story = { args: { size: "large" } };

export const Expanded: Story = { args: { defaultExpanded: true } };

export const CollapseOnAction: Story = { args: { collapseOnAction: true } };

export const WithDisabledAction: Story = {
  args: {
    overflowActions: [
      { id: "rename", label: "Rename", icon: <Pencil className="size-full" /> },
      { id: "archive", label: "Archive", icon: <Archive className="size-full" /> },
      { id: "delete", label: "Delete", icon: <Trash2 className="size-full" />, disabled: true },
    ],
    defaultExpanded: true,
  },
};
