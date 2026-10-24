import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { InputCopy } from "@masmeert/ui/input-copy";

const meta = {
  title: "Inputs/Input Copy",
  component: InputCopy,
  args: {
    value: "sk_live_51NcV2bKx9QeT3mL8pRwZ",
    label: "Secret key",
    mono: true,
    onCopy: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    resetAfter: { control: { type: "range", min: 500, max: 4000, step: 250 } },
  },
  render: (args) => (
    <div className="w-80">
      <InputCopy {...args} />
    </div>
  ),
} satisfies Meta<typeof InputCopy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Url: Story = {
  args: { label: "Preview URL", value: "https://acme-git-feat-billing.vercel.app", mono: false },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      {(["compact", "default", "large"] as const).map((size) => (
        <InputCopy key={size} {...args} size={size} label={size} />
      ))}
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
