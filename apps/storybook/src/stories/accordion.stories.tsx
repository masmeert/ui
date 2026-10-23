import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GitBranch, Hammer, Rocket, ShieldCheck } from "lucide-react";
import { Accordion, type AccordionItem } from "@masmeert/ui/accordion";
import { Button } from "@masmeert/ui/button";

type AccordionProps = ComponentProps<typeof Accordion>;

const pipelineSteps: AccordionItem[] = [
  {
    id: "checkout",
    title: "Checkout",
    description: "Cloned main@4f2c91a with a shallow fetch in 3.1s.",
  },
  {
    id: "build",
    title: "Build",
    description: "pnpm build finished in 1m 12s. 214 modules transformed, 412 kB gzipped.",
  },
  {
    id: "checks",
    title: "Checks",
    description: "Lint, typecheck and 1,284 tests passed. Coverage held at 87%.",
  },
  {
    id: "deploy",
    title: "Deploy",
    description: "Promoted to production in fra1 and iad1. Previous release kept for rollback.",
  },
];

const pipelineIcons: Record<string, AccordionItem["icon"]> = {
  checkout: <GitBranch className="size-4" />,
  build: <Hammer className="size-4" />,
  checks: <ShieldCheck className="size-4" />,
  deploy: <Rocket className="size-4" />,
};

const meta = {
  title: "Display/Accordion",
  component: Accordion,
  args: {
    items: pipelineSteps,
    defaultValue: "build",
    collapsible: true,
    className: "w-[28rem]",
  },
  argTypes: {
    collapsible: { control: "boolean" },
    defaultValue: {
      control: "select",
      options: [null, ...pipelineSteps.map((step) => step.id)],
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledPipeline(props: AccordionProps) {
  const [openStepId, setOpenStepId] = useState<string | null>("checks");
  return (
    <div className="flex w-[28rem] flex-col gap-4">
      <div className="flex gap-2">
        {pipelineSteps.map((step) => (
          <Button
            key={step.id}
            size="sm"
            variant={openStepId === step.id ? "secondary" : "ghost"}
            onClick={() => setOpenStepId(step.id)}
          >
            {step.title}
          </Button>
        ))}
      </div>
      <Accordion {...props} value={openStepId} onValueChange={setOpenStepId} />
    </div>
  );
}

export const Default: Story = {};
export const WithIcons: Story = {
  args: {
    items: pipelineSteps.map((step) => ({ ...step, icon: pipelineIcons[step.id] })),
  },
};
export const AlwaysOneOpen: Story = {
  args: {
    collapsible: false,
    items: pipelineSteps.map((step) =>
      step.id === "deploy"
        ? { ...step, title: "Deploy (waiting for approval)", disabled: true }
        : step,
    ),
  },
};
export const Controlled: Story = { render: ControlledPipeline };
