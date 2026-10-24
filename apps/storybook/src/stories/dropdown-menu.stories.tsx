import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconArchive,
  IconChevronDown,
  IconCopy,
  IconDots,
  IconFolderDown,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { buttonVariants } from "@masmeert/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@masmeert/ui/dropdown-menu";

const meta = {
  title: "Overlays/Dropdown Menu",
  component: DropdownMenuContent,
  args: { side: "bottom", align: "start", sideOffset: 4, alignOffset: 0, size: "default" },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    sideOffset: { control: { type: "range", min: 0, max: 24, step: 1 } },
    alignOffset: { control: { type: "range", min: -24, max: 24, step: 1 } },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
  },
} satisfies Meta<typeof DropdownMenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThreadActionsMenu(props: ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Thread actions"
        className={buttonVariants({ variant: "outline", size: "icon" })}
      >
        <IconDots className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent {...props} className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Fix flaky auth test</DropdownMenuLabel>
          <DropdownMenuItem>
            <IconPencil />
            Rename
            <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCopy />
            Copy link
            <DropdownMenuShortcut>⌘⇧C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconArchive />
            Archive
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <IconTrash />
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThreadListViewMenu(props: ComponentProps<typeof DropdownMenuContent>) {
  const [showArchived, setShowArchived] = useState(false);
  const [showDrafts, setShowDrafts] = useState(true);
  const [sortOrder, setSortOrder] = useState("recent");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "compact" })}>
        View
        <IconChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent {...props} className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showDrafts} onCheckedChange={setShowDrafts}>
            Drafts
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
            Archived threads
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
            <DropdownMenuRadioItem value="recent">Last activity</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="created">Date created</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoveThreadMenu(props: ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "compact" })}>
        Thread
        <IconChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent {...props} className="w-52">
        <DropdownMenuItem>
          <IconPencil />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconFolderDown />
            Move to project
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuItem>masscode</DropdownMenuItem>
            <DropdownMenuItem>ui</DropdownMenuItem>
            <DropdownMenuItem>dotfiles</DropdownMenuItem>
            <DropdownMenuItem disabled>api (read-only)</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <IconTrash />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Default: Story = {
  render: (args) => <ThreadActionsMenu {...args} />,
};

export const CheckboxAndRadioItems: Story = {
  render: (args) => <ThreadListViewMenu {...args} />,
};

export const Submenu: Story = {
  render: (args) => <MoveThreadMenu {...args} />,
};

/** Rows on the compact step; submenus inherit it. Wrapping a region in `SizeProvider` does the same. */
export const Compact: Story = {
  args: { size: "compact" },
  render: (args) => <ThreadListViewMenu {...args} />,
};
