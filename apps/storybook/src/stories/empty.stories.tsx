import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessagesSquare, Rocket, SearchX } from "lucide-react";
import { Button } from "@masmeert/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@masmeert/ui/empty";

type EmptyProps = ComponentProps<typeof Empty>;

const meta = {
  title: "Display/Empty",
  component: Empty,
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

function NoThreadsEmpty(props: EmptyProps) {
  return (
    <Empty className="w-[32rem]" {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessagesSquare />
        </EmptyMedia>
        <EmptyTitle>No threads yet</EmptyTitle>
        <EmptyDescription>
          Start a thread to hand a task to an agent. It works in its own branch until you merge.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>New thread</Button>
      </EmptyContent>
    </Empty>
  );
}

function NoSearchResultsEmpty(props: EmptyProps) {
  return (
    <Empty className="w-[32rem]" {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No commits match “refactor auth”</EmptyTitle>
        <EmptyDescription>
          Try a shorter query, or <a href="#all-branches">search all branches</a>.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function NoDeploysEmpty(props: EmptyProps) {
  return (
    <Empty className="w-[32rem] border" {...props}>
      <EmptyHeader>
        <EmptyMedia>
          <Rocket className="size-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>Nothing deployed to staging</EmptyTitle>
        <EmptyDescription>Push to the staging branch or promote a preview deploy.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button size="compact">Promote preview</Button>
        <Button size="compact" variant="outline">
          Read the docs
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export const Default: Story = { render: NoThreadsEmpty };
export const SearchResults: Story = { render: NoSearchResultsEmpty };
export const Outlined: Story = { render: NoDeploysEmpty };
