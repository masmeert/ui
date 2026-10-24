import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconSearch } from "@tabler/icons-react";
import { type Size, SizeProvider, useSize } from "@masmeert/ui/lib/size";

function Toolbar() {
  const s = useSize();
  return (
    <div className={`flex items-center ${s.gap}`}>
      <button
        type="button"
        className={`${s.control} ${s.controlPx} ${s.text} rounded-lg bg-primary font-medium text-primary-foreground`}
      >
        Deploy
      </button>
      <div
        className={`${s.control} ${s.controlPx} flex items-center ${s.gap} rounded-lg border border-border`}
      >
        <IconSearch size={s.icon} className="text-muted-foreground" />
        <input
          placeholder="Search"
          className={`${s.field} w-32 bg-transparent outline-none placeholder:text-muted-foreground`}
        />
      </div>
      <div className={`${s.segmentPad} flex rounded-lg bg-muted`}>
        {["Day", "Week"].map((label, i) => (
          <span
            key={label}
            className={`${s.segmentItem} ${s.text} flex items-center rounded-md px-2.5 ${i === 0 ? "bg-background shadow-surface-2" : "text-muted-foreground"}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Menu() {
  const s = useSize();
  return (
    <div className="flex w-52 flex-col rounded-xl bg-surface-3 p-1 shadow-surface-3">
      {["Rename", "Duplicate", "Archive"].map((item) => (
        <div key={item} className={`${s.row} ${s.text} rounded-lg hover:bg-hover`}>
          {item}
        </div>
      ))}
    </div>
  );
}

function Ladder({ size }: { size: Size }) {
  return (
    <SizeProvider size={size}>
      <div className="flex flex-col items-start gap-4">
        <Toolbar />
        <Menu />
      </div>
    </SizeProvider>
  );
}

const meta = {
  title: "Systems/Sizes",
  component: Ladder,
  args: { size: "default" },
  argTypes: { size: { control: "inline-radio", options: ["compact", "default", "large"] } },
} satisfies Meta<typeof Ladder>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One provider sets a region's density: heights, text, icons, padding and gaps step together. */
export const Region: Story = {};

export const AllSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["compact", "default", "large"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">{size}</span>
          <SizeProvider size={size}>
            <Toolbar />
          </SizeProvider>
        </div>
      ))}
    </div>
  ),
};
