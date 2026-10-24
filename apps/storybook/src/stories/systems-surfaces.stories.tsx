import type { Meta, StoryObj } from "@storybook/react-vite";
import { Elevated, SURFACE_OFFSET, surfaceClasses, useSurface } from "@masmeert/ui/lib/surface";

function Level({ label }: { label: string }) {
  const level = useSurface();
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">surface {level}</span>
    </div>
  );
}

function Ladder() {
  return (
    <div className="flex w-[30rem] flex-col gap-4">
      <Level label="Page" />
      <Elevated offset={SURFACE_OFFSET.dialog} className="flex flex-col gap-4 rounded-2xl p-5">
        <Level label="Dialog (page + 4)" />
        <Elevated
          offset={SURFACE_OFFSET.popover}
          shadowLevel={3}
          className="flex flex-col gap-1 rounded-xl p-1.5"
        >
          <div className="px-2 pt-1">
            <Level label="Menu in the dialog (+2, shadow pinned at 3)" />
          </div>
          {["Rename", "Duplicate", "Archive"].map((item) => (
            <div key={item} className="rounded-lg px-2 py-2 text-sm hover:bg-hover">
              {item}
            </div>
          ))}
          <div className="rounded-lg bg-selected px-2 py-2 text-sm">Selected row</div>
        </Elevated>
      </Elevated>
      <p className="text-xs text-muted-foreground">
        Switch to dark: each level adds a little white so the menu never melts into the dialog. In
        light, the shadow carries the depth. Hover and selected are tints, so they read on any
        level.
      </p>
    </div>
  );
}

function AllLevels() {
  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((level) => (
        <div
          key={level}
          className={`flex size-24 items-end rounded-xl p-2 text-xs text-muted-foreground ${surfaceClasses(level)}`}
        >
          {level}
        </div>
      ))}
    </div>
  );
}

const meta = { title: "Systems/Surfaces", component: Ladder } satisfies Meta<typeof Ladder>;
export default meta;
export const Nesting: StoryObj<typeof meta> = {};
export const Levels: StoryObj<typeof meta> = { render: () => <AllLevels /> };
