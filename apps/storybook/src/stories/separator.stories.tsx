import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@masmeert/ui/separator";

type SeparatorProps = ComponentProps<typeof Separator>;

const meta = {
  title: "Display/Separator",
  component: Separator,
  args: { orientation: "horizontal", decorative: true },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

function SectionSeparator(props: SeparatorProps) {
  return (
    <div className="flex w-80 flex-col gap-4 text-sm">
      <div>
        <div className="font-medium">masscode</div>
        <div className="text-muted-foreground">12 open threads · 3 deploys today</div>
      </div>
      <Separator {...props} />
      <div className="text-muted-foreground">Last commit fa70ddc by Massimo, 2 hours ago</div>
    </div>
  );
}

function CommitMetaSeparator(props: SeparatorProps) {
  return (
    <div className="flex h-5 items-center gap-3 font-mono text-sm text-muted-foreground">
      <span>main</span>
      <Separator {...props} />
      <span>4f2c91a</span>
      <Separator {...props} />
      <span>+14 −3</span>
    </div>
  );
}

export const Horizontal: Story = { render: SectionSeparator };
export const Vertical: Story = { args: { orientation: "vertical" }, render: CommitMetaSeparator };
