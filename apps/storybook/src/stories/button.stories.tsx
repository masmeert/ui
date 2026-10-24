import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExternalLink, Rocket, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ButtonLink, StatefulButton, type ButtonState } from "@masmeert/ui/button";
import { SizeProvider } from "@masmeert/ui/lib/size";

const meta = {
  title: "Inputs/Button",
  component: Button,
  args: { children: "Deploy", disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["compact", "default", "large", "icon"] },
    square: { control: "boolean" },
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
        <Rocket />
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
    children: <RotateCcw />,
  },
};

const steps = ["compact", "default", "large"] as const;

/** Every step, text and square. Icons pick up the step's size unless they set one. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {steps.map((step) => (
        <div key={step} className="flex items-center gap-2">
          <Button variant={args.variant} size={step}>
            <Rocket />
            Deploy
          </Button>
          <Button variant="outline" size={step} square aria-label="Redeploy">
            <RotateCcw />
          </Button>
          <Button variant="ghost" size={step}>
            Cancel
          </Button>
        </div>
      ))}
    </div>
  ),
};

/** A compact region: unset sizes and `size="icon"` follow the provider. */
export const CompactRegion: Story = {
  render: () => (
    <SizeProvider size="compact">
      <div className="flex items-center gap-1">
        <Button>
          <Rocket />
          Deploy
        </Button>
        <Button variant="outline">Promote</Button>
        <Button variant="ghost" size="icon" aria-label="Redeploy">
          <RotateCcw />
        </Button>
      </div>
    </SizeProvider>
  ),
};

export const Disabled: Story = { args: { disabled: true, children: "Deploying is paused" } };

export const Link: Story = {
  render: (args) => (
    <ButtonLink
      variant={args.variant}
      size={args.size}
      square={args.square}
      href="https://example.com/deployments/dpl_8f2a"
      target="_blank"
      rel="noreferrer"
    >
      View deployment
      <ExternalLink />
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
      icon={<Rocket />}
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
