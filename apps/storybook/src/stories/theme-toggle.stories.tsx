import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle, type ThemeToggleProps } from "@masmeert/ui/theme-toggle";
import { useEffect, useState } from "react";
import { fn } from "storybook/test";

const meta = {
  title: "Motion/Theme Toggle",
  component: ThemeToggle,
  args: {
    dark: false,
    onDarkChange: fn(),
    variant: "rectangle",
    origin: "bottom-up",
    className: "size-10 rounded-full border border-border text-foreground hover:bg-muted",
    iconClassName: "size-4",
  },
  argTypes: {
    dark: { control: false },
    variant: { control: "inline-radio", options: ["rectangle", "circle", "circle-blur", "blinds"] },
    origin: {
      control: "select",
      options: ["top-left", "top-right", "bottom-left", "bottom-right", "center", "bottom-up"],
    },
  },
  render: function CanvasThemeToggle(args: ThemeToggleProps) {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

    useEffect(() => {
      // The Storybook toolbar flips the same class; follow it so the toggle never acts on a stale theme.
      const observer = new MutationObserver(() =>
        setDark(document.documentElement.classList.contains("dark")),
      );
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }, []);

    return (
      <ThemeToggle
        {...args}
        dark={dark}
        onDarkChange={(next) => {
          args.onDarkChange(next);
          document.documentElement.classList.toggle("dark", next);
          setDark(next);
        }}
      />
    );
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rectangle: Story = {};

export const Circle: Story = { args: { variant: "circle", origin: "top-right" } };

export const CircleBlur: Story = { args: { variant: "circle-blur", origin: "center" } };

export const Blinds: Story = { args: { variant: "blinds" } };
