import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Framer Motion publishes valid React client directives that are irrelevant in this Vite SPA.
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE"
          && warning.id?.includes("node_modules/framer-motion")
          && warning.message.includes('"use client"')
        ) return;
        warn(warning);
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    exclude: [...configDefaults.exclude],
  },
});
