import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Archive, Copy, FileCode, Pencil, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  type ContextMenuProps,
} from "@masmeert/ui/context-menu";

const meta = {
  title: "Overlays/Context Menu",
  component: ContextMenu,
  args: { children: null, defaultOpen: false, onOpenChange: fn() },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function ThreadRowContextMenu(props: ContextMenuProps) {
  return (
    <ContextMenu {...props}>
      <ContextMenuTrigger>
        <div className="flex w-80 flex-col gap-1 rounded-xl border border-border bg-card p-4 select-none">
          <p className="text-sm font-medium text-foreground">Fix flaky auth test</p>
          <p className="text-xs text-muted-foreground">Right-click or long-press for actions</p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent ariaLabel="Thread actions" className="w-56">
        <ContextMenuItem>
          <Pencil className="size-4 text-muted-foreground" />
          Rename
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy className="size-4 text-muted-foreground" />
          Copy link
          <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          <Archive className="size-4 text-muted-foreground" />
          Archive (agent running)
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="destructive">
          <Trash2 className="size-4" />
          Delete
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DiffViewContextMenu(props: ContextMenuProps) {
  const [wrapLines, setWrapLines] = useState(true);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [layout, setLayout] = useState("unified");

  return (
    <ContextMenu {...props}>
      <ContextMenuTrigger>
        <div className="flex w-96 flex-col gap-2 rounded-xl border border-border bg-card p-4 font-mono text-xs select-none">
          <p className="flex items-center gap-2 font-sans text-sm font-medium text-foreground">
            <FileCode className="size-4 text-muted-foreground" />
            src/auth/session.ts
          </p>
          <p className="text-destructive">- await sleep(100);</p>
          <p className="text-success">+ await waitFor(() =&gt; session.ready);</p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent ariaLabel="Diff view options" className="w-56">
        <ContextMenuLabel inset>Display</ContextMenuLabel>
        <ContextMenuCheckboxItem checked={wrapLines} onCheckedChange={setWrapLines}>
          Wrap lines
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={showWhitespace} onCheckedChange={setShowWhitespace}>
          Show whitespace
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel inset>Layout</ContextMenuLabel>
        <ContextMenuRadioGroup value={layout} onValueChange={setLayout}>
          <ContextMenuRadioItem value="unified">Unified</ContextMenuRadioItem>
          <ContextMenuRadioItem value="split">Split</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const Default: Story = {
  render: (args) => <ThreadRowContextMenu {...args} />,
};

export const CheckboxAndRadioItems: Story = {
  render: (args) => <DiffViewContextMenu {...args} />,
};
