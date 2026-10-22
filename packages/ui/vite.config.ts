import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/{components,motion,charts,hooks,lib}/*.{ts,tsx}"],
    root: "src",
    unbundle: true,
    platform: "neutral",
    dts: { tsgo: true },
    exports: true,
  },
});
