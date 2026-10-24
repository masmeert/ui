import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ThinkingStep, ThinkingSteps } from "@masmeert/ui/thinking-steps";
import { type ComponentProps, useEffect, useState } from "react";

const meta = {
  title: "AI/Thinking Steps",
  component: ThinkingSteps,
  parameters: { layout: "padded" },
  args: { steps: [] },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    showPending: { control: "boolean" },
    autoCollapse: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThinkingSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

const PLAN: Omit<ThinkingStep, "status">[] = [
  {
    id: "read",
    title: "Reading src/workers/meter.ts",
    detail: (
      <p>
        <code>recordUsage</code> inserts one row per call and has no idempotency key.
      </p>
    ),
  },
  {
    id: "trace",
    title: "Tracing recordUsage call sites",
    detail: (
      <ul>
        <li>api/routes/usage.ts: on every request</li>
        <li>workers/retry.ts: on every retried job</li>
      </ul>
    ),
  },
  { id: "tests", title: "Running the meter test suite" },
  {
    id: "plan",
    title: "Drafting the fix",
    detail: <p>Key on request id + billing period, upsert instead of insert.</p>,
  },
];

function useSimulatedSteps(stepMs = 1400) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (progress > PLAN.length) return;
    const timer = window.setTimeout(() => setProgress((p) => p + 1), stepMs);
    return () => window.clearTimeout(timer);
  }, [progress, stepMs]);
  const steps: ThinkingStep[] = PLAN.map((step, index) => ({
    ...step,
    status: index < progress ? "done" : index === progress ? "active" : "pending",
  }));
  return { steps, restart: () => setProgress(0) };
}

export const Live: Story = {
  render: function Live(args) {
    const [run, setRun] = useState(0);
    return (
      <div className="flex flex-col items-start gap-4">
        <LiveSteps key={run} {...args} />
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1.5 text-muted-foreground hover:bg-hover"
          onClick={() => setRun((r) => r + 1)}
        >
          Replay
        </button>
      </div>
    );
  },
};

function LiveSteps(args: Omit<ComponentProps<typeof ThinkingSteps>, "steps">) {
  const { steps } = useSimulatedSteps();
  return <ThinkingSteps {...args} steps={steps} />;
}

export const WithPending: Story = {
  args: { showPending: true },
  render: (args) => <LiveSteps {...args} />,
};

export const Done: Story = {
  args: {
    defaultOpen: true,
    duration: 12,
    steps: PLAN.map((step) => ({ ...step, status: "done" as const })),
  },
};

export const Collapsed: Story = {
  args: {
    duration: 74,
    steps: PLAN.map((step) => ({ ...step, status: "done" as const })),
  },
};
