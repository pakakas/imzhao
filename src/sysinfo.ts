import * as os from "node:os";

export interface SystemDiagnostics {
  platform: string;
  arch: string;
  release: string;
  uptime: number;
  memory: {
    totalBytes: number;
    freeBytes: number;
    usedPercent: number;
  };
  cpu: {
    model: string;
    cores: number;
    loadAvg: number[];
  };
  runtime: {
    nodeVersion: string;
    bunVersion?: string;
    cwd: string;
  };
}

/**
 * Gathers system diagnostics and runtime environment information.
 * Vital for DevOps tasks to assess execution environment health and capacity.
 */
export function getSystemDiagnostics(): SystemDiagnostics {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usedPercent = totalMem > 0 ? parseFloat(((usedMem / totalMem) * 100).toFixed(2)) : 0;

  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown";

  // Check if running inside Bun
  const bunVersion = (globalThis as any).Bun?.version;

  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    memory: {
      totalBytes: totalMem,
      freeBytes: freeMem,
      usedPercent,
    },
    cpu: {
      model: cpuModel,
      cores: cpus.length,
      loadAvg: os.loadavg(),
    },
    runtime: {
      nodeVersion: process.version,
      bunVersion,
      cwd: process.cwd(),
    },
  };
}
