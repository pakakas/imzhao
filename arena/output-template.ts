/**
 * Shared benchmark report generator.
 * All providers use this for consistent output format.
 */
import * as fs from "fs";
import * as path from "path";

export interface BenchmarkRun {
  encodingType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  summary?: string;
}

export interface BenchmarkReport {
  provider: string;
  model: string;
  scenario: string;
  date: string;
  runs: BenchmarkRun[];
}

export const generateReport = (report: BenchmarkReport): string => {
  const lines: string[] = [
    `# ${report.provider} Benchmark: ${report.scenario}`,
    '',
    `**Provider:** ${report.provider}`,
    `**Model:** ${report.model}`,
    `**Date:** ${report.date}`,
    '',
    '## Results',
    '',
    '| Payload | Prompt Tokens | Completion Tokens | Total | Summary |',
    '|---------|--------------|-------------------|-------|---------|',
    ...report.runs.map(r =>
      `| ${r.encodingType} | ${r.promptTokens} | ${r.completionTokens} | ${r.totalTokens} | ${r.summary || ''} |`
    ),
    '',
    '## Analysis',
    '',
    generateAnalysis(report.runs),
    '',
  ];
  return lines.join('\n');
};

const generateAnalysis = (runs: BenchmarkRun[]): string => {
  if (runs.length === 0) return '_No data._';

  const sorted = [...runs].sort((a, b) => a.promptTokens - b.promptTokens);
  const smallest = sorted[0];
  const largest = sorted[sorted.length - 1];

  const lines: string[] = [
    `- **Smallest payload:** ${smallest.encodingType} (${smallest.promptTokens} prompt tokens)`,
    `- **Largest payload:** ${largest.encodingType} (${largest.promptTokens} prompt tokens)`,
  ];

  if (smallest.promptTokens > 0 && largest.promptTokens > 0) {
    const ratio = (largest.promptTokens / smallest.promptTokens).toFixed(1);
    lines.push(`- **Token ratio (largest/smallest):** ${ratio}x`);
  }

  return lines.join('\n');
};

export const writeReport = (report: BenchmarkReport, outdir: string, customPath?: string): string => {
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 15);
  const outfile = customPath || path.join(outdir, `${timestamp}-${report.provider.toLowerCase()}-${report.scenario}.md`);

  fs.writeFileSync(outfile, generateReport(report));
  return outfile;
};
