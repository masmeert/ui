import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { InputOTP } from "@masmeert/ui/input-otp";

const meta = {
  title: "Inputs/Input OTP",
  component: InputOTP,
  args: {
    length: 6,
    label: "Verification code",
    hint: "Enter the 6-digit code we sent to maya@acme.dev.",
    errorMessage: "That code has expired. Request a new one and try again.",
    successMessage: "Email verified.",
    status: "idle",
    mask: false,
    disabled: false,
    onChange: fn(),
    onComplete: fn(),
  },
  argTypes: {
    length: { control: { type: "number", min: 4, max: 8, step: 1 } },
    status: { control: "inline-radio", options: ["idle", "error", "success"] },
    mask: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = { args: { defaultValue: "482913", status: "error" } };

export const Verified: Story = { args: { defaultValue: "482913", status: "success" } };

export const Masked: Story = {
  args: {
    length: 4,
    mask: true,
    label: "Deploy PIN",
    hint: "Enter your 4-digit PIN to approve the production deploy.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    hint: "Too many attempts. Try again in 5 minutes.",
  },
};
