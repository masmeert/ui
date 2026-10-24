import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SearchInput, SearchTrigger } from "@masmeert/ui/search-input";

const meta = {
  title: "Inputs/Search Input",
  component: SearchInput,
  args: {
    placeholder: "Search deployments",
    "aria-label": "Search deployments",
    disabled: false,
    size: "default",
    onChange: fn(),
  },
  argTypes: {
    placeholder: { control: "text" },
    shortcut: { control: "text" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
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
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithShortcut: Story = { args: { shortcut: "/" } };

export const WithValue: Story = { args: { defaultValue: "api-gateway", shortcut: "/" } };

export const Compact: Story = { args: { size: "compact", shortcut: "/" } };

export const Disabled: Story = { args: { disabled: true } };

export const Trigger: Story = {
  render: () => <SearchTrigger placeholder="Search projects, commands…" shortcut="⌘K" />,
};
