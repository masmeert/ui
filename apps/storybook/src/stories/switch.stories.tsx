import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Switch, type SwitchProps } from "@masmeert/ui/switch";

function ControlledSwitch(props: SwitchProps) {
  const [checked, setChecked] = useState(props.checked);
  return (
    <Switch
      {...props}
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        props.onCheckedChange(next);
      }}
    />
  );
}

const meta = {
  title: "Inputs/Switch",
  component: Switch,
  args: {
    checked: false,
    onCheckedChange: fn(),
    label: "Deploy automatically on push to main",
    size: "default",
    disabled: false,
  },
  argTypes: {
    checked: { control: "boolean" },
    size: { control: "inline-radio", options: ["default", "sm"] },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  // Remounting on a `checked` control change lets the panel reset the local state.
  render: (args) => <ControlledSwitch key={String(args.checked)} {...args} />,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Small: Story = {
  args: { size: "sm", checked: true, label: "Show build logs inline" },
};

export const WithoutLabel: Story = {
  args: { label: undefined, ariaLabel: "Enable preview deployments" },
};

export const Disabled: Story = {
  args: { disabled: true, label: "Deploy automatically (locked by admin)" },
};
