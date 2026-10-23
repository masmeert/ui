import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollProgress, type ScrollProgressProps } from "@masmeert/ui/scroll-progress";
import { useScroll } from "motion/react";
import { useRef } from "react";

const meta = {
  title: "Motion/Scroll Progress",
  component: ScrollProgress,
  args: {
    variant: "bar",
    position: "top",
    height: 3,
    fixed: false,
    spring: true,
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["bar", "circle"] },
    position: { control: "inline-radio", options: ["top", "bottom"] },
    height: { control: { type: "range", min: 1, max: 12, step: 1 } },
    size: { control: { type: "range", min: 24, max: 96, step: 4 } },
    thickness: { control: { type: "range", min: 1, max: 8, step: 1 } },
    spring: { control: "boolean" },
    fixed: { control: false },
    progress: { control: false },
  },
  render: function ReleaseNotesProgress(args: ScrollProgressProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: scrollAreaRef });
    return (
      <div className="relative h-72 w-96 overflow-hidden rounded-2xl border border-border bg-background">
        <div ref={scrollAreaRef} className="h-full overflow-y-auto px-5 py-4">
          <h3 className="text-sm font-semibold">Release notes · v2.15.0</h3>
          {[
            [
              "Deploys",
              "Preview deployments now build in parallel with production, cutting median wait time from 3m 40s to 1m 55s.",
            ],
            [
              "Billing",
              "Usage-based tiers replace seat pricing for teams over 25 members. Existing plans migrate on renewal.",
            ],
            [
              "CLI",
              "`ship logs --follow` streams build output in real time and exits with the build's status code.",
            ],
            [
              "Integrations",
              "GitHub checks now link straight to the failing step instead of the run overview.",
            ],
            [
              "Security",
              "Personal access tokens expire after 90 days by default. Admins can shorten or extend the limit.",
            ],
            [
              "Fixes",
              "Webhook deliveries retry with backoff, and the dashboard no longer double-counts cancelled builds.",
            ],
          ].map(([heading, body]) => (
            <section key={heading} className="mt-4">
              <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {heading}
              </h4>
              <p className="mt-1 text-sm leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
        {args.variant === "circle" ? (
          <div className="absolute right-3 bottom-3">
            <ScrollProgress {...args} progress={scrollYProgress} />
          </div>
        ) : (
          <ScrollProgress {...args} progress={scrollYProgress} />
        )}
      </div>
    );
  },
} satisfies Meta<typeof ScrollProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = {};

export const BottomBar: Story = { args: { position: "bottom", height: 4, spring: false } };

export const Circle: Story = { args: { variant: "circle", size: 40, thickness: 3 } };
