import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollReveal, type ScrollRevealProps } from "@masmeert/ui/scroll-reveal";
import { useRef } from "react";

const meta = {
  title: "Motion/Scroll Reveal",
  component: ScrollReveal,
  args: {
    children: null,
    y: 16,
    blur: 8,
    delaySeconds: 0,
    once: true,
    amount: 0.3,
  },
  argTypes: {
    children: { control: false },
    root: { control: false },
    y: { control: { type: "range", min: 0, max: 80, step: 2 } },
    blur: { control: { type: "range", min: 0, max: 10, step: 1 } },
    delaySeconds: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    once: { control: "boolean" },
    amount: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
  render: function CommitHistory(args: ScrollRevealProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={scrollAreaRef}
        className="h-72 w-96 overflow-y-auto rounded-2xl border border-border bg-background p-3"
      >
        <p className="px-2 pt-1 pb-3 text-xs text-muted-foreground">Scroll the commit history</p>
        <div className="flex flex-col gap-2">
          {[
            ["a3f9c1e", "Add usage-based billing tiers", "Massimo Meert", "2m ago"],
            ["7d02b4f", "Cache dependency installs in CI", "Lena Park", "18m ago"],
            ["e81c5a9", "Fix session timeout on token refresh", "Sam Okafor", "1h ago"],
            ["0b6f3d2", "Document the deploy hooks API", "Lena Park", "3h ago"],
            ["5c7e1aa", "Bump TypeScript to 5.9", "Renovate", "5h ago"],
            ["9fd40b3", "Split search indexer into workers", "Massimo Meert", "yesterday"],
            ["c41e7f8", "Retry failed webhook deliveries", "Sam Okafor", "yesterday"],
            ["18ab2d5", "Drop legacy v1 auth endpoints", "Lena Park", "2 days ago"],
            ["f2e6c90", "Add audit log export", "Massimo Meert", "3 days ago"],
            ["6d7a3b1", "Initial commit", "Massimo Meert", "last month"],
          ].map(([sha, message, author, time]) => (
            <ScrollReveal key={sha} {...args} root={scrollAreaRef}>
              <div className="rounded-xl border border-border bg-card px-3 py-2.5">
                <p className="truncate text-sm font-medium">{message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="font-mono">{sha}</span> · {author} · {time}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    );
  },
} satisfies Meta<typeof ScrollReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EveryTime: Story = { args: { once: false } };

export const LongSlide: Story = { args: { y: 48, blur: 0 } };
