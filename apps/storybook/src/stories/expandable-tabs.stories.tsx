import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Bell, GitBranch, Search, Settings } from "lucide-react";
import {
  ExpandableTabs,
  type ExpandableTabsItem,
  type ExpandableTabsProps,
} from "@masmeert/ui/expandable-tabs";

const toolbarTabs: ExpandableTabsItem[] = [
  {
    id: "search",
    label: "Search",
    icon: <Search className="size-4" />,
    content: (
      <div className="flex w-72 flex-col gap-2 p-4 text-sm">
        <p className="font-medium text-foreground">Recent searches</p>
        <p className="text-muted-foreground">auth retry</p>
        <p className="text-muted-foreground">keep-awake countdown</p>
      </div>
    ),
  },
  {
    id: "branches",
    label: "Branches",
    icon: <GitBranch className="size-4" />,
    content: (
      <div className="flex w-72 flex-col gap-2 p-4 text-sm">
        <p className="font-medium text-foreground">fix/auth-retry</p>
        <p className="text-muted-foreground">3 commits ahead of main · checks passing</p>
      </div>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="size-4" />,
    content: (
      <div className="flex w-80 flex-col gap-2 p-4 text-sm">
        <p className="font-medium text-foreground">Claude is waiting for an answer</p>
        <p className="text-muted-foreground">Fix flaky auth test · 2 minutes ago</p>
      </div>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="size-4" />,
    content: (
      <div className="flex w-64 flex-col gap-2 p-4 text-sm">
        <p className="font-medium text-foreground">Default agent</p>
        <p className="text-muted-foreground">Claude · Opus</p>
      </div>
    ),
  },
];

const meta = {
  title: "Navigation/Expandable Tabs",
  component: ExpandableTabs,
  args: { items: toolbarTabs, defaultValue: null, onValueChange: fn() },
  argTypes: {
    items: { control: false },
    value: { control: false },
    defaultValue: {
      control: "select",
      options: [null, ...toolbarTabs.map((tab) => tab.id)],
    },
  },
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex min-h-96 items-end justify-center">
      <ExpandableTabs {...args} />
    </div>
  ),
} satisfies Meta<typeof ExpandableTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledToolbarTabs({ onValueChange, ...props }: ExpandableTabsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="flex min-h-96 flex-col items-center justify-end gap-4">
      <ExpandableTabs
        {...props}
        value={activeId}
        onValueChange={(nextId) => {
          setActiveId(nextId);
          onValueChange?.(nextId);
        }}
      />
      <p className="text-sm text-muted-foreground">
        {activeId ? `Open: ${activeId}` : "Closed. Press a tab, then Esc to close it."}
      </p>
    </div>
  );
}

export const Closed: Story = {};

export const Open: Story = {
  args: { defaultValue: "notifications" },
};

export const Controlled: Story = {
  render: (args) => <ControlledToolbarTabs {...args} />,
};
