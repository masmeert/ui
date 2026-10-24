import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Copy, Share2, Users } from "lucide-react";
import { Button } from "@masmeert/ui/button";
import { Popover, PopoverContent, PopoverTrigger, type PopoverProps } from "@masmeert/ui/popover";
import { typeClass } from "@masmeert/ui/lib/type-scale";

const meta = {
  title: "Overlays/Popover",
  component: Popover,
  args: {
    children: null,
    onOpenChange: fn(),
    trigger: "click",
    side: "bottom",
    align: "center",
    sideOffset: 14,
    panelRadius: 16,
    gooStrength: 8,
  },
  argTypes: {
    trigger: { control: "inline-radio", options: ["click", "hover"] },
    side: { control: "inline-radio", options: ["bottom", "top"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    sideOffset: { control: { type: "range", min: 0, max: 40, step: 1 } },
    panelRadius: { control: { type: "range", min: 0, max: 32, step: 1 } },
    gooStrength: { control: { type: "range", min: 0, max: 16, step: 1 } },
    children: { control: false },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

function ShareThreadPopover(props: PopoverProps) {
  return (
    <Popover {...props}>
      <PopoverTrigger>
        <Button variant="secondary">
          <Share2 className="size-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className={`${typeClass("body")} font-medium text-foreground`}>
              Share “Fix flaky auth test”
            </p>
            <p className={`${typeClass("caption")} text-muted-foreground`}>
              Anyone in the masscode workspace can read the transcript.
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg bg-background px-3 py-2 ${typeClass("caption")} text-muted-foreground`}
          >
            <span className="min-w-0 flex-1 truncate">masscode.dev/t/fix-flaky-auth-test</span>
            <Button variant="ghost" size="icon" aria-label="Copy link">
              <Copy className="size-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ParticipantsPopover(props: PopoverProps) {
  return (
    <Popover {...props}>
      <PopoverTrigger>
        <Button variant="ghost" size="compact">
          <Users className="size-4" />3 watching
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <ul className={`flex flex-col gap-2 ${typeClass("body")}`}>
          {["Ada Lovelace", "Grace Hopper", "Linus Torvalds"].map((name) => (
            <li key={name} className="flex items-center gap-2 text-foreground">
              <span className="size-2 rounded-full bg-success" />
              {name}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export const Click: Story = {
  render: (args) => <ShareThreadPopover {...args} />,
};

export const Hover: Story = {
  args: { trigger: "hover" },
  render: (args) => <ParticipantsPopover {...args} />,
};

export const Top: Story = {
  args: { side: "top", align: "start" },
  render: (args) => <ShareThreadPopover {...args} />,
};

export const WithoutGoo: Story = {
  args: { gooStrength: 0 },
  render: (args) => <ShareThreadPopover {...args} />,
};
