import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

function Block({ title, tall }: { title: string; tall?: boolean }) {
  return (
    <section className={`flex flex-col gap-2 rounded-2xl bg-card p-6 ${tall ? "min-h-80" : ""}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">
        One class on the container. Pure CSS, nothing hidden on the server.
      </p>
    </section>
  );
}

function Landing() {
  return (
    <div className="reveal-landing flex w-[40rem] flex-col gap-6 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Ship faster</h1>
        <p className="text-muted-foreground">The hero rises in on load, a step per child.</p>
        <div className="h-40 rounded-2xl bg-muted" />
      </header>
      {["Fluid hover", "Spring tiers", "Surfaces", "Sizes", "Typography"].map((t) => (
        <Block key={t} title={t} tall />
      ))}
    </div>
  );
}

function Product() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="reveal-product flex w-[40rem] flex-col gap-4">
      <Block title="Usage" />
      <div className="reveal-swap">
        <div className="reveal-items flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        {loaded ? (
          <div className="reveal-items flex flex-col gap-2">
            {["api.ts", "worker.ts", "billing.md"].map((f) => (
              <div key={f} className="flex h-10 items-center rounded-lg bg-card px-3 text-sm">
                {f}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <Block title="Settings" />
    </div>
  );
}

const meta = {
  title: "Systems/Reveal",
  component: Landing,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Landing>;
export default meta;
type Story = StoryObj<typeof meta>;

/** reveal-landing: scroll down to see sections rise in and lift out at the top. */
export const LandingPage: Story = {};
/** reveal-product + reveal-swap: the skeleton hands over to the data without a blank frame. */
export const ProductPage: Story = { render: () => <Product /> };
