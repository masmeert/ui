import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExternalLink, Rocket, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ButtonLink, StatefulButton, type ButtonState } from "@masmeert/ui/button";

const meta = {
  title: "Inputs/Button",
  component: Button,
  args: { children: "Deploy", disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Rocket className="size-4" />
        Deploy to production
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: "outline",
    size: "icon",
    "aria-label": "Redeploy",
    children: <RotateCcw className="size-4" />,
  },
};

export const Disabled: Story = { args: { disabled: true, children: "Deploying is paused" } };

export const Link: Story = {
  render: (args) => (
    <ButtonLink
      variant={args.variant}
      size={args.size}
      href="https://example.com/deployments/dpl_8f2a"
      target="_blank"
      rel="noreferrer"
    >
      View deployment
      <ExternalLink className="size-4" />
    </ButtonLink>
  ),
  args: { variant: "secondary" },
};

function SimulatedDeployButton({ failing }: { failing: boolean }) {
  const [state, setState] = useState<ButtonState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timeout = setTimeout(
      () => setState(state === "loading" ? (failing ? "error" : "success") : "idle"),
      state === "loading" ? 1500 : 2000,
    );
    return () => clearTimeout(timeout);
  }, [state, failing]);

  return (
    <StatefulButton
      state={state}
      loadingText="Deploying"
      successText="Deployed"
      errorText="Deploy failed"
      icon={<Rocket className="size-4" />}
      onClick={() => setState("loading")}
    >
      Deploy
    </StatefulButton>
  );
}

export const Stateful: Story = {
  render: () => <SimulatedDeployButton failing={false} />,
};

export const StatefulFailure: Story = {
  render: () => <SimulatedDeployButton failing />,
};
