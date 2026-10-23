import type { Meta, StoryObj } from "@storybook/react-vite";
import { Columns3, List, Rows3 } from "lucide-react";
import { fn } from "storybook/test";
import { ToggleGroup, ToggleGroupItem } from "@masmeert/ui/toggle-group";

const meta = {
  title: "Inputs/Toggle Group",
  component: ToggleGroup,
  args: {
    "aria-label": "Time range",
    defaultValue: ["24h"],
    variant: "default",
    size: "default",
    orientation: "horizontal",
    multiple: false,
    disabled: false,
    onValueChange: fn(),
    children: (
      <>
        <ToggleGroupItem value="1h">1h</ToggleGroupItem>
        <ToggleGroupItem value="24h">24h</ToggleGroupItem>
        <ToggleGroupItem value="7d">7d</ToggleGroupItem>
        <ToggleGroupItem value="30d">30d</ToggleGroupItem>
      </>
    ),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outline"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: false },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const Multiple: Story = {
  args: {
    "aria-label": "Log levels",
    multiple: true,
    defaultValue: ["error", "warn"],
    children: (
      <>
        <ToggleGroupItem value="error">Errors</ToggleGroupItem>
        <ToggleGroupItem value="warn">Warnings</ToggleGroupItem>
        <ToggleGroupItem value="info">Info</ToggleGroupItem>
        <ToggleGroupItem value="debug">Debug</ToggleGroupItem>
      </>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    "aria-label": "Layout",
    defaultValue: ["list"],
    children: (
      <>
        <ToggleGroupItem value="list" aria-label="List">
          <List />
        </ToggleGroupItem>
        <ToggleGroupItem value="table" aria-label="Table">
          <Rows3 />
        </ToggleGroupItem>
        <ToggleGroupItem value="board" aria-label="Board">
          <Columns3 />
        </ToggleGroupItem>
      </>
    ),
  },
};

export const Disabled: Story = { args: { disabled: true } };
