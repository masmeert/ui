import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import "../src/theme";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    function ThemeDecorator(Story, context) {
      const dark = context.globals.theme === "dark";
      useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
      }, [dark]);
      return <Story />;
    },
  ],
};

export default preview;
