import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Database, GitCommitHorizontal, Globe, Lock, Server } from "lucide-react";
import { Badge } from "@masmeert/ui/badge";
import { Button } from "@masmeert/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardGrid,
  CardHeader,
  CardTitle,
} from "@masmeert/ui/card";

type CardProps = ComponentProps<typeof Card>;

const meta = {
  title: "Display/Card",
  component: Card,
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "compact"] },
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
          <Badge size="compact" status="success">
            Live
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
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
        <Button size="compact">View logs</Button>
        <Button size="compact" variant="ghost">
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
      <CardContent className="text-muted-foreground">
        Moved preference reads behind a repository, added a one-time import from the JSON file, and
        kept the old file as a backup until the next release.
      </CardContent>
      <CardFooter className="justify-between border-t text-muted-foreground">
        <span>Updated 12m ago</span>
        <Button size="compact" variant="outline">
          Open thread
        </Button>
      </CardFooter>
    </Card>
  );
}

export const Default: Story = { render: DeployCard };
export const Compact: Story = { args: { size: "compact" }, render: CommitCard };
export const WithDividers: Story = { render: ThreadSummaryCard };

const services = [
  { icon: Globe, name: "web", detail: "Next.js · fra1 · 3 instances" },
  { icon: Server, name: "api", detail: "Node 22 · fra1 · 2 instances" },
  { icon: Database, name: "postgres", detail: "16.4 · 10 GB · daily backups" },
  { icon: Lock, name: "auth", detail: "Edge function · global" },
];

/**
 * A grid of link cards with one fluid hover tint: it glides between cards, and a
 * click in a gutter (within 16px) opens the lit card.
 */
export const Grid: Story = {
  render: (args) => (
    <CardGrid className="w-[40rem] grid-cols-2">
      {services.map(({ icon: Icon, name, detail }) => (
        <Card
          key={name}
          size={args.size}
          render={
            // biome-ignore lint/a11y/useAnchorContent: the card's children are the anchor's content.
            <a href={`#${name}`} />
          }
          className="outline-none focus-visible:ring-4 focus-visible:ring-ring"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              {name}
            </CardTitle>
            <CardDescription>{detail}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </CardGrid>
  ),
};
