import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "@masmeert/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@masmeert/ui/field";
import { Input } from "@masmeert/ui/input";
import { Textarea } from "@masmeert/ui/textarea";

const meta = {
  title: "Forms/Field",
  component: Field,
  args: { orientation: "vertical" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal", "responsive"] },
  },
  decorators: [
    function FixedWidth(Story) {
      return (
        <div className="w-96">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="project-name">Project name</FieldLabel>
      <Input id="project-name" defaultValue="acme-api" />
      <FieldDescription>
        Used in your deployment URLs. Lowercase letters and dashes only.
      </FieldDescription>
    </Field>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <Field {...args} data-invalid>
      <FieldLabel htmlFor="project-name-invalid">Project name</FieldLabel>
      <Input id="project-name-invalid" defaultValue="Acme API" error />
      <FieldError>Use lowercase letters and dashes only, like acme-api.</FieldError>
    </Field>
  ),
};

function ApprovalField(props: Story["args"]) {
  const [requireApproval, setRequireApproval] = useState(true);
  return (
    <Field {...props} orientation="horizontal">
      <Checkbox
        id="require-approval"
        checked={requireApproval}
        onCheckedChange={setRequireApproval}
      />
      <FieldContent>
        <FieldLabel htmlFor="require-approval">Require approval</FieldLabel>
        <FieldDescription>A maintainer must approve every production deploy.</FieldDescription>
      </FieldContent>
    </Field>
  );
}

export const Horizontal: Story = {
  render: (args) => <ApprovalField {...args} />,
};

export const Fieldset: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Build settings</FieldLegend>
      <FieldDescription>Applied to every deploy of this project.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="build-command">Build command</FieldLabel>
          <Input id="build-command" defaultValue="pnpm build" />
        </Field>
        <Field>
          <FieldLabel htmlFor="output-directory">Output directory</FieldLabel>
          <Input id="output-directory" defaultValue="dist" />
        </Field>
        <FieldSeparator>Optional</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="ignored-build-step">Ignored build step</FieldLabel>
          <Textarea id="ignored-build-step" placeholder="git diff --quiet HEAD^ HEAD ./" />
          <FieldDescription>Skip the build when this command exits with 0.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
