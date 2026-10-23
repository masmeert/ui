import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { TextScramble, type TextScrambleProps } from "@masmeert/ui/text-scramble";
import { useState } from "react";

function TextScrambleCycle({ messages, ...args }: TextScrambleProps & { messages: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <TextScramble {...args} text={messages[index % messages.length]} />
      <Button variant="outline" size="sm" onClick={() => setIndex((current) => current + 1)}>
        Next
      </Button>
    </div>
  );
}

const deployStatuses = ["QUEUED", "BUILDING", "UPLOADING ASSETS", "READY"];

const meta = {
  title: "Motion/Text Scramble",
  component: TextScramble,
  args: {
    text: deployStatuses[0],
    className: "font-mono text-2xl font-semibold",
  },
  argTypes: {
    text: { control: false },
    duration: { control: { type: "range", min: 100, max: 3000, step: 50 } },
    glyphs: { control: "text" },
  },
} satisfies Meta<typeof TextScramble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeployStatus: Story = {
  render: (args) => <TextScrambleCycle {...args} messages={deployStatuses} />,
};

export const CommitHash: Story = {
  args: { glyphs: "0123456789abcdef" },
  render: (args) => (
    <TextScrambleCycle {...args} messages={["a3f9c1e", "7d02b4f", "e81c5a9", "0b6f3d2"]} />
  ),
};

export const SlowResolve: Story = {
  args: { duration: 2000, className: "font-mono text-lg" },
  render: (args) => (
    <TextScrambleCycle
      {...args}
      messages={["Resolving dependencies", "Compiling 1,204 modules", "Build finished in 14.2s"]}
    />
  ),
};
