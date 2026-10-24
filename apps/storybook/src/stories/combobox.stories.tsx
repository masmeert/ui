import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@masmeert/ui/combobox";

const meta = {
  title: "Inputs/Combobox",
  component: Combobox,
  args: {
    className: "w-72",
    disabled: false,
    size: "default",
    onValueChange: fn(),
    onOpenChange: fn(),
    children: (
      <>
        <ComboboxTrigger>
          <ComboboxInput placeholder="Search repositories…" aria-label="Repository" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList ariaLabel="Repositories">
            <ComboboxGroup>
              <ComboboxLabel>acme</ComboboxLabel>
              <ComboboxItem value="acme/api" keywords={["backend", "go"]}>
                acme/api
              </ComboboxItem>
              <ComboboxItem value="acme/web" keywords={["frontend", "next"]}>
                acme/web
              </ComboboxItem>
              <ComboboxItem value="acme/infra" keywords={["terraform"]}>
                acme/infra
              </ComboboxItem>
              <ComboboxItem value="acme/legacy-billing" disabled>
                acme/legacy-billing (archived)
              </ComboboxItem>
            </ComboboxGroup>
            <ComboboxSeparator />
            <ComboboxGroup>
              <ComboboxLabel>maya</ComboboxLabel>
              <ComboboxItem value="maya/dotfiles">maya/dotfiles</ComboboxItem>
              <ComboboxItem value="maya/deploy-bot" keywords={["slack"]}>
                maya/deploy-bot
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
          <ComboboxEmpty>
            No repositories match. Check the spelling or connect another org.
          </ComboboxEmpty>
        </ComboboxContent>
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
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: "acme/web" } };

export const Filtered: Story = { args: { defaultOpen: true, defaultQuery: "infra" } };

export const NoResults: Story = { args: { defaultOpen: true, defaultQuery: "kubernetes" } };

export const Compact: Story = { args: { defaultValue: "acme/web", size: "compact" } };

export const Disabled: Story = { args: { defaultValue: "acme/api", disabled: true } };
