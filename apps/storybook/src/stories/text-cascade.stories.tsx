import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { TextCascade, type TextCascadeProps } from "@masmeert/ui/text-cascade";
import { useState } from "react";

function TextCascadeCycle({ labels, ...args }: TextCascadeProps & { labels: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <TextCascade {...args} text={labels[index % labels.length]} />
      <Button variant="outline" size="sm" onClick={() => setIndex((current) => current + 1)}>
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
    className: "font-mono text-lg",
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
  args: { className: "text-3xl font-semibold tracking-tight" },
  render: (args) => (
    <TextCascadeCycle {...args} labels={["Ship faster", "Review together", "Deploy anywhere"]} />
  ),
};
