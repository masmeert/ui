import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, GitBranch, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@masmeert/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@masmeert/ui/button-group";

const meta = {
  title: "Inputs/Button Group",
  component: ButtonGroup,
  args: { orientation: "horizontal" },
  argTypes: {
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

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <ButtonGroup {...args} aria-label="Pipeline controls">
      <Button variant="outline">
        <Play className="size-4" />
        Resume pipeline
      </Button>
      <Button variant="outline">
        <Pause className="size-4" />
        Pause pipeline
      </Button>
      <Button variant="outline">
        <RotateCcw className="size-4" />
        Retry failed jobs
      </Button>
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>
        <GitBranch />
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
        <ChevronDown className="size-4" />
      </Button>
    </ButtonGroup>
  ),
};
