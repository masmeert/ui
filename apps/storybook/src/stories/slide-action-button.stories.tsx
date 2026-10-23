import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SlideActionButton } from "@masmeert/ui/slide-action-button";

const meta = {
  title: "Inputs/Slide Action Button",
  component: SlideActionButton,
  args: {
    children: "Slide to deploy",
    completeLabel: "Deploying to production",
    threshold: 0.82,
    resetDelay: 1200,
    onComplete: fn(),
  },
  argTypes: {
    threshold: { control: { type: "range", min: 0.3, max: 1, step: 0.01 } },
    resetDelay: { control: { type: "range", min: 400, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof SlideActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LowThreshold: Story = {
  args: {
    threshold: 0.5,
    children: "Slide to promote",
    completeLabel: "Promoted to production",
  },
};

export const Wide: Story = {
  args: {
    className: "w-96",
    children: "Slide to merge pull request",
    completeLabel: "Merged",
    resetDelay: 3000,
  },
};
