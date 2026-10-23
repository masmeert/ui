import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "@masmeert/ui/button";
import { Dialog, type DialogProps } from "@masmeert/ui/dialog";
import { Input } from "@masmeert/ui/input";

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  args: { viewId: null, onClose: fn(), children: null, placement: "center" },
  argTypes: {
    placement: { control: "inline-radio", options: ["center", "bottom"] },
    viewId: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function RenameThreadDialog({ placement, className, onClose }: DialogProps) {
  const [viewId, setViewId] = useState<string | null>(null);
  const [name, setName] = useState("Fix flaky auth test");

  function close() {
    setViewId(null);
    onClose();
  }

  return (
    <>
      <Button variant="outline" onClick={() => setViewId("rename")}>
        Rename thread
      </Button>
      <Dialog viewId={viewId} onClose={close} placement={placement} className={className}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-medium text-foreground">Rename thread</h2>
            <p className="text-sm text-muted-foreground">Shown in the sidebar and in search.</p>
          </div>
          <Input label="Thread name" value={name} onChange={setName} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button size="sm" disabled={name.trim() === ""} onClick={close}>
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function ThreadSettingsDialog({ placement, className, onClose }: DialogProps) {
  const [viewId, setViewId] = useState<string | null>(null);

  function close() {
    setViewId(null);
    onClose();
  }

  return (
    <>
      <Button variant="outline" onClick={() => setViewId("details")}>
        Thread settings
      </Button>
      <Dialog viewId={viewId} onClose={close} placement={placement} className={className}>
        {viewId === "confirm" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-medium text-foreground">Delete this thread?</h2>
              <p className="text-sm text-muted-foreground">
                Its transcript and 3 checkpoints are removed. The branch stays.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setViewId("details")}>
                Back
              </Button>
              <Button size="sm" onClick={close}>
                Delete thread
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-medium text-foreground">Fix flaky auth test</h2>
              <p className="text-sm text-muted-foreground">masscode · branch fix/auth-retry</p>
            </div>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Agent</dt>
              <dd className="text-foreground">Claude</dd>
              <dt className="text-muted-foreground">Started</dt>
              <dd className="text-foreground">12 minutes ago</dd>
              <dt className="text-muted-foreground">Changed files</dt>
              <dd className="text-foreground">4</dd>
            </dl>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => setViewId("confirm")}>
                Delete thread
              </Button>
              <Button size="sm" onClick={close}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

export const Center: Story = {
  render: (args) => <RenameThreadDialog {...args} />,
};

export const Bottom: Story = {
  args: { placement: "bottom" },
  render: (args) => <RenameThreadDialog {...args} />,
};

export const MultipleViews: Story = {
  render: (args) => <ThreadSettingsDialog {...args} />,
};
