import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GitPullRequest } from "lucide-react";
import { Avatar, AvatarFallback } from "@masmeert/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@masmeert/ui/hover-card";
import { typeClass } from "@masmeert/ui/lib/type-scale";

const meta = {
  title: "Overlays/Hover Card",
  component: HoverCardContent,
  args: { side: "bottom", align: "center", sideOffset: 4 },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    sideOffset: { control: { type: "range", min: 0, max: 24, step: 1 } },
  },
} satisfies Meta<typeof HoverCardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

function MentionHoverCard(props: ComponentProps<typeof HoverCardContent>) {
  return (
    <p className={`${typeClass("body")} text-muted-foreground`}>
      Assigned to{" "}
      <HoverCard>
        <HoverCardTrigger
          href="#"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          @ada
        </HoverCardTrigger>
        <HoverCardContent {...props}>
          <div className="flex gap-3">
            <Avatar size="large">
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className={`${typeClass("body")} font-medium text-foreground`}>Ada Lovelace</p>
              <p className={`${typeClass("caption")} text-muted-foreground`}>
                Maintainer · masscode
              </p>
              <p className={`${typeClass("caption")} text-muted-foreground`}>7 open threads</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{" "}
      for review.
    </p>
  );
}

function PullRequestHoverCard(props: ComponentProps<typeof HoverCardContent>) {
  return (
    <HoverCard>
      <HoverCardTrigger
        href="#"
        className={`inline-flex items-center gap-1.5 ${typeClass("body")} font-medium text-foreground underline-offset-4 hover:underline`}
      >
        <GitPullRequest className="size-4 text-muted-foreground" />
        #21
      </HoverCardTrigger>
      <HoverCardContent {...props} className="w-80">
        <div className="flex flex-col gap-2">
          <p className={`${typeClass("caption")} text-muted-foreground`}>masmeert/masscode</p>
          <p className={`${typeClass("body")} font-medium text-foreground`}>
            chore(main): release 0.1.11
          </p>
          <p className={`${typeClass("caption")} text-muted-foreground`}>
            Opened by release-please · 3 commits · checks passing
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export const Mention: Story = {
  render: (args) => <MentionHoverCard {...args} />,
};

export const PullRequest: Story = {
  args: { align: "start" },
  render: (args) => <PullRequestHoverCard {...args} />,
};

export const Top: Story = {
  args: { side: "top" },
  render: (args) => <MentionHoverCard {...args} />,
};
