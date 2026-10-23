import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { Toaster, toast } from "@masmeert/ui/sonner";

const meta = {
  title: "Overlays/Sonner",
  component: Toaster,
  args: { position: "bottom-right", expand: false, visibleToasts: 3 },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    visibleToasts: { control: { type: "number", min: 1, max: 9, step: 1 } },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Types: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast("Thread renamed")}>
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Pull request opened", { description: "masscode#22 · fix/auth-retry" })
          }
        >
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.info("Agent is waiting for your answer")}>
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("Branch is 12 commits behind main", {
              description: "Rebase before merging to avoid conflicts.",
            })
          }
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Couldn’t push fix/auth-retry", {
              description: "The remote rejected the push. Pull the latest changes, then try again.",
            })
          }
        >
          Error
        </Button>
      </div>
    </>
  ),
};

export const PromiseToast: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: "Running tests…",
            success: "214 tests passed",
            error: "Tests failed",
          })
        }
      >
        Run tests
      </Button>
    </>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        variant="outline"
        onClick={() =>
          toast("Thread archived", {
            description: "Fix flaky auth test",
            action: { label: "Undo", onClick: () => toast("Thread restored") },
          })
        }
      >
        Archive thread
      </Button>
    </>
  ),
};

export const TopCenterExpanded: Story = {
  args: { position: "top-center", expand: true },
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button
        variant="outline"
        onClick={() => {
          toast("Agent started on fix/auth-retry");
          toast.success("Checkpoint saved");
          toast.info("2 files changed");
        }}
      >
        Fire three toasts
      </Button>
    </>
  ),
};
