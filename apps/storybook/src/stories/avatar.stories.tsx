import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@masmeert/ui/avatar";

type AvatarProps = ComponentProps<typeof Avatar>;

const reviewers = [
  { login: "torvalds", initials: "LT" },
  { login: "gaearon", initials: "DA" },
  { login: "sindresorhus", initials: "SS" },
  { login: "yyx990803", initials: "EY" },
];

const meta = {
  title: "Display/Avatar",
  component: Avatar,
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: ["compact", "default", "large"] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

function AuthorAvatar(props: AvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarImage src="https://github.com/gaearon.png" alt="gaearon" />
      <AvatarFallback>DA</AvatarFallback>
    </Avatar>
  );
}

function InitialsAvatar(props: AvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarImage src="https://invalid.example/missing.png" alt="Massimo Meert" />
      <AvatarFallback>MM</AvatarFallback>
    </Avatar>
  );
}

function ApprovedReviewerAvatar(props: AvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarImage src="https://github.com/sindresorhus.png" alt="sindresorhus" />
      <AvatarFallback>SS</AvatarFallback>
      <AvatarBadge className="bg-emerald-500">
        <Check />
      </AvatarBadge>
    </Avatar>
  );
}

function ReviewerGroup(props: AvatarProps) {
  return (
    <AvatarGroup>
      {reviewers.map((reviewer) => (
        <Avatar key={reviewer.login} {...props}>
          <AvatarImage src={`https://github.com/${reviewer.login}.png`} alt={reviewer.login} />
          <AvatarFallback>{reviewer.initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  );
}

export const Image: Story = { render: AuthorAvatar };
export const Fallback: Story = { render: InitialsAvatar };
export const WithBadge: Story = { args: { size: "large" }, render: ApprovedReviewerAvatar };
export const Group: Story = { render: ReviewerGroup };
