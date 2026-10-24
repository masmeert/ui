import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThinkingGlyph, ThinkingIndicator } from "@masmeert/ui/thinking-indicator";

const meta = {
  title: "AI/Thinking Indicator",
  component: ThinkingIndicator,
  args: { label: "Thinking", shimmer: true },
  argTypes: {
    label: { control: "text" },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    interval: { control: { type: "range", min: 800, max: 6000, step: 100 } },
  },
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Cycling: Story = {
  args: {
    label: ["Reading the codebase", "Tracing call sites", "Checking the tests", "Drafting a fix"],
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <ThinkingIndicator {...args} size="compact" />
      <ThinkingIndicator {...args} size="default" />
      <ThinkingIndicator {...args} size="large" />
    </div>
  ),
};

export const GlyphOnly: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ThinkingGlyph pixelSize={16} />
      <ThinkingGlyph pixelSize={32} />
      <ThinkingGlyph pixelSize={64} />
    </div>
  ),
};
