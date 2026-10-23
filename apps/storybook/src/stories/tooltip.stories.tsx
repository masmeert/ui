import type { Meta, StoryObj } from "@storybook/react-vite";
import { GitBranch, Plus, Search, Settings, Terminal } from "lucide-react";
import { Button } from "@masmeert/ui/button";
import { Kbd } from "@masmeert/ui/kbd";
import { Tooltip } from "@masmeert/ui/tooltip";

const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  args: { content: "New thread", side: "top", delay: 120 },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    delay: { control: { type: "number", min: 0, step: 50 } },
    content: { control: "text" },
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary" size="icon" aria-label="New thread">
        <Plus className="size-4" />
      </Button>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {};

export const Right: Story = { args: { side: "right" } };

export const WithShortcut: Story = {
  args: {
    content: (
      <span className="inline-flex items-center gap-2">
        Search threads <Kbd>⌘K</Kbd>
      </span>
    ),
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary" size="icon" aria-label="Search threads">
        <Search className="size-4" />
      </Button>
    </Tooltip>
  ),
};

export const Toolbar: Story = {
  render: ({ side, delay }) => (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
      {[
        { label: "New thread", icon: Plus },
        { label: "Switch branch", icon: GitBranch },
        { label: "Open terminal", icon: Terminal },
        { label: "Settings", icon: Settings },
      ].map(({ label, icon: Icon }) => (
        <Tooltip key={label} content={label} side={side} delay={delay}>
          <Button variant="ghost" size="icon" aria-label={label}>
            <Icon className="size-4" />
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
};
