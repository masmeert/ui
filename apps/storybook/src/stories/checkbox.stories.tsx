import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Checkbox, type CheckboxProps } from "@masmeert/ui/checkbox";

function ControlledCheckbox(props: CheckboxProps) {
  const [checked, setChecked] = useState(props.checked);
  return (
    <Checkbox
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
  title: "Inputs/Checkbox",
  component: Checkbox,
  args: {
    checked: false,
    onCheckedChange: fn(),
    label: "Require approval for production deploys",
    description: "A maintainer must approve before the deploy starts.",
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
  // Remounting on a `checked` control change lets the panel reset the local state.
  render: (args) => <ControlledCheckbox key={String(args.checked)} {...args} />,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const WithoutDescription: Story = {
  args: { label: "Notify me when a deploy fails", description: undefined },
};

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
    description: "Enforced by your organization's deploy policy.",
  },
};

const ENVIRONMENTS = ["Production", "Staging", "Preview"];

function EnvironmentChecklist() {
  const [selected, setSelected] = useState<string[]>(["Production"]);
  const allSelected = selected.length === ENVIRONMENTS.length;

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="Apply to all environments"
        checked={allSelected}
        indeterminate={!allSelected && selected.length > 0}
        onCheckedChange={() => setSelected(allSelected ? [] : ENVIRONMENTS)}
      />
      <div className="flex flex-col gap-3 pl-8">
        {ENVIRONMENTS.map((environment) => (
          <Checkbox
            key={environment}
            label={environment}
            checked={selected.includes(environment)}
            onCheckedChange={(checked) =>
              setSelected((current) =>
                checked
                  ? [...current, environment]
                  : current.filter((value) => value !== environment),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

export const Indeterminate: Story = {
  render: () => <EnvironmentChecklist />,
};
