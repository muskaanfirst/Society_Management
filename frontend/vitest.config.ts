import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/globalSetup.ts"],
    testTimeout: 30000,
    hookTimeout: 120000, // globalSetup starts two dev servers from cold
    fileParallelism: false, // all specs share one live DB + synthetic fixtures
  },
});
