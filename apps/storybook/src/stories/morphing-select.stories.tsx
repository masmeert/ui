import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  MorphingSelect,
  MorphingSelectContent,
  MorphingSelectItem,
  MorphingSelectTrigger,
  MorphingSelectValue,
} from "@masmeert/ui/morphing-select";

const meta = {
  title: "Inputs/Morphing Select",
  component: MorphingSelect,
  args: {
    className: "w-64",
    disabled: false,
    size: "default",
    onValueChange: fn(),
    children: (
      <>
        <MorphingSelectTrigger>
          <MorphingSelectValue placeholder="Pick a model" />
        </MorphingSelectTrigger>
        <MorphingSelectContent>
          <MorphingSelectItem value="claude-opus-4-1">Claude Opus 4.1</MorphingSelectItem>
          <MorphingSelectItem value="claude-sonnet-4-5">Claude Sonnet 4.5</MorphingSelectItem>
          <MorphingSelectItem value="claude-haiku-4-5">Claude Haiku 4.5</MorphingSelectItem>
          <MorphingSelectItem value="gpt-5">GPT-5</MorphingSelectItem>
          <MorphingSelectItem value="gpt-5-mini" disabled>
            GPT-5 mini
          </MorphingSelectItem>
        </MorphingSelectContent>
      </>
    ),
  },
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    children: { control: false },
  },
  decorators: [
    function RoomForPanel(Story) {
      return (
        <div className="flex h-72 items-start">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof MorphingSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: "claude-sonnet-4-5" } };

export const Compact: Story = { args: { defaultValue: "claude-sonnet-4-5", size: "compact" } };

export const Disabled: Story = { args: { defaultValue: "claude-sonnet-4-5", disabled: true } };
