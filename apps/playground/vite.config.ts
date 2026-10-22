import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Point at the kit's source so edits hot-reload without a rebuild.
    alias: [
      {
        find: /^@masmeert\/ui\/(.*)$/,
        replacement: fileURLToPath(new URL("../../packages/ui/src/$1", import.meta.url)),
      },
    ],
  },
});
