import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextShimmer } from "@masmeert/ui/text-shimmer";
import { IconLoader2 } from "@tabler/icons-react";
import { typeClass } from "@masmeert/ui/lib/type-scale";

const meta = {
  title: "Motion/Text Shimmer",
  component: TextShimmer,
  args: {
    children: "Deploying web-app to production…",
    duration: 2.5,
    className: typeClass("body"),
  },
  argTypes: {
    children: { control: "text" },
    duration: { control: { type: "range", min: 0.5, max: 6, step: 0.1 } },
    as: { control: false },
  },
} satisfies Meta<typeof TextShimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slow: Story = {
  args: { children: "Indexing 2,418 files", duration: 5 },
};

export const Heading: Story = {
  args: {
    as: "h2",
    children: "Building preview environment",
    className: `${typeClass("title")} font-semibold`,
  },
};

export const StatusRow: Story = {
  args: { children: "Running 312 tests on ubuntu-latest" },
  render: (args) => (
    <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
      <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
      <TextShimmer {...args} />
    </div>
  ),
};
