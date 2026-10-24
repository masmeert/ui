import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AskUserQuestions,
  type Question,
  type QuestionAnswers,
} from "@masmeert/ui/ask-user-questions";
import { useState } from "react";
import { typeClass } from "@/lib/type-scale";

const QUESTIONS: Question[] = [
  {
    id: "scope",
    title: "Which environments should the fix ship to?",
    description: "The migration backfills the last 30 days of usage.",
    options: [
      {
        value: "staging",
        label: "Staging only",
        description: "Verify against replayed traffic first",
      },
      { value: "both", label: "Staging, then production", description: "Promote after an hour" },
      { value: "prod", label: "Production now" },
    ],
  },
  {
    id: "notify",
    title: "Who should hear about it?",
    multiple: true,
    allowOther: true,
    otherPlaceholder: "A channel or a person",
    options: [
      { value: "billing", label: "#billing-eng" },
      { value: "support", label: "Support leads" },
      { value: "customers", label: "Affected customers", disabled: true },
    ],
  },
  {
    id: "credits",
    title: "Refund the over-billed accounts?",
    allowOther: true,
    options: [
      { value: "auto", label: "Yes, as account credit" },
      { value: "manual", label: "Let support decide case by case" },
      { value: "no", label: "No" },
    ],
  },
];

const meta = {
  title: "AI/Ask User Questions",
  component: AskUserQuestions,
  parameters: { layout: "padded" },
  args: { questions: QUESTIONS, onComplete: () => {}, allowSkip: true },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
    questions: { control: false },
  },
  render: function Render(args) {
    const [answers, setAnswers] = useState<QuestionAnswers | null>(null);
    const [run, setRun] = useState(0);
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <AskUserQuestions key={run} {...args} onComplete={setAnswers} />
        {answers ? (
          <div className="flex flex-col items-start gap-2">
            <pre
              className={`w-full overflow-auto rounded-lg bg-hover p-3 font-mono ${typeClass("caption")}`}
            >
              {JSON.stringify(answers, null, 2)}
            </pre>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-muted-foreground hover:bg-hover"
              onClick={() => {
                setAnswers(null);
                setRun((r) => r + 1);
              }}
            >
              Reset
            </button>
          </div>
        ) : null}
      </div>
    );
  },
} satisfies Meta<typeof AskUserQuestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleQuestion: Story = {
  args: { questions: [QUESTIONS[0]!], allowSkip: false },
};

export const Compact: Story = {
  args: { size: "compact" },
};
