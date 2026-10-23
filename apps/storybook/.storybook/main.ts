import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

function kitSource(path: string) {
  return fileURLToPath(new URL(`../../../packages/ui/src/${path}`, import.meta.url));
}

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.tsx"],
  viteFinal(viteConfig) {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    // Scan the kit's components up front too, so every dependency is pre-bundled before the first story loads
    // instead of being discovered mid-session (which reloads the page and can mix two React copies).
    const entries = viteConfig.optimizeDeps?.entries ?? [];
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      entries: [
        ...(Array.isArray(entries) ? entries : [entries]),
        kitSource("components/**/*.tsx"),
      ],
    };
    viteConfig.resolve = {
      ...viteConfig.resolve,
      // The kit's source resolves react from its own node_modules; one shared copy keeps hooks working.
      dedupe: ["react", "react-dom"],
      // Stories read the kit's source so edits hot-reload; components live at the package root, hooks/lib keep their folder.
      alias: [
        { find: /^@masmeert\/ui\/((?:hooks|lib)\/.*|styles\.css)$/, replacement: kitSource("$1") },
        { find: /^@masmeert\/ui\/(.*)$/, replacement: kitSource("components/$1") },
        { find: /^@\/(.*)$/, replacement: kitSource("$1") },
      ],
    };
    return viteConfig;
  },
};

export default config;
