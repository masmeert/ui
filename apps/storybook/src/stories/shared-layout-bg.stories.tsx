import type { Meta, StoryObj } from "@storybook/react-vite";
import { SharedLayoutBg, type SharedLayoutBgProps } from "@masmeert/ui/shared-layout-bg";
import { IconFileCode, IconFileText, IconFolder, IconJson } from "@tabler/icons-react";

const meta = {
  title: "Motion/Shared Layout Bg",
  component: SharedLayoutBg,
  args: {
    children: null,
    as: "ul",
    inset: 12,
  },
  argTypes: {
    children: { control: false },
    as: { control: "inline-radio", options: ["div", "ul"] },
    inset: { control: { type: "range", min: 0, max: 40, step: 2 } },
    pillClassName: { control: "text" },
  },
  render: function FileTree(args: SharedLayoutBgProps) {
    return (
      <div className="w-80 px-4">
        <SharedLayoutBg {...args}>
          {[
            { Icon: IconFolder, path: "src/billing", diff: "4 files" },
            { Icon: IconFileCode, path: "src/api/routes/usage.ts", diff: "+88" },
            { Icon: IconFileCode, path: "src/workers/meter.ts", diff: "+97 −12" },
            { Icon: IconJson, path: "package.json", diff: "+2 −1" },
            { Icon: IconFileText, path: "docs/billing.md", diff: "+64" },
          ].map(({ Icon, path, diff }) => (
            <li key={path} className="list-none">
              <div className="flex cursor-default items-center gap-2 py-2 text-sm">
                <Icon className="size-4 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{path}</span>
                <span className="font-mono text-xs text-muted-foreground">{diff}</span>
              </div>
            </li>
          ))}
        </SharedLayoutBg>
      </div>
    );
  },
} satisfies Meta<typeof SharedLayoutBg>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FileList: Story = {};

export const Navigation: Story = {
  args: { as: "div", inset: 10, className: "gap-0.5" },
  render: (args) => (
    <nav aria-label="Project" className="w-56 px-3">
      <SharedLayoutBg {...args}>
        {["Overview", "Deployments", "Pull requests", "Logs", "Settings"].map((page) => (
          <a
            key={page}
            href={`#${page.toLowerCase().replace(" ", "-")}`}
            className="block py-2 text-sm font-medium"
          >
            {page}
          </a>
        ))}
      </SharedLayoutBg>
    </nav>
  ),
};

export const AccentPill: Story = {
  args: { inset: 6, pillClassName: "rounded-lg bg-primary/10" },
};
