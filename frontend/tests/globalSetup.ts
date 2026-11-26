// Starts mle-service (FastAPI) and the Next.js dev server once before the
// whole integration suite, so `npm run test:integration` is self-contained
// and doesn't require manually starting either server first. Reuses an
// already-running server on either port instead of double-spawning one.
import { spawn, execSync, type ChildProcess } from "node:child_process";
import { openSync } from "node:fs";
import path from "node:path";
import { parseEnvFile } from "./helpers/env";

// Reads frontend/.env.local directly so it can be handed to the spawned
// `next dev` child via its `env` option. Next.js normally loads .env.local
// itself, but that didn't happen reliably for a child spawned this way
// (DATABASE_URL came back unset inside the child even though `cwd` was
// correct) -- passing it through explicitly sidesteps whatever the cause is.
function readEnvLocal(frontendDir: string): Record<string, string> {
  return parseEnvFile(path.join(frontendDir, ".env.local"));
}

async function isUp(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(url: string, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUp(url)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${url} to come up.`);
}

// Synchronous and blocking on purpose: an async exec() with a fire-and-forget
// callback lets the process exit before taskkill actually finishes, leaving
// the whole child tree (npm.cmd -> node -> next dev's worker processes)
// orphaned and still listening on the port.
function killTree(pid: number) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGKILL");
    }
  } catch {
    // already gone
  }
}

export default async function globalSetup() {
  const frontendDir = process.cwd();
  const mleDir = path.join(frontendDir, "..", "mle-service");
  const pythonBin = path.join(mleDir, ".venv", "Scripts", "python.exe");

  let mleProcess: ChildProcess | undefined;
  let nextProcess: ChildProcess | undefined;

  if (!(await isUp("http://localhost:8000/health"))) {
    const log = openSync(path.join(mleDir, "test-server.log"), "a");
    mleProcess = spawn(pythonBin, ["-m", "uvicorn", "main:app", "--port", "8000"], {
      cwd: mleDir,
      stdio: ["ignore", log, log],
    });
    mleProcess.on("error", (err) => console.error("mle-service failed to start:", err));
  }
  if (!(await isUp("http://localhost:3000/api/societies"))) {
    const log = openSync(path.join(frontendDir, "test-server.log"), "a");
    // Spawn Next's CLI entry directly via the same Node binary running this
    // script, instead of "npm run dev" -- spawning "npm.cmd" on Windows
    // reproducibly throws EINVAL (a known Node/Windows .cmd-spawning issue),
    // and the shell:true workaround for that breaks Next's own .env.local
    // loading (every DB-backed route then 500s with "DATABASE_URL is not
    // set"). Invoking the real next bin with node sidesteps both problems.
    const nextBin = path.join(frontendDir, "node_modules", "next", "dist", "bin", "next");
    nextProcess = spawn(process.execPath, [nextBin, "dev"], {
      cwd: frontendDir,
      stdio: ["ignore", log, log],
      env: { ...process.env, ...readEnvLocal(frontendDir) },
    });
    nextProcess.on("error", (err) => console.error("next dev failed to start:", err));
  }

  const teardown = async () => {
    if (mleProcess?.pid) killTree(mleProcess.pid);
    if (nextProcess?.pid) killTree(nextProcess.pid);
  };

  try {
    await Promise.all([
      waitForHealth("http://localhost:8000/health"),
      // A real DB-backed API route, not just a static page -- forces the dev
      // server through its (sometimes slow) first-compile + DB-connect cycle
      // before any test fires a real request at it.
      waitForHealth("http://localhost:3000/api/societies"),
    ]);
  } catch (err) {
    // Don't leak a half-started server if the health check itself fails.
    await teardown();
    throw err;
  }

  return teardown;
}
