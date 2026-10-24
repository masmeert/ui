import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { TextScramble, type TextScrambleProps } from "@masmeert/ui/text-scramble";
import { useState } from "react";
import {
  TEXT_SHIMMER_CLASS_NAME,
  TEXT_SHIMMER_KEYFRAMES,
  textShimmerStyle,
} from "@masmeert/ui/lib/text-shimmer";
import { typeClass } from "@masmeert/ui/lib/type-scale";

function TextScrambleCycle({ messages, ...args }: TextScrambleProps & { messages: string[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <TextScramble {...args} text={messages[index % messages.length]} />
      <Button variant="outline" size="compact" onClick={() => setIndex((current) => current + 1)}>
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
    className: `font-mono font-bold ${typeClass("display")}`,
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
  args: { duration: 2000, className: `font-mono ${typeClass("subtitle")}` },
  render: (args) => (
    <TextScrambleCycle
      {...args}
      messages={["Resolving dependencies", "Compiling 1,204 modules", "Build finished in 14.2s"]}
    />
  ),
};

/** A `bg-clip-text` gradient on the root has to reach the scrambling glyphs. */
export const Shimmer: Story = {
  args: {
    className: `${TEXT_SHIMMER_CLASS_NAME} ${typeClass("body")}`,
    style: textShimmerStyle(2.2),
  },
  render: (args) => (
    <>
      <style>{TEXT_SHIMMER_KEYFRAMES}</style>
      <TextScrambleCycle
        {...args}
        messages={["Thinking…", "Reading the codebase", "Planning changes"]}
      />
    </>
  ),
};
