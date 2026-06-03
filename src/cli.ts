import { spawn } from "node:child_process";

export interface SpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number; // timeout in milliseconds (default: 30000ms)
  shell?: boolean;
}

export interface SpawnResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
}

/**
 * Safely runs a CLI command or process. 
 * Supports setting a working directory, environment variables, and execution timeout.
 */
export function spawnCli(
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<SpawnResult> {
  const {
    cwd = process.cwd(),
    env = process.env as Record<string, string>,
    timeout = 30000,
    shell = true,
  } = options;

  return new Promise((resolve) => {
    let stdoutData = "";
    let stderrData = "";
    let isTerminated = false;

    const child = spawn(command, args, {
      cwd,
      env,
      shell,
    });

    const timer = setTimeout(() => {
      isTerminated = true;
      child.kill("SIGKILL");
      resolve({
        exitCode: null,
        stdout: stdoutData,
        stderr: stderrData,
        error: `Process timed out after ${timeout}ms.`,
      });
    }, timeout);

    child.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    child.on("error", (err) => {
      if (isTerminated) return;
      clearTimeout(timer);
      resolve({
        exitCode: null,
        stdout: stdoutData,
        stderr: stderrData,
        error: err.message,
      });
    });

    child.on("close", (code) => {
      if (isTerminated) return;
      clearTimeout(timer);
      resolve({
        exitCode: code,
        stdout: stdoutData,
        stderr: stderrData,
      });
    });
  });
}
