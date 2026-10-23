import { Fragment, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronRight, GitBranch, GitPullRequest, Rocket } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@masmeert/ui/avatar";
import { Badge } from "@masmeert/ui/badge";
import { Button } from "@masmeert/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@masmeert/ui/item";

type ItemProps = ComponentProps<typeof Item>;

const threads = [
  {
    id: "t1",
    title: "Stream thread output to the sidebar",
    branch: "feat/stream-output",
    author: "gaearon",
  },
  {
    id: "t2",
    title: "Fix flaky keep-awake test",
    branch: "fix/keep-awake",
    author: "sindresorhus",
  },
  {
    id: "t3",
    title: "Migrate settings to SQLite",
    branch: "chore/sqlite-settings",
    author: "torvalds",
  },
];

const meta = {
  title: "Display/Item",
  component: Item,
  args: { variant: "default", size: "default" },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outline", "muted"] },
    size: { control: "inline-radio", options: ["default", "sm", "xs"] },
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeployItem(props: ItemProps) {
  return (
    <Item className="w-[28rem]" {...props}>
      <ItemMedia variant="icon">
        <Rocket />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Production deploy</ItemTitle>
        <ItemDescription>main@4f2c91a · built in 1m 12s · 4 minutes ago</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Logs
        </Button>
      </ItemActions>
    </Item>
  );
}

function PullRequestLinkItem(props: ItemProps) {
  return (
    <Item className="w-[28rem]" render={<a href="#pull-482" />} {...props}>
      <ItemMedia>
        <GitPullRequest className="size-4" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          #482 Stream thread output{" "}
          <Badge size="sm" status="info">
            Open
          </Badge>
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <ChevronRight className="size-4 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
}

function ThreadList(props: ItemProps) {
  return (
    <ItemGroup className="w-[28rem] rounded-lg border">
      {threads.map((thread, index) => (
        <Fragment key={thread.id}>
          {index > 0 && <ItemSeparator />}
          <Item {...props}>
            <ItemMedia variant="image">
              <Avatar>
                <AvatarImage src={`https://github.com/${thread.author}.png`} alt={thread.author} />
                <AvatarFallback>{thread.author.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{thread.title}</ItemTitle>
              <ItemDescription className="flex items-center gap-1 font-mono text-xs">
                <GitBranch className="size-3" />
                {thread.branch}
              </ItemDescription>
            </ItemContent>
          </Item>
        </Fragment>
      ))}
    </ItemGroup>
  );
}

export const Default: Story = { render: DeployItem };
export const Outline: Story = { args: { variant: "outline" }, render: DeployItem };
export const Muted: Story = { args: { variant: "muted", size: "sm" }, render: DeployItem };
export const AsLink: Story = {
  args: { variant: "outline", size: "sm" },
  render: PullRequestLinkItem,
};
export const Group: Story = { args: { size: "sm" }, render: ThreadList };
