import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  IconBell,
  IconFolderCode,
  IconMessage,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import {
  ExpandableActionBar,
  type ExpandableActionBarProps,
} from "@masmeert/ui/expandable-action-bar";

const meta = {
  title: "Navigation/Expandable Action Bar",
  component: ExpandableActionBar,
  args: {
    items: [
      {
        id: "threads",
        label: "Threads",
        icon: <IconMessage className="size-full" />,
        shortcut: "⌘1",
      },
      {
        id: "projects",
        label: "Projects",
        icon: <IconFolderCode className="size-full" />,
        shortcut: "⌘2",
      },
      { id: "search", label: "Search", icon: <IconSearch className="size-full" />, shortcut: "⌘K" },
      { id: "inbox", label: "Inbox", icon: <IconBell className="size-full" />, badge: 3 },
      { id: "settings", label: "Settings", icon: <IconSettings className="size-full" /> },
    ],
    size: "default",
    defaultExpanded: false,
    expandOnHover: true,
    expandOnFocus: true,
    collapseDelay: 90,
    onAction: fn(),
    onExpandedChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    collapseDelay: { control: { type: "number", min: 0, step: 10 } },
    items: { control: false },
    expanded: { control: false },
    activeId: { control: false },
  },
  render: (args) => <NavigationActionBar {...args} />,
} satisfies Meta<typeof ExpandableActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function NavigationActionBar({ onAction, ...props }: ExpandableActionBarProps) {
  const [activeId, setActiveId] = useState("threads");

  return (
    <ExpandableActionBar
      {...props}
      activeId={activeId}
      onAction={(item) => {
        setActiveId(item.id);
        onAction?.(item);
      }}
    />
  );
}

export const Default: Story = {};

export const Compact: Story = { args: { size: "compact" } };

export const Large: Story = { args: { size: "large" } };

export const Expanded: Story = { args: { defaultExpanded: true } };

export const IconsOnly: Story = { args: { expandOnHover: false, expandOnFocus: false } };
