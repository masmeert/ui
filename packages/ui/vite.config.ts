import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/components/*.tsx", "src/hooks/*.ts", "src/lib/*.ts", "src/lib/*.tsx"],
    root: "src",
    unbundle: true,
    platform: "neutral",
    dts: { tsgo: true },
    copy: [{ from: "src/styles.css", to: "dist" }],
    exports: {
      // Components ship at the package root (`@masmeert/ui/button`); hooks and lib keep their folder prefix.
      customExports(exports) {
        return {
          ...Object.fromEntries(
            Object.entries(exports).map(([key, target]) => [
              key.replace(/^\.\/components\//, "./"),
              target,
            ]),
          ),
          "./styles.css": "./dist/styles.css",
        };
      },
    },
  },
});
