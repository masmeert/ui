import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@masmeert/ui/alert-dialog";
import { buttonVariants } from "@masmeert/ui/button";

const meta = {
  title: "Overlays/Alert Dialog",
  component: AlertDialogContent,
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "compact"] },
  },
} satisfies Meta<typeof AlertDialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeleteProjectAlert(props: ComponentProps<typeof AlertDialogContent>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "outline" })}>
        Delete project
      </AlertDialogTrigger>
      <AlertDialogContent {...props}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “masscode”?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the project and its 24 threads from this machine. Your repository on disk
            stays untouched.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ArchiveThreadAlert(props: ComponentProps<typeof AlertDialogContent>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "outline" })}>
        <Archive className="size-4" />
        Archive thread
      </AlertDialogTrigger>
      <AlertDialogContent {...props}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Archive />
          </AlertDialogMedia>
          <AlertDialogTitle>Archive “Fix flaky auth test”?</AlertDialogTitle>
          <AlertDialogDescription>
            The agent stops and the thread moves to Archived. You can restore it any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep running</AlertDialogCancel>
          <AlertDialogAction>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DiscardChangesAlert(props: ComponentProps<typeof AlertDialogContent>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={buttonVariants({ variant: "outline" })}>
        <Trash2 className="size-4" />
        Discard changes
      </AlertDialogTrigger>
      <AlertDialogContent {...props}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Discard 3 changed files?</AlertDialogTitle>
          <AlertDialogDescription>This can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const Default: Story = {
  render: (args) => <DeleteProjectAlert {...args} />,
};

export const WithMedia: Story = {
  render: (args) => <ArchiveThreadAlert {...args} />,
};

export const Compact: Story = {
  args: { size: "compact" },
  render: (args) => <DiscardChangesAlert {...args} />,
};
