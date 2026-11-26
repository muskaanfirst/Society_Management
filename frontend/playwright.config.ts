import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { parseEnvFile } from "./tests/helpers/env";

const frontendDir = __dirname;
const mleDir = path.join(frontendDir, "..", "mle-service");
const pythonBin = path.join(mleDir, ".venv", "Scripts", "python.exe");

// Passed explicitly to the Next.js webServer entry below -- see the comment
// in tests/globalSetup.ts: a Next dev server spawned as a child process
// doesn't reliably pick up .env.local on its own.
const envLocal = parseEnvFile(path.join(frontendDir, ".env.local"));

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  // Generous: each e2e run starts a fresh `next dev` (no warm Turbopack
  // cache), so the first compile of a route hit right after navigating to it
  // can take longer than Playwright's 5s assertion default.
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  globalSetup: "./e2e/globalSetup.ts",
  globalTeardown: "./e2e/globalTeardown.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `"${pythonBin}" -m uvicorn main:app --port 8000`,
      cwd: mleDir,
      url: "http://localhost:8000/health",
      reuseExistingServer: true,
      timeout: 60000,
    },
    {
      command: "npm run dev",
      cwd: frontendDir,
      url: "http://localhost:3000/api/societies",
      reuseExistingServer: true,
      timeout: 120000,
      env: envLocal,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
