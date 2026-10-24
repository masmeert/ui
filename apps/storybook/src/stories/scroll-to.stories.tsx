import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollTo, type ScrollToProps } from "@masmeert/ui/scroll-to";
import { SmoothScroll } from "@masmeert/ui/smooth-scroll";
import { IconArrowUp } from "@tabler/icons-react";
import { useId } from "react";

const meta = {
  title: "Motion/Scroll To",
  component: ScrollTo,
  args: {
    to: 0,
    offset: 0,
    children: "Back to top",
  },
  argTypes: {
    to: { control: "number" },
    offset: { control: { type: "range", min: -120, max: 120, step: 4 } },
    duration: { control: { type: "range", min: 0.2, max: 4, step: 0.1 } },
    children: { control: "text" },
  },
  render: function RunbookNavigation(args: ScrollToProps) {
    // React's ids are valid CSS identifiers, so they work as `#id` selectors for both Lenis and the native fallback.
    const sectionIdPrefix = useId();
    return (
      <SmoothScroll
        root={false}
        className="relative h-72 w-96 overflow-y-auto rounded-2xl border border-border bg-background"
      >
        <nav className="sticky top-0 z-10 flex gap-1 border-b border-border bg-background/90 p-2 backdrop-blur">
          {["Setup", "Deploy", "Rollback", "Alerts"].map((section) => (
            <ScrollTo
              key={section}
              {...args}
              to={`#${sectionIdPrefix}-${section.toLowerCase()}`}
              className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {section}
            </ScrollTo>
          ))}
        </nav>
        {[
          [
            "Setup",
            "Install the CLI with `npm i -g @acme/ship`, then run `ship login` and link the repository with `ship link`. Environment variables live in the project settings, never in the repo.",
          ],
          [
            "Deploy",
            "Pushing to main triggers a production build. Every other branch gets a preview URL. Promote a preview with `ship promote <deployment-id>` once checks pass.",
          ],
          [
            "Rollback",
            "Run `ship rollback` to point production at the previous ready deployment. It takes effect in seconds because nothing is rebuilt; the bad build stays available for debugging.",
          ],
          [
            "Alerts",
            "Error-rate and latency alerts post to #deploys. Acknowledge them in Slack so the on-call rotation knows someone is on it, and link the incident doc in the thread.",
          ],
        ].map(([section, body]) => (
          <section
            key={section}
            id={`${sectionIdPrefix}-${section.toLowerCase()}`}
            className="min-h-48 px-5 py-4"
          >
            <h3 className="text-sm font-semibold">{section}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
        <div className="flex justify-center px-5 pt-2 pb-5">
          <ScrollTo
            {...args}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <IconArrowUp className="size-3.5" />
            {args.children}
          </ScrollTo>
        </div>
      </SmoothScroll>
    );
  },
} satisfies Meta<typeof ScrollTo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClearStickyHeader: Story = { args: { offset: -48 } };

export const SlowEase: Story = { args: { offset: -48, duration: 2.5 } };
