import { useEffect, useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@masmeert/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@masmeert/ui/progress";

type ProgressProps = ComponentProps<typeof Progress>;

const UPLOAD_TICK_MS = 400;

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  args: { value: 64, className: "w-80" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

function LabeledProgress(props: ProgressProps) {
  return (
    <Progress {...props}>
      <ProgressLabel>Uploading build artifacts</ProgressLabel>
      <ProgressValue />
    </Progress>
  );
}

function ArtifactUpload(props: ProgressProps) {
  const [uploadedPercent, setUploadedPercent] = useState(0);
  const uploading = uploadedPercent > 0 && uploadedPercent < 100;

  useEffect(() => {
    if (!uploading) return;
    const timer = setTimeout(
      () => setUploadedPercent((percent) => Math.min(100, percent + 7)),
      UPLOAD_TICK_MS,
    );
    return () => clearTimeout(timer);
  }, [uploading, uploadedPercent]);

  return (
    <div className="flex w-80 flex-col gap-4">
      <Progress {...props} value={uploadedPercent}>
        <ProgressLabel>
          {uploadedPercent === 100 ? "Artifacts uploaded" : "dist/ → releases/v0.1.12"}
        </ProgressLabel>
        <ProgressValue />
      </Progress>
      <div className="flex gap-2">
        <Button size="sm" disabled={uploading} onClick={() => setUploadedPercent(1)}>
          {uploadedPercent === 100 ? "Upload again" : "Upload"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!uploading}
          onClick={() => setUploadedPercent(0)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export const Default: Story = { render: LabeledProgress };
export const Bare: Story = { args: { value: 32 } };
export const Upload: Story = { render: ArtifactUpload };
export const Indeterminate: Story = { args: { value: null } };
