import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconArchive,
  IconCopy,
  IconDots,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@masmeert/ui/button";
import { Input } from "@masmeert/ui/input";
import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverMenu,
  MorphingPopoverTrigger,
} from "@masmeert/ui/morphing-popover";
import { sizeTokens } from "@masmeert/ui/lib/size";

const tokens = sizeTokens();
const itemClass = `flex items-center rounded-lg text-foreground outline-none ${tokens.row} ${tokens.gap} ${tokens.text}`;

const meta = {
  title: "Overlays/Morphing Popover",
  component: MorphingPopoverContent,
  args: {
    children: null,
    side: "bottom",
    align: "end",
    sideOffset: 8,
    radius: 16,
    instant: false,
  },
  argTypes: {
    side: { control: "inline-radio", options: ["bottom", "top", "right"] },
    align: { control: "inline-radio", options: ["start", "end"] },
    sideOffset: { control: { type: "range", min: 0, max: 32, step: 1 } },
    radius: { control: { type: "range", min: 0, max: 32, step: 1 } },
    children: { control: false },
  },
} satisfies Meta<typeof MorphingPopoverContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThreadActionsPopover(props: ComponentProps<typeof MorphingPopoverContent>) {
  const [open, setOpen] = useState(false);

  return (
    <MorphingPopover open={open} onOpenChange={setOpen}>
      <MorphingPopoverTrigger>
        <Button variant="ghost" size="icon" aria-label="Thread actions">
          <IconDots className="size-4" />
        </Button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent {...props} className="p-1.5">
        <MorphingPopoverMenu className="w-48">
          {[
            { label: "Rename", icon: IconPencil },
            { label: "Copy link", icon: IconCopy },
            { label: "Archive", icon: IconArchive },
            { label: "Delete", icon: IconTrash },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <Icon className="size-4 text-muted-foreground" />
              {label}
            </button>
          ))}
        </MorphingPopoverMenu>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}

function NewProjectPopover(props: ComponentProps<typeof MorphingPopoverContent>) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "form">("menu");
  const [name, setName] = useState("");

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setView("menu");
  }

  return (
    <MorphingPopover open={open} onOpenChange={changeOpen}>
      <MorphingPopoverTrigger>
        <Button variant="secondary">
          <IconPlus className="size-4" />
          New
        </Button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent {...props} className="p-1.5">
        {view === "menu" ? (
          <MorphingPopoverMenu className="w-52">
            <button
              type="button"
              role="menuitem"
              onClick={() => changeOpen(false)}
              className={itemClass}
            >
              New thread
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setView("form")}
              className={itemClass}
            >
              New project…
            </button>
          </MorphingPopoverMenu>
        ) : (
          <form
            className="flex w-72 flex-col gap-3 p-2.5"
            onSubmit={(event) => {
              event.preventDefault();
              changeOpen(false);
            }}
          >
            <Input label="Project name" placeholder="masscode" value={name} onChange={setName} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="compact" onClick={() => setView("menu")}>
                Back
              </Button>
              <Button type="submit" size="compact" disabled={name.trim() === ""}>
                Create
              </Button>
            </div>
          </form>
        )}
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}

export const Menu: Story = {
  render: (args) => <ThreadActionsPopover {...args} />,
};

export const MenuToForm: Story = {
  args: { align: "start" },
  render: (args) => <NewProjectPopover {...args} />,
};

export const Top: Story = {
  args: { side: "top" },
  render: (args) => <ThreadActionsPopover {...args} />,
};
