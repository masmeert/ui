import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { TextCascade, type TextCascadeProps } from "@masmeert/ui/text-cascade";
import { useState } from "react";
import { typeClass } from "@masmeert/ui/lib/type-scale";

function TextCascadeCycle({ labels, ...args }: TextCascadeProps & { labels: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <TextCascade {...args} text={labels[index % labels.length]} />
      <Button variant="outline" size="compact" onClick={() => setIndex((current) => current + 1)}>
        Next
      </Button>
    </div>
  );
}

const meta = {
  title: "Motion/Text Cascade",
  component: TextCascade,
  args: {
    text: "main",
    className: `font-mono ${typeClass("subtitle")}`,
  },
  argTypes: {
    text: { control: false },
    className: { control: "text" },
  },
} satisfies Meta<typeof TextCascade>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BranchName: Story = {
  render: (args) => (
    <TextCascadeCycle
      {...args}
      labels={["main", "feat/billing-v2", "fix/session-timeout", "release/0.4.0"]}
    />
  ),
};

export const Headline: Story = {
  args: { className: `${typeClass("display")} font-bold` },
  render: (args) => (
    <TextCascadeCycle {...args} labels={["Ship faster", "Review together", "Deploy anywhere"]} />
  ),
};
