import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { CarouselDots, type CarouselDotsProps } from "@masmeert/ui/carousel-dots";

const SLIDES = ["Build", "Preview", "Ship", "Observe", "Iterate"];

function Carousel(args: CarouselDotsProps) {
  const [index, setIndex] = useState(args.index);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex w-80 flex-col items-center gap-2"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="grid h-40 w-full place-items-center rounded-xl bg-selected text-lg font-semibold">
        {SLIDES[index]}
      </div>
      <CarouselDots
        {...args}
        index={index}
        // The whole carousel pauses autoplay, not just the dots.
        paused={args.paused || hovered}
        onIndexChange={(next) => {
          setIndex(next);
          args.onIndexChange?.(next);
        }}
        onAdvance={
          args.onAdvance &&
          ((next) => {
            setIndex(next);
            args.onAdvance?.(next);
          })
        }
      />
    </div>
  );
}

const meta = {
  title: "Navigation/Carousel Dots",
  component: CarouselDots,
  args: { count: SLIDES.length, index: 0, onIndexChange: fn(), autoplay: false, interval: 3000 },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    interval: { control: { type: "range", min: 1000, max: 8000, step: 500 } },
  },
  render: (args: CarouselDotsProps) => <Carousel {...args} />,
} satisfies Meta<typeof CarouselDots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The current pill fills over the interval; hover the slide or focus a dot to pause. */
export const Autoplay: Story = { args: { autoplay: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-center gap-4">
      {(["compact", "default", "large"] as const).map((size) => (
        <Carousel key={size} {...args} size={size} autoplay />
      ))}
    </div>
  ),
};
