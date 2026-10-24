import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  Archive,
  FolderGit2,
  GitBranch,
  MessageSquarePlus,
  Moon,
  PanelLeft,
  Search,
  Settings,
} from "lucide-react";
import { Badge } from "@masmeert/ui/badge";
import { Button } from "@masmeert/ui/button";
import { CommandDialog, type CommandDialogProps, type CommandItem } from "@masmeert/ui/command";
import { Kbd } from "@masmeert/ui/kbd";

const commands: CommandItem[] = [
  {
    id: "new-thread",
    label: "New thread",
    group: "Threads",
    hint: "⌘N",
    icon: MessageSquarePlus,
    onSelect: fn(),
  },
  {
    id: "search-threads",
    label: "Search threads",
    group: "Threads",
    hint: "⌘F",
    icon: Search,
    onSelect: fn(),
  },
  {
    id: "archive-thread",
    label: "Archive current thread",
    group: "Threads",
    hint: "⌘E",
    icon: Archive,
    onSelect: fn(),
  },
  {
    id: "open-masscode",
    label: "masscode",
    group: "Projects",
    keywords: ["desktop", "electron"],
    icon: FolderGit2,
    badge: <Badge size="compact">4 running</Badge>,
    onSelect: fn(),
  },
  {
    id: "open-ui",
    label: "ui",
    group: "Projects",
    keywords: ["kit", "storybook"],
    icon: FolderGit2,
    onSelect: fn(),
  },
  {
    id: "switch-branch",
    label: "Switch branch…",
    group: "Git",
    icon: GitBranch,
    onSelect: fn(),
  },
  {
    id: "toggle-sidebar",
    label: "Toggle sidebar",
    group: "View",
    hint: "⌘B",
    icon: PanelLeft,
    onSelect: fn(),
  },
  {
    id: "toggle-theme",
    label: "Toggle dark mode",
    group: "View",
    keywords: ["theme", "light"],
    icon: Moon,
    onSelect: fn(),
  },
  {
    id: "settings",
    label: "Open settings",
    group: "View",
    hint: "⌘,",
    icon: Settings,
    onSelect: fn(),
  },
];

const meta = {
  title: "Overlays/Command",
  component: CommandDialog,
  args: {
    items: commands,
    shortcut: "k",
    placeholder: "Type a command or search…",
    emptyMessage: "No results found.",
    size: "default",
    onOpenChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    items: { control: false },
    open: { control: false },
  },
} satisfies Meta<typeof CommandDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function CommandPalette({ onOpenChange, ...props }: CommandDialogProps) {
  const [open, setOpen] = useState(false);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <>
      <Button variant="outline" onClick={() => changeOpen(true)}>
        <Search className="size-4" />
        Search or run a command
        <Kbd>⌘{props.shortcut?.toUpperCase()}</Kbd>
      </Button>
      <CommandDialog {...props} open={open} onOpenChange={changeOpen} />
    </>
  );
}

export const Default: Story = {
  render: (args) => <CommandPalette {...args} />,
};

export const WithoutIcons: Story = {
  args: {
    items: commands.map(({ icon: _icon, badge: _badge, ...command }) => command),
    placeholder: "Jump to…",
  },
  render: (args) => <CommandPalette {...args} />,
};

export const Compact: Story = {
  args: { size: "compact" },
  render: (args) => <CommandPalette {...args} />,
};

export const NoResults: Story = {
  args: {
    items: [],
    emptyMessage: "No commands yet. Open a project to see its actions.",
  },
  render: (args) => <CommandPalette {...args} />,
};
