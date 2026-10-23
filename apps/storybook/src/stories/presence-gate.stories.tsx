import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { PresenceGate } from "@masmeert/ui/presence-gate";
import { CircleCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function PromoteDeploymentDialog() {
  const [open, setOpen] = useState(false);
  const [promotions, setPromotions] = useState(0);

  return (
    <div className="relative h-80 w-[28rem] overflow-hidden rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Deployment #1287</p>
          <p className="text-xs text-muted-foreground">Promoted {promotions} times</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Promote
        </Button>
      </div>
      <AnimatePresence>
        {open ? (
          <PresenceGate key="dialog">
            {({ isPresent, gate }) => (
              <>
                <motion.div
                  {...gate}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-foreground/20"
                />
                <motion.div
                  {...gate}
                  role="dialog"
                  aria-label="Promote deployment"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-x-6 top-16 rounded-xl border border-border bg-card p-4 shadow-lg"
                >
                  <p className="text-sm font-medium">Promote #1287 to production?</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The exit is slowed down: while it plays, isPresent is{" "}
                    <span className="font-mono text-foreground">{String(isPresent)}</span> and these
                    buttons ignore clicks.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setPromotions((current) => current + 1);
                        setOpen(false);
                      }}
                    >
                      Promote
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </PresenceGate>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DeployToast() {
  const [visible, setVisible] = useState(false);
  const [undoCount, setUndoCount] = useState(0);

  return (
    <div className="relative flex h-64 w-96 flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border bg-background p-4">
      <Button variant="outline" size="sm" onClick={() => setVisible(true)}>
        Deploy web-app
      </Button>
      <p className="text-xs text-muted-foreground">Rollbacks: {undoCount}</p>
      <AnimatePresence>
        {visible ? (
          <PresenceGate key="toast">
            {({ gate }) => (
              <motion.div
                {...gate}
                role="status"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg"
              >
                <CircleCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="min-w-0 flex-1 text-sm">web-app is live on production</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUndoCount((current) => current + 1);
                    setVisible(false);
                  }}
                >
                  Undo
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setVisible(false)}>
                  Dismiss
                </Button>
              </motion.div>
            )}
          </PresenceGate>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const meta = {
  title: "Motion/Presence Gate",
  component: PresenceGate,
  args: { children: () => null },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof PresenceGate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dialog: Story = { render: () => <PromoteDeploymentDialog /> };

export const Toast: Story = { render: () => <DeployToast /> };
