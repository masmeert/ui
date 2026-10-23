import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { RadioGroup, RadioGroupItem } from "@masmeert/ui/radio-group";

const meta = {
  title: "Inputs/Radio Group",
  component: RadioGroup,
  args: {
    defaultValue: "rolling",
    orientation: "vertical",
    onValueChange: fn(),
    children: (
      <>
        <RadioGroupItem
          value="rolling"
          label="Rolling"
          description="Replace instances a few at a time. No extra capacity needed."
        />
        <RadioGroupItem
          value="blue-green"
          label="Blue-green"
          description="Start a full copy, then switch traffic at once."
        />
        <RadioGroupItem
          value="canary"
          label="Canary"
          description="Send 5% of traffic to the new version first."
        />
      </>
    ),
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    children: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    defaultValue: "medium",
    children: (
      <>
        <RadioGroupItem value="small" label="Small" />
        <RadioGroupItem value="medium" label="Medium" />
        <RadioGroupItem value="large" label="Large" />
      </>
    ),
  },
};

export const WithDisabledOption: Story = {
  args: {
    children: (
      <>
        <RadioGroupItem
          value="rolling"
          label="Rolling"
          description="Replace instances a few at a time. No extra capacity needed."
        />
        <RadioGroupItem
          value="blue-green"
          label="Blue-green"
          description="Start a full copy, then switch traffic at once."
        />
        <RadioGroupItem
          value="canary"
          label="Canary"
          description="Upgrade to the Team plan to use canary deploys."
          disabled
        />
      </>
    ),
  },
};
