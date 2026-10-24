import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconArrowDown, IconArrowUp, IconCommand, IconCornerDownLeft } from "@tabler/icons-react";
import { Kbd, KbdGroup } from "@masmeert/ui/kbd";

const meta = {
  title: "Forms/Kbd",
  component: Kbd,
  args: { children: "/" },
  argTypes: {
    children: { control: "text" },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Combination: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>
        <IconArrowUp />
      </Kbd>
      <Kbd>
        <IconArrowDown />
      </Kbd>
      <Kbd>
        <IconCornerDownLeft />
      </Kbd>
    </KbdGroup>
  ),
};

export const InText: Story = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      Press{" "}
      <KbdGroup>
        <Kbd>
          <IconCommand />
        </Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>{" "}
      to deploy the selected commit.
    </p>
  ),
};
