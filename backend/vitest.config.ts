import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "forks",
    globalSetup: "./src/tests/globalSetup.ts",
    exclude: ["dist/**", "node_modules/**"],
  },
});
