import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StableLabel } from "@masmeert/ui/stable-label";
import { TYPE_PX, type TypeRole, typeClass } from "@masmeert/ui/lib/type-scale";

const ROLES: TypeRole[] = ["display", "title", "subtitle", "body", "caption", "micro"];

function Scale() {
  return (
    <div className="flex w-[36rem] flex-col gap-5">
      {ROLES.map((role) => (
        <div key={role} className="grid grid-cols-[6rem_1fr_1fr] items-baseline gap-4">
          <span className={`${typeClass("caption")} text-muted-foreground`}>
            {role} {TYPE_PX.default[role].size}/{TYPE_PX.default[role].leading}
          </span>
          <span className={typeClass(role)}>Ship it today</span>
          <span className={typeClass(role, "compact")}>Ship it today (compact)</span>
        </div>
      ))}
    </div>
  );
}

const MARKDOWN = (
  <>
    <h1>Release notes</h1>
    <p>
      This release moves every component onto <strong>one motion system</strong>, a shared size
      ladder and an elevation ladder. Read the <a href="#craft">craft notes</a> for the values.
    </p>
    <h2>What changed</h2>
    <ul>
      <li>Three spring tiers replace hand-written durations.</li>
      <li>
        Menus and lists use fluid hover.
        <ul>
          <li>The highlight never blinks between rows.</li>
        </ul>
      </li>
      <li>
        Inline <code>typeClass()</code> replaces raw pixel sizes.
      </li>
    </ul>
    <h3>Upgrade</h3>
    <ol>
      <li>Install the new version.</li>
      <li>Wrap dense regions in a SizeProvider.</li>
    </ol>
    <blockquote>Density is spacing as much as control height.</blockquote>
    <hr />
    <pre>
      <code>{`<SizeProvider size="compact">…</SizeProvider>`}</code>
    </pre>
    <table>
      <thead>
        <tr>
          <th>Step</th>
          <th>Height</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>compact</td>
          <td>32px</td>
        </tr>
        <tr>
          <td>default</td>
          <td>36px</td>
        </tr>
      </tbody>
    </table>
  </>
);

function Typeset({ compact }: { compact: boolean }) {
  return (
    <article className={`typeset w-[36rem] ${compact ? "typeset-compact" : ""}`}>
      {MARKDOWN}
    </article>
  );
}

function StableLabels() {
  const [active, setActive] = useState("Overview");
  return (
    <div className="flex gap-1">
      {["Overview", "Activity", "Settings"].map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActive(tab)}
          className="rounded-lg px-3 py-1.5 text-sm hover:bg-hover"
        >
          <StableLabel className={tab === active ? "font-semibold" : "text-muted-foreground"}>
            {tab}
          </StableLabel>
        </button>
      ))}
    </div>
  );
}

const meta = { title: "Systems/Typography", component: Scale } satisfies Meta<typeof Scale>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Roles: Story = {};
export const Prose: Story = { render: () => <Typeset compact={false} /> };
export const ProseCompact: Story = { render: () => <Typeset compact /> };
/** Selected labels turn semibold without nudging their neighbours. */
export const WeightWithoutReflow: Story = { render: () => <StableLabels /> };
