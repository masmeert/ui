import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectInput,
  MultiSelectItem,
  MultiSelectLabel,
  MultiSelectList,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@masmeert/ui/multi-select";

const meta = {
  title: "Inputs/Multi Select",
  component: MultiSelect,
  args: {
    className: "w-80",
    disabled: false,
    size: "default",
    onValueChange: fn(),
    onOpenChange: fn(),
    children: (
      <>
        <MultiSelectTrigger>
          {/* The input shows its own placeholder while empty; a second one here would print twice. */}
          <MultiSelectValue placeholder={null} />
          <MultiSelectInput placeholder="Add reviewers…" aria-label="Reviewers" />
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectList ariaLabel="Teammates">
            <MultiSelectGroup>
              <MultiSelectLabel>Platform team</MultiSelectLabel>
              <MultiSelectItem value="maya" keywords={["maya@acme.dev"]}>
                Maya Chen
              </MultiSelectItem>
              <MultiSelectItem value="jonas" keywords={["jonas@acme.dev"]}>
                Jonas Weber
              </MultiSelectItem>
              <MultiSelectItem value="priya" keywords={["priya@acme.dev"]}>
                Priya Raman
              </MultiSelectItem>
            </MultiSelectGroup>
            <MultiSelectSeparator />
            <MultiSelectGroup>
              <MultiSelectLabel>Web team</MultiSelectLabel>
              <MultiSelectItem value="lucas" keywords={["lucas@acme.dev"]}>
                Lucas Moreau
              </MultiSelectItem>
              <MultiSelectItem value="sofia" keywords={["sofia@acme.dev"]} disabled>
                Sofia Rossi (on leave)
              </MultiSelectItem>
            </MultiSelectGroup>
          </MultiSelectList>
          <MultiSelectEmpty>
            No teammates match. Invite them to the workspace first.
          </MultiSelectEmpty>
        </MultiSelectContent>
      </>
    ),
  },
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    children: { control: false },
  },
  decorators: [
    function RoomForPanel(Story) {
      return (
        <div className="flex h-96 items-start">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValues: Story = { args: { defaultValue: ["maya", "jonas"] } };

export const Open: Story = { args: { defaultValue: ["priya"], defaultOpen: true } };

export const Compact: Story = { args: { defaultValue: ["maya", "jonas"], size: "compact" } };

export const Disabled: Story = { args: { defaultValue: ["maya", "lucas"], disabled: true } };
