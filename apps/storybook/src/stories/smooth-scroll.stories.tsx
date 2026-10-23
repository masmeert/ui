import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollProgress } from "@masmeert/ui/scroll-progress";
import { SmoothScroll, type SmoothScrollProps } from "@masmeert/ui/smooth-scroll";
import { FileCode, FileJson, FileText } from "lucide-react";

const changedFiles = [
  ["src/billing/tiers.ts", "+142 −18"],
  ["src/billing/invoice.ts", "+36 −9"],
  ["src/api/routes/usage.ts", "+88 −0"],
  ["src/api/middleware/auth.ts", "+4 −27"],
  ["src/db/migrations/0042_usage.sql", "+51 −0"],
  ["src/workers/meter.ts", "+97 −12"],
  ["package.json", "+2 −1"],
  ["tsconfig.json", "+1 −1"],
  ["README.md", "+23 −4"],
  ["docs/billing.md", "+64 −0"],
  ["test/billing/tiers.test.ts", "+118 −0"],
  ["test/api/usage.test.ts", "+73 −0"],
];

function fileIcon(path: string) {
  if (path.endsWith(".json")) return <FileJson className="size-4 shrink-0 text-muted-foreground" />;
  if (path.endsWith(".md")) return <FileText className="size-4 shrink-0 text-muted-foreground" />;
  return <FileCode className="size-4 shrink-0 text-muted-foreground" />;
}

const meta = {
  title: "Motion/Smooth Scroll",
  component: SmoothScroll,
  args: {
    children: null,
    root: false,
    lerp: 0.1,
    duration: 1.2,
    orientation: "vertical",
    wheelMultiplier: 1,
    touch: false,
  },
  argTypes: {
    children: { control: false },
    root: { control: false },
    className: { control: false },
    lerp: { control: { type: "range", min: 0.02, max: 1, step: 0.01 } },
    duration: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
    orientation: { control: false },
    wheelMultiplier: { control: { type: "range", min: 0.25, max: 3, step: 0.25 } },
    touch: { control: "boolean" },
  },
  render: function ChangedFiles(args: SmoothScrollProps) {
    return (
      <SmoothScroll
        {...args}
        className="h-72 w-96 overflow-y-auto rounded-2xl border border-border bg-background"
      >
        <div className="sticky top-0 z-10 border-b border-border bg-background/90 px-4 py-2.5 text-xs font-medium backdrop-blur">
          12 files changed · feat/billing-v2
          <ScrollProgress fixed={false} position="bottom" />
        </div>
        <ul className="flex flex-col p-2">
          {changedFiles.map(([path, diff]) => (
            <li key={path} className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm">
              {fileIcon(path)}
              <span className="min-w-0 flex-1 truncate font-mono text-xs">{path}</span>
              <span className="font-mono text-xs text-muted-foreground">{diff}</span>
            </li>
          ))}
        </ul>
      </SmoothScroll>
    );
  },
} satisfies Meta<typeof SmoothScroll>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Heavy: Story = { args: { lerp: 0.04 } };

export const FastWheel: Story = { args: { wheelMultiplier: 2.5, lerp: 0.2 } };

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <SmoothScroll {...args} className="w-96 overflow-x-auto rounded-2xl border border-border p-3">
      <div className="flex w-max gap-3">
        {changedFiles.map(([path, diff]) => (
          <div
            key={path}
            className="flex w-44 flex-col gap-2 rounded-xl border border-border bg-card p-3"
          >
            {fileIcon(path)}
            <span className="truncate font-mono text-xs">{path}</span>
            <span className="font-mono text-xs text-muted-foreground">{diff}</span>
          </div>
        ))}
      </div>
    </SmoothScroll>
  ),
};
