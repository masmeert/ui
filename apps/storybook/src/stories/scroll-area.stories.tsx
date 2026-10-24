import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea, ScrollBar } from "@masmeert/ui/scroll-area";

type ScrollAreaProps = ComponentProps<typeof ScrollArea>;

const commitMessages = [
  "fix(web): hide the countdown on an agents keep-awake session",
  "ci(mobile): submit to the App Store Connect app",
  "ci(release): build the release tag",
  "chore(main): release 0.1.11",
  "feat(threads): stream tool output into the sidebar",
  "fix(desktop): keep the window position across restarts",
  "refactor(server): move thread storage behind a repository",
  "perf(web): virtualize the thread list",
  "feat(cli): add --resume to pick up the last thread",
  "fix(sync): retry pushes after a network drop",
  "docs: explain the worktree isolation model",
  "test(server): cover message ordering under load",
];

const commits = Array.from({ length: 36 }, (_, index) => ({
  sha: (0xfa70ddc - index * 0x1a2b3).toString(16).slice(0, 7),
  message: commitMessages[index % commitMessages.length],
}));

const branches = [
  "main",
  "feat/stream-output",
  "fix/keep-awake",
  "chore/sqlite-settings",
  "feat/mobile-push",
  "perf/virtual-list",
  "fix/window-position",
  "feat/cli-resume",
  "docs/worktrees",
  "ci/release-tags",
];

const meta = {
  title: "Display/Scroll Area",
  component: ScrollArea,
  args: { className: "h-72 w-[26rem] rounded-lg border" },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

function CommitLog(props: ScrollAreaProps) {
  return (
    <ScrollArea {...props}>
      <div className="flex flex-col p-2">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {commits.length} commits on main
        </div>
        {commits.map((commit) => (
          <div key={commit.sha} className="flex gap-3 rounded-md px-2 py-1.5 text-sm">
            <span className="shrink-0 font-mono text-muted-foreground">{commit.sha}</span>
            <span className="truncate">{commit.message}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function BranchStrip(props: ScrollAreaProps) {
  return (
    <ScrollArea {...props}>
      <div className="flex w-max gap-2 p-3">
        {branches.map((branch) => (
          <span key={branch} className="rounded-full border px-3 py-1 font-mono text-xs">
            {branch}
          </span>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export const Vertical: Story = { render: CommitLog };
export const Horizontal: Story = {
  args: { className: "w-80 rounded-lg border" },
  render: BranchStrip,
};

/** A hairline marks each edge with more to scroll past it. */
export const WithDivider: Story = {
  args: { divider: true, className: "h-72 w-[26rem] rounded-lg border" },
  render: CommitLog,
};
