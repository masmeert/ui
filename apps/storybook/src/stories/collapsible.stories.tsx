import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown } from "lucide-react";
import { Button } from "@masmeert/ui/button";
import { Collapsible } from "@masmeert/ui/collapsible";

const buildLog = [
  "$ pnpm install --frozen-lockfile",
  "Packages: +812",
  "$ pnpm build",
  "vite v7.1.0 building for production...",
  "✓ 214 modules transformed.",
  "dist/index.js  412.08 kB │ gzip: 128.40 kB",
  "✓ built in 1.21s",
];

function BuildLog() {
  return (
    <pre className="mt-3 rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-5">
      {buildLog.join("\n")}
    </pre>
  );
}

const meta = {
  title: "Display/Collapsible",
  component: Collapsible,
  args: { open: true, children: <BuildLog /> },
  argTypes: {
    open: { control: "boolean" },
    children: { control: false },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

function DeployStepWithLog() {
  const [logOpen, setLogOpen] = useState(false);
  return (
    <div className="w-[28rem] rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Build</div>
          <div className="text-xs text-muted-foreground">Finished in 1m 12s</div>
        </div>
        <Button
          size="compact"
          variant="ghost"
          aria-expanded={logOpen}
          onClick={() => setLogOpen((open) => !open)}
        >
          {logOpen ? "Hide log" : "Show log"}
          <ChevronDown className={`size-4 transition-transform ${logOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>
      <Collapsible open={logOpen}>
        <BuildLog />
      </Collapsible>
    </div>
  );
}

export const Default: Story = {};
export const Toggle: Story = { render: DeployStepWithLog };
