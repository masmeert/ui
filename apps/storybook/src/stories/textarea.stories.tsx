import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "@masmeert/ui/textarea";

const meta = {
  title: "Inputs/Textarea",
  component: Textarea,
  args: {
    placeholder: "Describe what changed in this release…",
    "aria-label": "Release notes",
    disabled: false,
    "aria-invalid": false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
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
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue:
      "- Move build cache to the new storage bucket\n- Retry flaky integration tests once\n- Bump Node to 22.18",
  },
};

export const Compact: Story = { args: { size: "compact" } };

export const Invalid: Story = {
  args: { defaultValue: "wip", "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Release notes are locked while the deploy is running." },
};
