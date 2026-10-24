import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  IconChevronDown,
  IconGitBranch,
  IconPlayerPause,
  IconPlayerPlay,
  IconRotate,
} from "@tabler/icons-react";
import { Button } from "@masmeert/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@masmeert/ui/button-group";

const meta = {
  title: "Inputs/Button Group",
  component: ButtonGroup,
  args: { orientation: "horizontal" },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args} aria-label="Deployment actions">
      <Button variant="outline">Redeploy</Button>
      <Button variant="outline">Promote</Button>
      <Button variant="outline">Roll back</Button>
    </ButtonGroup>
  ),
};

export const Compact: Story = {
  args: { size: "compact" },
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>
        <IconGitBranch />
        main
      </ButtonGroupText>
      <Button variant="outline">Switch branch</Button>
      <Button variant="outline" size="icon" aria-label="Retry">
        <IconRotate />
      </Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <ButtonGroup {...args} aria-label="Pipeline controls">
      <Button variant="outline">
        <IconPlayerPlay className="size-4" />
        Resume pipeline
      </Button>
      <Button variant="outline">
        <IconPlayerPause className="size-4" />
        Pause pipeline
      </Button>
      <Button variant="outline">
        <IconRotate className="size-4" />
        Retry failed jobs
      </Button>
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>
        <IconGitBranch />
        main
      </ButtonGroupText>
      <Button variant="outline">Switch branch</Button>
    </ButtonGroup>
  ),
};

export const SplitButton: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Deploy</Button>
      <ButtonGroupSeparator />
      <Button className="px-3" aria-label="More deploy options" aria-haspopup="menu">
        <IconChevronDown className="size-4" />
      </Button>
    </ButtonGroup>
  ),
};
