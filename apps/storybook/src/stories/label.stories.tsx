import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconLock } from "@tabler/icons-react";
import { Label } from "@masmeert/ui/label";
import { Textarea } from "@masmeert/ui/textarea";

const meta = {
  title: "Forms/Label",
  component: Label,
  args: { children: "Project name" },
  argTypes: {
    children: { control: "text" },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <IconLock className="size-3.5" />
        Encrypted secret
      </>
    ),
  },
};

export const WithControl: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-2">
      <Label {...args} htmlFor="commit-message">
        Commit message
      </Label>
      <Textarea id="commit-message" placeholder="fix(api): retry webhook delivery on 502" />
    </div>
  ),
};
