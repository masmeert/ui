import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { FunnelChart, FunnelChartPlot, type FunnelStage } from "@masmeert/ui/funnel-chart";

type FunnelChartProps = ComponentProps<typeof FunnelChart>;

const onboardingThisWeek: FunnelStage[] = [
  { id: "signed-up", label: "Signed up", value: 4820 },
  { id: "connected-repo", label: "Connected a repo", value: 3175 },
  { id: "first-thread", label: "Started a thread", value: 2210 },
  { id: "merged", label: "Merged an agent PR", value: 1236 },
  { id: "invited", label: "Invited a teammate", value: 418 },
];

const onboardingLastWeek: FunnelStage[] = [
  { id: "signed-up", label: "Signed up", value: 4105 },
  { id: "connected-repo", label: "Connected a repo", value: 2290 },
  { id: "first-thread", label: "Started a thread", value: 1702 },
  { id: "merged", label: "Merged an agent PR", value: 744 },
  { id: "invited", label: "Invited a teammate", value: 301 },
];

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const meta = {
  title: "Data/Funnel Chart",
  component: FunnelChart,
  args: {
    stages: onboardingThisWeek,
    direction: "vertical",
    unit: "developers",
    label: "Onboarding funnel",
    className: "w-[32rem]",
  },
  argTypes: {
    direction: { control: "inline-radio", options: ["vertical", "horizontal"] },
    children: { control: false },
    formatValue: { control: false },
  },
} satisfies Meta<typeof FunnelChart>;

export default meta;
type Story = StoryObj<typeof meta>;

function WeekComparison(props: FunnelChartProps) {
  const [showingThisWeek, setShowingThisWeek] = useState(true);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={showingThisWeek ? "secondary" : "ghost"}
          onClick={() => setShowingThisWeek(true)}
        >
          This week
        </Button>
        <Button
          size="sm"
          variant={showingThisWeek ? "ghost" : "secondary"}
          onClick={() => setShowingThisWeek(false)}
        >
          Last week
        </Button>
      </div>
      <FunnelChart {...props} stages={showingThisWeek ? onboardingThisWeek : onboardingLastWeek} />
    </div>
  );
}

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: { direction: "horizontal", className: "w-[44rem]" },
};

export const CompactValues: Story = {
  args: {
    label: "Deploy pipeline",
    unit: "commits",
    formatValue: (value) => compactNumber.format(value),
    stages: [
      { id: "pushed", label: "Pushed", value: 184_320 },
      { id: "built", label: "Built", value: 162_004 },
      { id: "checked", label: "Checks passed", value: 141_876 },
      { id: "deployed", label: "Deployed", value: 138_290 },
    ],
  },
};

export const PlotOnly: Story = { args: { children: <FunnelChartPlot /> } };

export const Animated: Story = { render: WeekComparison };
