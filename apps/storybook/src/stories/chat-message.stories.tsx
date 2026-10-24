import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChatMessage, ChatMessageAction } from "@masmeert/ui/chat-message";
import { InputMessage } from "@masmeert/ui/input-message";
import { ThinkingSteps } from "@masmeert/ui/thinking-steps";
import { SizeProvider } from "@/lib/size";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";

const meta = {
  title: "AI/Chat Message",
  component: ChatMessage,
  parameters: { layout: "padded" },
  args: { role: "assistant" },
  argTypes: {
    role: { control: "inline-radio", options: ["user", "assistant"] },
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    persistentActions: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const reply = (
  <>
    <p>
      The meter double-counts because <code>recordUsage</code> runs once in the request handler and
      again in the <strong>retry worker</strong>, with no idempotency key between them.
    </p>
    <ol>
      <li>Derive a key from the request id and the billing period.</li>
      <li>Upsert on that key instead of inserting.</li>
      <li>Backfill the last 30 days with a dedupe query.</li>
    </ol>
    <p>Want me to open a pull request with the first two?</p>
  </>
);

export const Assistant: Story = {
  args: { children: reply, onRetry: () => {} },
};

export const User: Story = {
  args: {
    role: "user",
    children: <p>Why is the usage meter double-counting API calls since Tuesday?</p>,
    attachments: [
      { name: "meter.ts", size: 4_812, type: "text/typescript" },
      { name: "usage-dashboard.png", size: 284_113, type: "image/png" },
    ],
  },
};

export const Compact: Story = {
  args: { children: reply, size: "compact", onRetry: () => {} },
};

export const Transcript: Story = {
  args: { children: null },
  render: function Transcript() {
    const [messages, setMessages] = useState([
      {
        role: "user" as const,
        body: "Why is the usage meter double-counting API calls since Tuesday?",
      },
    ]);
    const [loading, setLoading] = useState(false);
    return (
      <SizeProvider size="default">
        <div className="flex flex-col gap-6">
          <div role="log" aria-label="Conversation" className="flex flex-col gap-6">
            <ChatMessage role="user" attachments={[{ name: "meter.ts", size: 4_812 }]}>
              <p>{messages[0]!.body}</p>
            </ChatMessage>
            <ThinkingSteps
              thinking={false}
              duration={12}
              steps={[
                { id: "a", title: "Read src/workers/meter.ts", status: "done" },
                {
                  id: "b",
                  title: "Traced recordUsage call sites",
                  status: "done",
                  detail: <p>Two writers: the request handler and the retry worker.</p>,
                },
                { id: "c", title: "Checked the idempotency keys", status: "done" },
              ]}
            />
            <ChatMessage
              role="assistant"
              persistentActions
              onRetry={() => {}}
              actions={
                <ChatMessageAction label="Good response">
                  <ThumbsUp size={16} aria-hidden />
                </ChatMessageAction>
              }
            >
              {reply}
            </ChatMessage>
            {messages.slice(1).map((message, index) => (
              <ChatMessage key={index} role={message.role}>
                <p>{message.body}</p>
              </ChatMessage>
            ))}
          </div>
          <InputMessage
            loading={loading}
            onStop={() => setLoading(false)}
            onSubmit={(value) => {
              setMessages((list) => [...list, { role: "user", body: value }]);
              setLoading(true);
              window.setTimeout(() => setLoading(false), 2500);
            }}
          />
        </div>
      </SizeProvider>
    );
  },
};
