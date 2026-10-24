import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { type MotionTier, reducedTransition, spring, springExit } from "@masmeert/ui/lib/springs";

const TIERS: { tier: MotionTier; use: string }[] = [
  { tier: "fast", use: "Hover, fades, tooltips, press, icon swaps" },
  { tier: "moderate", use: "Dropdowns, tabs, indicators, short travel" },
  { tier: "slow", use: "Dialogs, drawers, large surfaces" },
];

function Tiers() {
  const [on, setOn] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className="flex w-[34rem] flex-col gap-6">
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className="self-start rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-hover"
      >
        Toggle
      </button>
      {TIERS.map(({ tier, use }) => (
        <div key={tier} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">spring.{tier}</span>
            <span className="text-xs text-muted-foreground">{use}</span>
          </div>
          <div className="relative h-10 rounded-xl bg-muted">
            <motion.div
              className="absolute top-1 left-1 size-8 rounded-lg bg-primary"
              animate={{ x: on ? 440 : 0 }}
              transition={reducedTransition(spring[tier], reduce)}
            />
          </div>
          <div className="relative h-16">
            <AnimatePresence>
              {on ? (
                <motion.div
                  key="panel"
                  className="absolute inset-0 rounded-xl bg-surface-3 shadow-surface-3"
                  initial={{ opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, transition: springExit[tier] }}
                  transition={reducedTransition(spring[tier], reduce)}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Exits are ease-in tweens one step quicker than the entrance. With reduced motion, travel
        snaps and only the fade remains.
      </p>
    </div>
  );
}

const meta = { title: "Systems/Motion", component: Tiers } satisfies Meta<typeof Tiers>;
export default meta;
export const SpringTiers: StoryObj<typeof meta> = {};
