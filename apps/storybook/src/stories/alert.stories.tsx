import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlert, GitPullRequest, Rocket } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@masmeert/ui/alert";
import { Button } from "@masmeert/ui/button";

type AlertProps = ComponentProps<typeof Alert>;

const meta = {
  title: "Display/Alert",
  component: Alert,
  args: { variant: "default" },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "destructive"] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeployQueuedAlert(props: AlertProps) {
  return (
    <Alert className="w-[28rem]" {...props}>
      <Rocket />
      <AlertTitle>Deploy queued</AlertTitle>
      <AlertDescription>
        main@4f2c91a ships to production once the 3 remaining checks pass.
      </AlertDescription>
    </Alert>
  );
}

function DeployFailedAlert(props: AlertProps) {
  return (
    <Alert className="w-[28rem]" {...props}>
      <CircleAlert />
      <AlertTitle>Deploy failed on build step</AlertTitle>
      <AlertDescription>
        <p>
          `pnpm build` exited with code 1 after 42s. Fix the type error in src/server.ts and push
          again.
        </p>
      </AlertDescription>
    </Alert>
  );
}

function ReviewRequestedAlert(props: AlertProps) {
  return (
    <Alert className="w-[28rem]" {...props}>
      <GitPullRequest />
      <AlertTitle>Review requested</AlertTitle>
      <AlertDescription>Ana asked you to review #482 “Stream thread output”.</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Open
        </Button>
      </AlertAction>
    </Alert>
  );
}

function TitleOnlyAlert(props: AlertProps) {
  return (
    <Alert className="w-[28rem]" {...props}>
      <AlertTitle>All 12 threads are up to date.</AlertTitle>
    </Alert>
  );
}

export const Default: Story = { render: DeployQueuedAlert };
export const Destructive: Story = { args: { variant: "destructive" }, render: DeployFailedAlert };
export const WithAction: Story = { render: ReviewRequestedAlert };
export const TitleOnly: Story = { render: TitleOnlyAlert };
