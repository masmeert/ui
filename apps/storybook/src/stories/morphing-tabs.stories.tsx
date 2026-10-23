import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FileCode, FileJson, FileText, TerminalSquare } from "lucide-react";
import {
  MorphingTabs,
  type MorphingTabsItem,
  type MorphingTabsProps,
} from "@masmeert/ui/morphing-tabs";

function FilePreview({ path, lines }: { path: string; lines: string[] }) {
  return (
    <div className="flex flex-col gap-3 p-6">
      <p className="text-xs text-muted-foreground">{path}</p>
      <pre className="font-mono text-xs leading-5 text-foreground">{lines.join("\n")}</pre>
    </div>
  );
}

const openFiles: MorphingTabsItem[] = [
  {
    id: "session",
    label: "session.ts",
    icon: <FileCode className="size-4" />,
    content: (
      <FilePreview
        path="src/auth/session.ts"
        lines={[
          "export async function refresh(session: Session) {",
          "  await waitFor(() => session.ready);",
          "  return session.renew();",
          "}",
        ]}
      />
    ),
  },
  {
    id: "package",
    label: "package.json",
    icon: <FileJson className="size-4" />,
    content: (
      <FilePreview
        path="package.json"
        lines={["{", '  "name": "masscode",', '  "version": "0.1.11"', "}"]}
      />
    ),
  },
  {
    id: "readme",
    label: "README.md",
    icon: <FileText className="size-4" />,
    content: (
      <FilePreview
        path="README.md"
        lines={["# masscode", "", "Run coding agents side by side, one thread per task."]}
      />
    ),
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: <TerminalSquare className="size-4" />,
    content: (
      <FilePreview
        path="zsh · ~/code/masscode"
        lines={["$ pnpm test", "✓ 214 tests passed in 8.2s"]}
      />
    ),
  },
];

const meta = {
  title: "Navigation/Morphing Tabs",
  component: MorphingTabs,
  args: {
    items: openFiles,
    defaultValue: "session",
    ariaLabel: "Open files",
    onValueChange: fn(),
    onOrderChange: fn(),
  },
  argTypes: {
    items: { control: false },
    value: { control: false },
    defaultValue: { control: "select", options: openFiles.map((file) => file.id) },
  },
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="mx-auto w-full max-w-3xl">
      <MorphingTabs {...args} />
    </div>
  ),
} satisfies Meta<typeof MorphingTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function ClosableEditorTabs({ onValueChange, ...props }: MorphingTabsProps) {
  const [files, setFiles] = useState(openFiles);
  const [activeId, setActiveId] = useState<string | null>("session");

  function selectFile(id: string | null) {
    setActiveId(id);
    onValueChange?.(id);
  }

  function closeFile(id: string) {
    const index = files.findIndex((file) => file.id === id);
    const remaining = files.filter((file) => file.id !== id);
    setFiles(remaining);
    if (id === activeId) selectFile(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {files.length > 0 ? (
        <MorphingTabs
          {...props}
          items={files}
          value={activeId}
          onValueChange={selectFile}
          onClose={closeFile}
        />
      ) : (
        <button
          type="button"
          onClick={() => setFiles(openFiles)}
          className="w-full rounded-[2rem] border border-dashed border-border p-10 text-sm text-muted-foreground hover:text-foreground"
        >
          All files closed. Reopen files
        </button>
      )}
    </div>
  );
}

export const Default: Story = {};

export const Closable: Story = {
  render: (args) => <ClosableEditorTabs {...args} />,
};

export const WithDisabledTab: Story = {
  args: {
    items: openFiles.map((file) =>
      file.id === "terminal" ? { ...file, label: "Terminal (offline)", disabled: true } : file,
    ),
  },
};

export const LabelsOnly: Story = {
  args: {
    items: openFiles.map(({ icon: _icon, ...file }) => file),
  },
};
