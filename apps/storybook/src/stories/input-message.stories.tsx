import type { Meta, StoryObj } from "@storybook/react-vite";
import { AttachmentChip, type ChatAttachment } from "@masmeert/ui/chat-message";
import { InputMessage } from "@masmeert/ui/input-message";
import { IconPaperclip, IconWorld } from "@tabler/icons-react";
import { type ReactNode, useState } from "react";
import { typeClass } from "@/lib/type-scale";

const meta = {
  title: "AI/Input Message",
  component: InputMessage,
  parameters: { layout: "padded" },
  args: { placeholder: "Ask anything", maxRows: 8 },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    maxRows: { control: { type: "range", min: 1, max: 12, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

function Tool({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-hover hover:text-foreground"
    >
      {children}
    </button>
  );
}

export const Default: Story = {
  render: function Default(args) {
    const [sent, setSent] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <InputMessage
          {...args}
          loading={args.loading || loading}
          onStop={() => setLoading(false)}
          onSubmit={(value) => {
            setSent((list) => [...list, value]);
            setLoading(true);
            window.setTimeout(() => setLoading(false), 3000);
          }}
          leading={
            <Tool label="Attach file">
              <IconPaperclip size={16} />
            </Tool>
          }
          trailing={
            <Tool label="Search the web">
              <IconWorld size={16} />
            </Tool>
          }
        />
        <ul className={`flex flex-col gap-1 text-muted-foreground ${typeClass("caption")}`}>
          {sent.map((value, index) => (
            <li key={index} className="whitespace-pre-wrap">
              Sent: {value}
            </li>
          ))}
        </ul>
      </div>
    );
  },
};

export const Loading: Story = {
  args: { loading: true, defaultValue: "Summarise the incident timeline" },
};

export const WithAttachments: Story = {
  render: function WithAttachments(args) {
    const [files, setFiles] = useState<ChatAttachment[]>([
      { name: "incident-2025-03-14.md", size: 18_204 },
      { name: "latency.csv", size: 1_204_331 },
      { name: "grafana.png", size: 402_118, type: "image/png" },
    ]);
    return (
      <InputMessage
        {...args}
        header={
          files.length ? (
            <ul aria-label="Attachments" className="flex flex-wrap gap-2 px-1 pt-1">
              {files.map((file) => (
                <li key={file.name}>
                  <AttachmentChip
                    attachment={file}
                    onRemove={() => setFiles((list) => list.filter((f) => f !== file))}
                  />
                </li>
              ))}
            </ul>
          ) : null
        }
      />
    );
  },
};

export const Compact: Story = {
  args: { size: "compact" },
};
