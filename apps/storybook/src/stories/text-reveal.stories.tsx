import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { TextReveal, type TextRevealProps } from "@masmeert/ui/text-reveal";
import { useState } from "react";
import { typeClass } from "@masmeert/ui/lib/type-scale";

const meta = {
  title: "Motion/Text Reveal",
  component: TextReveal,
  args: {
    text: "Every push gets its own preview deployment.",
    split: "word",
    stagger: 0.09,
    delay: 0,
    blur: 12,
    yOffset: "40%",
    once: true,
    whileInView: false,
    className: `max-w-md text-center font-bold ${typeClass("display")}`,
  },
  argTypes: {
    text: { control: "object" },
    split: { control: "inline-radio", options: ["word", "char"] },
    stagger: { control: { type: "range", min: 0, max: 0.3, step: 0.01 } },
    delay: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    blur: { control: { type: "range", min: 0, max: 20, step: 1 } },
    yOffset: { control: "text" },
    spring: { control: "object" },
    once: { control: "boolean" },
    whileInView: { control: "boolean" },
    as: { control: false },
  },
  render: function TextRevealDemo(args: TextRevealProps) {
    const [replayCount, setReplayCount] = useState(0);
    return (
      <div className="flex flex-col items-center gap-6">
        <TextReveal key={replayCount} {...args} />
        <Button
          variant="outline"
          size="compact"
          onClick={() => setReplayCount((current) => current + 1)}
        >
          Replay
        </Button>
      </div>
    );
  },
} satisfies Meta<typeof TextReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Words: Story = {};

export const Characters: Story = {
  args: {
    text: "Build passed",
    split: "char",
    stagger: 0.03,
    blur: 8,
    className: `font-mono font-bold ${typeClass("display")}`,
  },
};

export const MultipleLines: Story = {
  args: {
    as: "h2",
    text: ["Review the diff.", "Merge the branch.", "Watch it go live."],
    stagger: 0.12,
    className: `text-center font-semibold ${typeClass("title")}`,
  },
};

export const SoftSpring: Story = {
  args: {
    text: "Rolled back to v2.14.3 in 9 seconds.",
    yOffset: "100%",
    blur: 4,
    spring: { stiffness: 60, damping: 14, mass: 1 },
  },
};
