import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUp, Check, Copy, Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@masmeert/ui/input-group";

const meta = {
  title: "Inputs/Input Group",
  component: InputGroup,
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
        <Search />
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

function CopyableDeployHook() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <InputGroup>
      <InputGroupInput
        readOnly
        value="https://api.masscode.app/hooks/deploy/prj_7Hq2"
        aria-label="Deploy hook URL"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label={copied ? "Copied" : "Copy deploy hook URL"}
          onClick={() => setCopied(true)}
        >
          {copied ? <Check /> : <Copy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export const WithCopyButton: Story = {
  render: () => <CopyableDeployHook />,
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
          size="icon-sm"
          aria-label="Send message"
          className="ml-auto"
        >
          <ArrowUp />
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
