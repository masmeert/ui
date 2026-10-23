import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@masmeert/ui/chart";

const dayLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const deploysByDay = Array.from({ length: 30 }, (_, dayIndex) => {
  const date = new Date(Date.UTC(2026, 8, 24 + dayIndex));
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  return {
    day: dayLabel.format(date),
    preview: weekend ? 4 + (dayIndex % 3) : 18 + ((dayIndex * 11) % 9),
    production: weekend ? 1 + (dayIndex % 2) : 6 + ((dayIndex * 7) % 5),
  };
});

const buildsByWeek = Array.from({ length: 12 }, (_, weekIndex) => ({
  week: `W${32 + weekIndex}`,
  succeeded: 140 + ((weekIndex * 37) % 60),
  failed: 6 + ((weekIndex * 13) % 17),
}));

const latencyByHour = Array.from({ length: 24 }, (_, hour) => {
  // Traffic peaks mid-afternoon UTC, and latency follows it.
  const load = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
  return {
    hour: `${String(hour).padStart(2, "0")}:00`,
    api: Math.round(180 + 70 * load + ((hour * 17) % 23)),
    web: Math.round(95 + 30 * load + ((hour * 7) % 11)),
  };
});

const deployConfig = {
  preview: { label: "Preview", color: "var(--chart-2)" },
  production: { label: "Production", color: "var(--chart-1)" },
} satisfies ChartConfig;

const meta = {
  title: "Data/Chart",
  component: ChartContainer,
  args: {
    config: deployConfig,
    className: "w-[40rem]",
    children: (
      <AreaChart data={deploysByDay} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis tickLine={false} axisLine={false} width={28} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Area
          dataKey="preview"
          type="monotone"
          stackId="deploys"
          fill="var(--color-preview)"
          fillOpacity={0.25}
          stroke="var(--color-preview)"
        />
        <Area
          dataKey="production"
          type="monotone"
          stackId="deploys"
          fill="var(--color-production)"
          fillOpacity={0.4}
          stroke="var(--color-production)"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    ),
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeploysArea: Story = {};

export const BuildsStackedBar: Story = {
  args: {
    config: {
      succeeded: { label: "Succeeded", color: "var(--chart-1)" },
      failed: { label: "Failed", color: "var(--destructive)" },
    },
    children: (
      <BarChart data={buildsByWeek} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Bar dataKey="succeeded" stackId="builds" fill="var(--color-succeeded)" />
        <Bar dataKey="failed" stackId="builds" fill="var(--color-failed)" radius={[4, 4, 0, 0]} />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    ),
  },
};

export const LatencyLine: Story = {
  args: {
    config: {
      api: { label: "API p95 (ms)", color: "var(--chart-1)" },
      web: { label: "Web p95 (ms)", color: "var(--chart-3)" },
    },
    children: (
      <LineChart data={latencyByHour} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
        <Line dataKey="api" type="monotone" stroke="var(--color-api)" strokeWidth={2} dot={false} />
        <Line dataKey="web" type="monotone" stroke="var(--color-web)" strokeWidth={2} dot={false} />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    ),
  },
};

export const ProductionBars: Story = {
  args: {
    config: deployConfig,
    children: (
      <BarChart data={deploysByDay.slice(-14)} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="production" fill="var(--color-production)" radius={4} />
      </BarChart>
    ),
  },
};
