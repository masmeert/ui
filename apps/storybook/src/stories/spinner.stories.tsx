import type { Meta, StoryObj } from "@storybook/react-vite";
import { typeClass } from "@masmeert/ui/lib/type-scale";
import { Spinner, type SpinnerVariant } from "@masmeert/ui/spinner";

const variants: SpinnerVariant[] = [
  "spinner",
  "dots",
  "bars",
  "dot-matrix",
  "dither",
  "ascii",
  "ascii-line",
  "ascii-braille",
  "ascii-blocks",
  "ascii-bounce",
  "morph",
  "comet",
  "scramble",
  "metaballs",
  "newton",
  "helix",
  "percent",
];

const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  args: { variant: "spinner", size: 32, cycleSeconds: 1, label: "Loading threads" },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: { type: "range", min: 12, max: 96, step: 4 } },
    cycleSeconds: { control: { type: "range", min: 0.4, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

function SpinnerGallery() {
  return (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
      {variants.map((variant) => (
        <div
          key={variant}
          className="flex h-28 w-28 flex-col items-center justify-between rounded-lg border p-3"
        >
          <div className="flex flex-1 items-center">
            <Spinner variant={variant} size={28} label={`Loading (${variant})`} />
          </div>
          <span className={`font-mono text-muted-foreground ${typeClass("caption", "compact")}`}>
            {variant}
          </span>
        </div>
      ))}
    </div>
  );
}

function InlineStatus() {
  return (
    <div className="flex flex-col gap-3 font-mono text-sm">
      <span className="flex items-center gap-2">
        <Spinner variant="ascii" size={14} label="Running agent" />
        Agent is editing src/server.ts
      </span>
      <span className="flex items-center gap-2 text-muted-foreground">
        <Spinner variant="spinner" size={14} label="Building" />
        Building preview for #482
      </span>
      <span className="flex items-center gap-2 text-muted-foreground">
        <Spinner variant="dots" size={14} label="Waiting for checks" />
        Waiting for 3 checks
      </span>
    </div>
  );
}

export const Default: Story = {};
export const Variants: Story = { render: SpinnerGallery };
export const Inline: Story = { render: InlineStatus };
export const Terminal: Story = { args: { variant: "ascii-braille", size: 24, label: "Thinking" } };
