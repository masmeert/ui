import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BumpChart,
  BumpChartLegend,
  BumpChartPlot,
  type BumpChartSeries,
} from "@masmeert/ui/bump-chart";
import { SizeProvider } from "@masmeert/ui/lib/size";

const contributors: BumpChartSeries[] = [
  { id: "massimo", name: "Massimo", ranks: [1, 1, 2, 2, 1, 1, 2, 1] },
  { id: "ana", name: "Ana", ranks: [2, 3, 3, 4, 5, 5, 4, 3] },
  { id: "linus", name: "Linus", ranks: [3, 2, 1, 1, 2, 3, 3, 4] },
  { id: "sindre", name: "Sindre", ranks: [4, 4, 5, 5, 4, 4, 5, 5] },
  { id: "evan", name: "Evan", ranks: [5, 5, 4, 3, 3, 2, 1, 2] },
];

const meta = {
  title: "Data/Bump Chart",
  component: BumpChart,
  args: {
    series: contributors,
    periods: ["W36", "W37", "W38", "W39", "W40", "W41", "W42", "W43"],
    label: "Commit rank by contributor",
    className: "w-[40rem]",
  },
  argTypes: {
    defaultActive: {
      control: "select",
      options: [null, ...contributors.map((contributor) => contributor.id)],
    },
    children: { control: false },
  },
} satisfies Meta<typeof BumpChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pinned: Story = { args: { defaultActive: "evan" } };

export const WithGaps: Story = {
  args: {
    label: "Repositories ranked by agent threads",
    periods: ["W38", "W39", "W40", "W41", "W42", "W43"],
    series: [
      { id: "web", name: "web", ranks: [1, 1, 2, 2, 1, 1] },
      { id: "server", name: "server", ranks: [2, 2, 1, 1, 2, 3] },
      { id: "desktop", name: "desktop", ranks: [3, 4, 4, 3, 3, 2] },
      { id: "mobile", name: "mobile", ranks: [null, null, 3, 4, 4, 4] },
      { id: "cli", name: "cli (archived)", ranks: [4, 3, 5, 5, null, null] },
      { id: "docs", name: "docs", ranks: [5, 5, 6, 6, 5, 5] },
    ],
  },
};

export const LegendFirst: Story = {
  args: {
    children: (
      <>
        <BumpChartLegend className="sm:grid-cols-5" />
        <BumpChartPlot />
      </>
    ),
  },
};

/** Labels, legend and readouts step down with the region's density. */
export const Compact: Story = {
  render: (args) => (
    <SizeProvider size="compact">
      <BumpChart {...args} />
    </SizeProvider>
  ),
};
