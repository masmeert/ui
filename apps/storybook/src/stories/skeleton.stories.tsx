import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@masmeert/ui/skeleton";

const meta = {
  title: "Display/Skeleton",
  component: Skeleton,
  args: { className: "h-4 w-64" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThreadRowSkeleton() {
  return (
    <div className="flex w-80 items-center gap-3">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function DeployCardSkeleton() {
  return (
    <div className="flex w-96 flex-col gap-6 rounded-2xl border p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {["build", "region", "bundle"].map((stat) => (
          <div key={stat} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CommitLogSkeleton() {
  return (
    <div className="flex w-96 flex-col gap-4">
      {["w-4/5", "w-3/5", "w-2/3", "w-1/2", "w-3/4"].map((width) => (
        <div key={width} className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className={`h-4 ${width}`} />
        </div>
      ))}
    </div>
  );
}

export const Line: Story = {};
export const ThreadRow: Story = { render: ThreadRowSkeleton };
export const DeployCard: Story = { render: DeployCardSkeleton };
export const CommitLog: Story = { render: CommitLogSkeleton };
