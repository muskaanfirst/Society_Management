// Minimal .env file parser shared by the vitest and Playwright test harnesses.
// Next.js loads .env.local itself when run normally, but that didn't reliably
// happen for a dev server spawned as a child process from the test
// orchestration code -- DATABASE_URL came back unset inside the child even
// with the right cwd. Explicitly parsing and passing these values through a
// spawned child's `env` sidesteps that.
import { readFileSync } from "node:fs";

export function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!match) continue;
      result[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // no such file -- caller falls back to whatever is already in process.env
  }
  return result;
}
