import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from "@masmeert/ui/table";

const DEPLOYS = [
  { id: "dpl_8f2a", branch: "main", commit: "Fix meter rounding", status: "Ready", age: "2m" },
  {
    id: "dpl_7c1d",
    branch: "feat/billing",
    commit: "Add usage routes",
    status: "Building",
    age: "9m",
  },
  { id: "dpl_6b90", branch: "main", commit: "Bump dependencies", status: "Ready", age: "1h" },
  {
    id: "dpl_5e44",
    branch: "fix/auth",
    commit: "Refresh tokens on 401",
    status: "Error",
    age: "3h",
  },
  { id: "dpl_4a17", branch: "main", commit: "Docs: billing guide", status: "Ready", age: "1d" },
];

function Deploys({ onOpen, ...args }: TableProps & { onOpen?: (id: string) => void }) {
  return (
    <Table {...args}>
      <TableCaption>Recent deployments across all branches.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Deployment</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Commit</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Age</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {DEPLOYS.map((deploy) => (
          <TableRow key={deploy.id} onClick={onOpen && (() => onOpen(deploy.id))}>
            <TableCell className="font-mono">{deploy.id}</TableCell>
            <TableCell>{deploy.branch}</TableCell>
            <TableCell className="whitespace-nowrap">{deploy.commit}</TableCell>
            <TableCell>{deploy.status}</TableCell>
            <TableCell className="text-right text-muted-foreground tabular-nums">
              {deploy.age}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const meta = {
  title: "Data/Table",
  component: Table,
  args: { interactive: false },
  argTypes: { size: { control: "inline-radio", options: ["compact", "default", "large"] } },
  render: (args: TableProps) => (
    <div className="w-[min(44rem,90vw)]">
      <Deploys {...args} />
    </div>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every row opens its deployment: one highlight glides between rows. */
export const Interactive: Story = {
  args: { interactive: true },
  render: function Interactive(args) {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <div className="flex w-[min(44rem,90vw)] flex-col gap-3">
        <Deploys {...args} onOpen={setSelected} />
        <p className="text-sm text-muted-foreground">Opened: {selected ?? "nothing yet"}</p>
      </div>
    );
  },
};

export const Compact: Story = { args: { size: "compact" } };

/** Narrower than the table: it scrolls sideways inside its wrapper. */
export const Overflow: Story = {
  args: { interactive: true },
  render: (args) => (
    <div className="w-72">
      <Deploys {...args} onOpen={() => {}} />
    </div>
  ),
};
