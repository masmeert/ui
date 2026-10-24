import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail } from "lucide-react";
import { fn } from "storybook/test";
import { Input } from "@masmeert/ui/input";

const meta = {
  title: "Inputs/Input",
  component: Input,
  args: {
    label: "Invite a teammate",
    type: "email",
    placeholder: "name@acme.dev",
    disabled: false,
    success: false,
    reserveErrorLine: false,
    onChange: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    success: { control: "boolean" },
    disabled: { control: "boolean" },
    reserveErrorLine: { control: "boolean" },
  },
  decorators: [
    function FixedWidth(Story) {
      return (
        <div className="w-80">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = { args: { leftIcon: <Mail /> } };

export const Compact: Story = { args: { size: "compact", leftIcon: <Mail /> } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["compact", "default", "large"] as const).map((size) => (
        <Input
          key={size}
          {...args}
          size={size}
          label={`${args.label} (${size})`}
          leftIcon={<Mail />}
        />
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    leftIcon: <Mail />,
    defaultValue: "maya@acme",
    error: "Enter a full email address, like maya@acme.dev.",
  },
};

export const Success: Story = {
  args: { leftIcon: <Mail />, defaultValue: "maya@acme.dev", success: true },
};

export const Disabled: Story = {
  args: {
    label: "Workspace URL",
    type: "text",
    defaultValue: "acme.masscode.dev",
    disabled: true,
  },
};
