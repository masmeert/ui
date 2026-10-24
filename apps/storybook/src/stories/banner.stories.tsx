import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Banner, type BannerProps, type BannerStatus } from "@masmeert/ui/banner";
import { Button } from "@masmeert/ui/button";

const STATUSES: BannerStatus[] = ["info", "success", "warning", "error", "neutral"];

const COPY: Record<BannerStatus, { title: string; description: string }> = {
  info: {
    title: "Scheduled maintenance on Sunday",
    description: "Deploys pause from 02:00 to 03:00 UTC while we upgrade the build fleet.",
  },
  success: {
    title: "Domain verified",
    description: "acme.dev now serves your production deployment over HTTPS.",
  },
  warning: {
    title: "Usage at 92% of your plan",
    description: "Builds queue once you reach the limit. Upgrade or wait for the next cycle.",
  },
  error: {
    title: "Payment failed",
    description:
      "We couldn't charge the card ending in 4242. Update it to keep your projects online.",
  },
  neutral: {
    title: "New: preview comments",
    description: "Reviewers can now leave comments straight on a preview deployment.",
  },
};

const meta = {
  title: "Feedback/Banner",
  component: Banner,
  args: {
    status: "info",
    contrast: "subtle",
    position: "inline",
    dismissible: true,
    onDismiss: fn(),
    ...COPY.info,
  },
  argTypes: {
    status: { control: "inline-radio", options: STATUSES },
    contrast: { control: "inline-radio", options: ["subtle", "strong"] },
    position: { control: "inline-radio", options: ["inline", "top"] },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    actions: { control: false },
    icon: { control: false },
  },
  render: (args: BannerProps) => (
    <div className="w-[min(40rem,90vw)]">
      <Banner {...args} />
    </div>
  ),
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    status: "error",
    ...COPY.error,
    actions: (
      <Button size="compact" variant="secondary">
        Update card
      </Button>
    ),
  },
};

function Matrix({ contrast }: { contrast: BannerProps["contrast"] }) {
  return (
    <div className="flex w-[min(40rem,90vw)] flex-col gap-3">
      {STATUSES.map((status) => (
        <Banner key={status} status={status} contrast={contrast} dismissible {...COPY[status]} />
      ))}
    </div>
  );
}

export const Subtle: Story = { render: () => <Matrix contrast="subtle" /> };

export const Strong: Story = { render: () => <Matrix contrast="strong" /> };

/** Dismiss one: the banner folds shut and the ones below close the gap. */
export const DismissStack: Story = {
  render: function DismissStack() {
    const [round, setRound] = useState(0);
    return (
      <div className="flex w-[min(40rem,90vw)] flex-col">
        <div key={round} className="flex flex-col">
          {STATUSES.map((status) => (
            // Spacing lives inside the fold, so a closing banner takes its gap with it.
            <Banner
              key={status}
              status={status}
              dismissible
              containerClassName="pb-3"
              {...COPY[status]}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Content below the banners.</p>
        <Button
          size="compact"
          variant="ghost"
          className="mt-3 self-start"
          onClick={() => setRound(round + 1)}
        >
          Reset
        </Button>
      </div>
    );
  },
};

/** Fixed to the top of the viewport; the page underneath doesn't move. */
export const Top: Story = {
  args: { position: "top", contrast: "strong", status: "neutral", ...COPY.neutral },
  render: (args) => (
    <div className="w-[min(40rem,90vw)] pt-24 text-sm text-muted-foreground">
      <Banner {...args} />
      The banner sits over the top of the page. Dismiss it and nothing here moves.
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[min(40rem,90vw)] flex-col gap-3">
      {(["compact", "default", "large"] as const).map((size) => (
        <Banner key={size} size={size} status="success" dismissible {...COPY.success} />
      ))}
    </div>
  ),
};
