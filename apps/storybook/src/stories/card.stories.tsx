import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GitCommitHorizontal } from "lucide-react";
import { Badge } from "@masmeert/ui/badge";
import { Button } from "@masmeert/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@masmeert/ui/card";

type CardProps = ComponentProps<typeof Card>;

const meta = {
  title: "Display/Card",
  component: Card,
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeployCard(props: CardProps) {
  return (
    <Card className="w-96" {...props}>
      <CardHeader>
        <CardTitle>Production deploy</CardTitle>
        <CardDescription>main@4f2c91a · triggered by Massimo 4 minutes ago</CardDescription>
        <CardAction>
          <Badge size="sm" status="success">
            Live
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Build</div>
          <div className="font-mono tabular-nums">1m 12s</div>
        </div>
        <div>
          <div className="text-muted-foreground">Region</div>
          <div className="font-mono">fra1</div>
        </div>
        <div>
          <div className="text-muted-foreground">Bundle</div>
          <div className="font-mono tabular-nums">412 kB</div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">View logs</Button>
        <Button size="sm" variant="ghost">
          Roll back
        </Button>
      </CardFooter>
    </Card>
  );
}

function CommitCard(props: CardProps) {
  return (
    <Card className="w-80" {...props}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommitHorizontal className="size-4 text-muted-foreground" />
          fix(web): hide the countdown
        </CardTitle>
        <CardDescription>fa70ddc · 2 files changed, 14 insertions</CardDescription>
      </CardHeader>
    </Card>
  );
}

function ThreadSummaryCard(props: CardProps) {
  return (
    <Card className="w-96" {...props}>
      <CardHeader className="border-b">
        <CardTitle>Migrate settings to SQLite</CardTitle>
        <CardDescription>Thread · 23 messages · 6 tool calls</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Moved preference reads behind a repository, added a one-time import from the JSON file, and
        kept the old file as a backup until the next release.
      </CardContent>
      <CardFooter className="justify-between border-t text-sm text-muted-foreground">
        <span>Updated 12m ago</span>
        <Button size="sm" variant="outline">
          Open thread
        </Button>
      </CardFooter>
    </Card>
  );
}

export const Default: Story = { render: DeployCard };
export const Small: Story = { args: { size: "sm" }, render: CommitCard };
export const WithDividers: Story = { render: ThreadSummaryCard };
