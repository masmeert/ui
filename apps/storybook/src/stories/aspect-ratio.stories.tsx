import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "@masmeert/ui/aspect-ratio";

type AspectRatioProps = ComponentProps<typeof AspectRatio>;

const meta = {
  title: "Display/Aspect Ratio",
  component: AspectRatio,
  args: { ratio: 16 / 9 },
  argTypes: {
    ratio: { control: { type: "number", min: 0.5, max: 3, step: 0.05 } },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeployPreview(props: AspectRatioProps) {
  return (
    <div className="w-96">
      <AspectRatio className="overflow-hidden rounded-lg border bg-muted" {...props}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-sm">
          <span className="font-medium">Preview · 4f2c91a</span>
          <span className="font-mono text-xs text-muted-foreground">
            ratio {(props.ratio ?? 1).toFixed(2)}
          </span>
        </div>
      </AspectRatio>
    </div>
  );
}

function ScreenshotPreview(props: AspectRatioProps) {
  return (
    <div className="w-96">
      <AspectRatio className="overflow-hidden rounded-lg border" {...props}>
        <img
          src="https://opengraph.githubassets.com/1/vercel/next.js"
          alt="Repository social preview for vercel/next.js"
          className="size-full object-cover"
        />
      </AspectRatio>
    </div>
  );
}

export const Widescreen: Story = { render: DeployPreview };
export const Square: Story = { args: { ratio: 1 }, render: DeployPreview };
export const Ultrawide: Story = { args: { ratio: 21 / 9 }, render: DeployPreview };
export const Image: Story = { args: { ratio: 2 }, render: ScreenshotPreview };
