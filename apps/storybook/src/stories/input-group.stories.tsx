import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconArrowUp, IconCheck, IconCopy, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@masmeert/ui/input-group";
import { Button } from "@masmeert/ui/button";

const meta = {
  title: "Inputs/Input Group",
  component: InputGroup,
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
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
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIcon: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Search environment variables"
        aria-label="Search environment variables"
      />
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput defaultValue="acme-api" aria-label="Subdomain" className="pl-0.5" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.masscode.app</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

function CopyableDeployHook({ size }: { size?: "compact" | "default" | "large" }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <InputGroup size={size}>
      <InputGroupInput
        readOnly
        value="https://api.masscode.app/hooks/deploy/prj_7Hq2"
        aria-label="Deploy hook URL"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-inset"
          aria-label={copied ? "Copied" : "Copy deploy hook URL"}
          onClick={() => setCopied(true)}
        >
          {copied ? <IconCheck /> : <IconCopy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export const WithCopyButton: Story = {
  render: (args) => <CopyableDeployHook size={args.size} />,
};

/** Every step beside a button of the same step: the field and the button share a height. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["compact", "default", "large"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <InputGroup size={size}>
            <InputGroupAddon>
              <IconSearch />
            </InputGroupAddon>
            <InputGroupInput placeholder={`Search (${size})`} aria-label={`Search (${size})`} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>Go</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button size={size} variant="outline">
            Filter
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const WithTextarea: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupTextarea
        placeholder="Ask the agent to fix the failing build…"
        aria-label="Message the agent"
      />
      <InputGroupAddon align="block-end">
        <InputGroupText>claude-sonnet-4-5</InputGroupText>
        <InputGroupButton
          variant="primary"
          size="icon-inset"
          aria-label="Send message"
          className="ml-auto"
        >
          <IconArrowUp />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        defaultValue="acme api"
        aria-label="Subdomain"
        aria-invalid
        className="pl-0.5"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.masscode.app</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};
