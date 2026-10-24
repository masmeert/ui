import { ActionSwapText } from "./action-swap";

export interface TextCascadeProps {
  text: string;
  className?: string;
}

/** Text-first wrapper around ActionSwapText's `cascade` animation. */
export function TextCascade({ text, className }: TextCascadeProps) {
  return (
    <ActionSwapText value={text} animation="cascade" className={className}>
      {text}
    </ActionSwapText>
  );
}
