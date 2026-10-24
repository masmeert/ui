import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { IconGitBranch } from "@tabler/icons-react";
import { Button } from "@masmeert/ui/button";
import { Drawer, type DrawerProps } from "@masmeert/ui/drawer";

const meta = {
  title: "Overlays/Drawer",
  component: Drawer,
  args: {
    open: false,
    onOpenChange: fn(),
    snapPoints: [0.5, 0.92],
    defaultSnap: 0,
    title: "Switch branch",
    description: "masscode · 12 local branches",
    dismissThreshold: 120,
  },
  argTypes: {
    open: { control: false },
    defaultSnap: { control: { type: "number", min: 0, step: 1 } },
    dismissThreshold: { control: { type: "number", min: 0, step: 10 } },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function BranchPickerDrawer({ onOpenChange, ...props }: DrawerProps) {
  const [open, setOpen] = useState(false);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange(nextOpen);
  }

  return (
    <>
      <Button variant="outline" onClick={() => changeOpen(true)}>
        <IconGitBranch className="size-4" />
        Switch branch
      </Button>
      <Drawer {...props} open={open} onOpenChange={changeOpen}>
        <ul className="flex flex-col gap-0.5">
          {[
            "main",
            "fix/auth-retry",
            "feat/agent-keep-awake",
            "feat/thread-search",
            "chore/bump-motion",
            "fix/sidebar-focus",
            "feat/command-palette",
            "release/0.1.11",
            "fix/drawer-snap",
            "feat/mobile-submit",
            "docs/readme",
            "spike/remote-agents",
          ].map((branch) => (
            <li key={branch}>
              <button
                type="button"
                onClick={() => changeOpen(false)}
                className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
              >
                <IconGitBranch className="size-4 text-muted-foreground" />
                {branch}
              </button>
            </li>
          ))}
        </ul>
      </Drawer>
    </>
  );
}

function QuickActionsDrawer({ onOpenChange, ...props }: DrawerProps) {
  const [open, setOpen] = useState(false);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange(nextOpen);
  }

  return (
    <>
      <Button variant="outline" onClick={() => changeOpen(true)}>
        Thread actions
      </Button>
      <Drawer {...props} open={open} onOpenChange={changeOpen}>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={() => changeOpen(false)}>
            Rename thread
          </Button>
          <Button variant="secondary" onClick={() => changeOpen(false)}>
            Copy link
          </Button>
          <Button variant="secondary" onClick={() => changeOpen(false)}>
            Archive thread
          </Button>
        </div>
      </Drawer>
    </>
  );
}

export const Default: Story = {
  render: (args) => <BranchPickerDrawer {...args} />,
};

export const OpensTall: Story = {
  args: { defaultSnap: 1 },
  render: (args) => <BranchPickerDrawer {...args} />,
};

export const AutoHeight: Story = {
  args: {
    snapPoints: ["auto"],
    title: "Fix flaky auth test",
    description: "Running · 12 minutes",
  },
  render: (args) => <QuickActionsDrawer {...args} />,
};
