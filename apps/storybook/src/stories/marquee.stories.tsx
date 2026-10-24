import type { Meta, StoryObj } from "@storybook/react-vite";
import { Marquee, type MarqueeProps } from "@masmeert/ui/marquee";
import { CircleCheck, CircleX, GitCommitHorizontal, LoaderCircle } from "lucide-react";
import { typeClass } from "@masmeert/ui/lib/type-scale";

const deployments = [
  {
    service: "web-app",
    commit: "a3f9c1e",
    icon: <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    service: "api-gateway",
    commit: "7d02b4f",
    icon: <LoaderCircle className="size-4 animate-spin text-muted-foreground" />,
  },
  {
    service: "billing-worker",
    commit: "e81c5a9",
    icon: <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />,
  },
  { service: "docs", commit: "0b6f3d2", icon: <CircleX className="size-4 text-destructive" /> },
  {
    service: "auth-service",
    commit: "5c7e1aa",
    icon: <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    service: "search-indexer",
    commit: "9fd40b3",
    icon: <LoaderCircle className="size-4 animate-spin text-muted-foreground" />,
  },
];

const meta = {
  title: "Motion/Marquee",
  component: Marquee,
  args: {
    children: null,
    direction: "left",
    speed: 30,
    pauseOnHover: true,
    gap: "1rem",
    fade: true,
  },
  argTypes: {
    children: { control: false },
    direction: { control: "inline-radio", options: ["left", "right", "up", "down"] },
    speed: { control: { type: "range", min: 5, max: 90, step: 1 } },
    pauseOnHover: { control: "boolean" },
    gap: { control: "text" },
    fade: { control: "boolean" },
  },
  render: function DeploymentMarquee(args: MarqueeProps) {
    return (
      <Marquee
        {...args}
        className={
          args.direction === "up" || args.direction === "down"
            ? "h-64 w-72"
            : "w-[36rem] max-w-full"
        }
      >
        {deployments.map((deployment) => (
          <div
            key={deployment.service}
            className={`flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 whitespace-nowrap ${typeClass("body")}`}
          >
            {deployment.icon}
            <span className="font-semibold">{deployment.service}</span>
            <span
              className={`flex items-center gap-1 font-mono text-muted-foreground ${typeClass("caption")}`}
            >
              <GitCommitHorizontal className="size-3.5" />
              {deployment.commit}
            </span>
          </div>
        ))}
      </Marquee>
    );
  },
} satisfies Meta<typeof Marquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Reverse: Story = { args: { direction: "right", speed: 45 } };

export const Vertical: Story = { args: { direction: "up", gap: "0.5rem" } };

export const NoFade: Story = { args: { fade: false, pauseOnHover: false, speed: 15 } };
