import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@masmeert/ui/tabs";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  args: { variant: "pill", defaultValue: "threads", onValueChange: fn(), children: null },
  argTypes: {
    variant: { control: "inline-radio", options: ["pill", "underline", "segment"] },
    value: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function ProjectTabs(props: ComponentProps<typeof Tabs>) {
  return (
    <Tabs {...props} className="w-96">
      <TabsList>
        <TabsTrigger value="threads">Threads</TabsTrigger>
        <TabsTrigger value="branches">Branches</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="threads" className="text-sm text-muted-foreground">
        4 running, 18 finished this week.
      </TabsContent>
      <TabsContent value="branches" className="text-sm text-muted-foreground">
        12 local branches, 3 ahead of main.
      </TabsContent>
      <TabsContent value="settings" className="text-sm text-muted-foreground">
        Default agent, setup script and environment variables.
      </TabsContent>
    </Tabs>
  );
}

function ControlledDiffTabs({ onValueChange, ...props }: ComponentProps<typeof Tabs>) {
  const [layout, setLayout] = useState("unified");

  return (
    <div className="flex flex-col items-start gap-3">
      <Tabs
        {...props}
        value={layout}
        onValueChange={(nextLayout) => {
          setLayout(nextLayout);
          onValueChange?.(nextLayout);
        }}
      >
        <TabsList>
          <TabsTrigger value="unified">Unified</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="text-sm text-muted-foreground">Showing the {layout} diff.</p>
    </div>
  );
}

export const Pill: Story = {
  render: (args) => <ProjectTabs {...args} />,
};

export const Underline: Story = {
  args: { variant: "underline" },
  render: (args) => <ProjectTabs {...args} />,
};

export const Segment: Story = {
  args: { variant: "segment" },
  render: (args) => <ProjectTabs {...args} />,
};

export const Controlled: Story = {
  args: { variant: "segment" },
  render: (args) => <ControlledDiffTabs {...args} />,
};
