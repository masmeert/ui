import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { Input } from "@masmeert/ui/input";
import {
  UnfoldModal,
  UnfoldModalClose,
  UnfoldModalContent,
  UnfoldModalTrigger,
} from "@masmeert/ui/unfold-modal";

const meta = {
  title: "Overlays/Unfold Modal",
  component: UnfoldModalContent,
  args: {
    ariaLabel: "Invite teammates",
    dismissible: true,
    showCloseButton: true,
    closeButtonLabel: "Close modal",
    children: null,
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof UnfoldModalContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function InviteTeammatesModal(props: ComponentProps<typeof UnfoldModalContent>) {
  const [email, setEmail] = useState("");

  return (
    <UnfoldModal>
      <UnfoldModalTrigger>
        <Button variant="outline">Invite teammates</Button>
      </UnfoldModalTrigger>
      <UnfoldModalContent {...props}>
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1 pr-10">
            <h2 className="text-lg font-medium text-foreground">Invite to masscode</h2>
            <p className="text-sm text-muted-foreground">
              Teammates can open threads, review diffs and watch running agents.
            </p>
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="ada@example.com"
            value={email}
            onChange={setEmail}
          />
          <div className="flex justify-end gap-2">
            <UnfoldModalClose>
              <Button variant="ghost" size="compact">
                Cancel
              </Button>
            </UnfoldModalClose>
            <UnfoldModalClose>
              <Button size="compact" disabled={!email.includes("@")}>
                Send invite
              </Button>
            </UnfoldModalClose>
          </div>
        </div>
      </UnfoldModalContent>
    </UnfoldModal>
  );
}

function ReleaseNotesModal(props: ComponentProps<typeof UnfoldModalContent>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        What’s new
      </Button>
      <span className="text-sm text-muted-foreground">{open ? "Open" : "Closed"}</span>
      <UnfoldModal open={open} onOpenChange={setOpen}>
        <UnfoldModalContent {...props}>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1 pr-10">
              <h2 className="text-lg font-medium text-foreground">masscode 0.1.11</h2>
              <p className="text-sm text-muted-foreground">Released October 21</p>
            </div>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-foreground">
              <li>Keep-awake sessions hide the countdown while an agent runs.</li>
              <li>Release builds can be rebuilt from a tag by hand.</li>
              <li>Threads remember their scroll position.</li>
            </ul>
            <div className="flex justify-end">
              <UnfoldModalClose>
                <Button size="compact">Got it</Button>
              </UnfoldModalClose>
            </div>
          </div>
        </UnfoldModalContent>
      </UnfoldModal>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <InviteTeammatesModal {...args} />,
};

export const Controlled: Story = {
  args: { ariaLabel: "What’s new" },
  render: (args) => <ReleaseNotesModal {...args} />,
};

export const NotDismissible: Story = {
  args: { dismissible: false, showCloseButton: false },
  render: (args) => <InviteTeammatesModal {...args} />,
};
