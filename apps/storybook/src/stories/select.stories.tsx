import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@masmeert/ui/select";

const meta = {
  title: "Inputs/Select",
  component: Select,
  args: {
    className: "w-64",
    disabled: false,
    size: "default",
    onValueChange: fn(),
    onOpenChange: fn(),
    children: (
      <>
        <SelectTrigger>
          <SelectValue placeholder="Choose a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="iad1">Washington, D.C. (iad1)</SelectItem>
          <SelectItem value="sfo1">San Francisco (sfo1)</SelectItem>
          <SelectItem value="fra1">Frankfurt (fra1)</SelectItem>
          <SelectItem value="hnd1">Tokyo (hnd1)</SelectItem>
          <SelectItem value="gru1" disabled>
            São Paulo (gru1) — at capacity
          </SelectItem>
        </SelectContent>
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
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: "fra1" } };

export const Open: Story = { args: { defaultValue: "fra1", defaultOpen: true } };

export const Compact: Story = { args: { defaultValue: "fra1", size: "compact" } };

export const Disabled: Story = { args: { defaultValue: "iad1", disabled: true } };
