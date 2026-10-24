import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FolderGit2, MessageSquare, Settings, X } from "lucide-react";
import { Button } from "@masmeert/ui/button";
import { Sheet, type SheetProps } from "@masmeert/ui/sheet";

const meta = {
  title: "Overlays/Sheet",
  component: Sheet,
  args: {
    open: false,
    onOpenChange: fn(),
    side: "right",
    dismissable: true,
    ariaLabel: "Thread details",
    children: null,
  },
  argTypes: {
    side: { control: "inline-radio", options: ["right", "left"] },
    open: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThreadDetailsSheet({ onOpenChange, ...props }: SheetProps) {
  const [open, setOpen] = useState(false);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange(nextOpen);
  }

  return (
    <>
      <Button variant="outline" onClick={() => changeOpen(true)}>
        Thread details
      </Button>
      <Sheet {...props} open={open} onOpenChange={changeOpen}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-medium text-foreground">Fix flaky auth test</h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => changeOpen(false)}>
            <X className="size-4" />
          </Button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 p-4 text-sm">
          <dt className="text-muted-foreground">Project</dt>
          <dd className="text-foreground">masscode</dd>
          <dt className="text-muted-foreground">Branch</dt>
          <dd className="text-foreground">fix/auth-retry</dd>
          <dt className="text-muted-foreground">Agent</dt>
          <dd className="text-foreground">Claude</dd>
          <dt className="text-muted-foreground">Changed files</dt>
          <dd className="text-foreground">4</dd>
        </dl>
        <div className="mt-auto flex justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" size="compact" onClick={() => changeOpen(false)}>
            Close
          </Button>
          <Button size="compact">Open pull request</Button>
        </div>
      </Sheet>
    </>
  );
}

function NavigationSheet({ onOpenChange, ...props }: SheetProps) {
  const [open, setOpen] = useState(false);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange(nextOpen);
  }

  return (
    <>
      <Button variant="outline" onClick={() => changeOpen(true)}>
        Open menu
      </Button>
      <Sheet {...props} open={open} onOpenChange={changeOpen}>
        <nav className="flex flex-col gap-1 p-3">
          {[
            { label: "Threads", icon: MessageSquare },
            { label: "Projects", icon: FolderGit2 },
            { label: "Settings", icon: Settings },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => changeOpen(false)}
              className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
      </Sheet>
    </>
  );
}

export const Right: Story = {
  render: (args) => <ThreadDetailsSheet {...args} />,
};

export const Left: Story = {
  args: { side: "left", ariaLabel: "Navigation" },
  render: (args) => <NavigationSheet {...args} />,
};

export const NotDismissable: Story = {
  args: { dismissable: false },
  render: (args) => <ThreadDetailsSheet {...args} />,
};
