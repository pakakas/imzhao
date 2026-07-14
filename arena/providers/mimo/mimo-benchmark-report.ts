#!/usr/bin/env bun
import { parseArgs } from "util";
import fs from 'fs';
import path from 'path';
import { loadScenario, listScenarios, type Scenario } from '../scenario-loader';

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    apikey: { type: 'string', short: 'k' },
    outfile: { type: 'string', short: 'o' },
    reasoning: { type: 'string', short: 'r' },
    model: { type: 'string', short: 'm' },
    scenario: { type: 'string', short: 's' },
    list: { type: 'boolean', short: 'l' },
  },
  strict: true,
  allowPositionals: true,
});

const scenariosDir = path.resolve(import.meta.dir, '../scenarios');

// List scenarios
if (values.list) {
  const names = await listScenarios(scenariosDir);
  console.log('📋 Available scenarios:');
  names.forEach(n => console.log(`  - ${n}`));
  process.exit(0);
}

const apikey = values.apikey || process.env.MIMO_API_KEY;
if (!apikey) {
  console.error('❌ Error: MIMO_API_KEY environment variable or --apikey required!');
  process.exit(1);
}

const scenarioName = values.scenario || 'zerolang-error';
const outfile = values.outfile || `./results/${new Date().toISOString().replace(/[:.]/g, '-')}-mimo-${scenarioName}.md`;
const reasoning = values.reasoning || 'low';
const model = values.model || 'mimo-v2.5-pro';

let outpath;
if (path.isAbsolute(outfile)) {
  outpath = outfile;
} else {
  outpath = path.resolve(process.cwd(), outfile);
}

// Load scenario
const scenario = await loadScenario(scenariosDir, scenarioName);
if (!scenario) {
  console.error(`❌ Scenario '${scenarioName}' not found!`);
  const names = await listScenarios(scenariosDir);
  console.log('Available:', names.join(', '));
  process.exit(1);
}

console.log(`🚀 MIMO Benchmark - Scenario: ${scenarioName}`);
console.log(`📁 Output: ${outpath}`);
console.log(`📦 Payloads: ${scenario.payloads.map(p => p.name).join(', ')}`);

const results: Record<string, any> = {};

async function runMimoBenchmark(name: string, userContent: string) {
  const startTime = Date.now();

  console.log(`\n======================================`);
  console.log(`Menjalankan benchmark untuk: ${name}`);
  console.log(`======================================`);

  const response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apikey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: userContent }],
      reasoning_effort: reasoning,
      temperature: 0.01,
      top_p: 1.0
    })
  });

  const result = await response.json();
  const endTime = Date.now();

  if (result.choices && result.choices[0]) {
    const inputTokens = result.usage?.prompt_tokens || 0;
    const reasoningTokens = result.usage?.completion_tokens_details?.reasoning_tokens || 0;
    const outputTokens = result.usage?.completion_tokens || 0;
    const totalTokens = inputTokens + outputTokens;
    const latency = endTime - startTime;
    const rawOutput = result.choices[0]?.message?.content || '';

    results[name] = { input: inputTokens, reasoning: reasoningTokens, output: outputTokens, total: totalTokens, latency, rawInput: userContent, rawOutput };
    console.log(`✅ ${name} selesai!`);
    console.log(`  Input: ${inputTokens}, Reasoning: ${reasoningTokens}, Output: ${outputTokens}, Total: ${totalTokens}`);
    console.log(`  Latency: ${latency}ms`);
  } else {
    console.error(`❌ Error untuk ${name}:`);
    console.error(result);
    results[name] = { input: 0, reasoning: 0, output: 0, total: 0, latency: 0, rawInput: userContent, rawOutput: JSON.stringify(result) };
  }
}

// Run all benchmarks
for (const p of scenario.payloads) {
  await runMimoBenchmark(p.name, p.content);
  if (p !== scenario.payloads[scenario.payloads.length - 1]) {
    console.log(`❄️ Cooldown 2 detik sebelum lanjut...`);
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Generate Markdown report
const escapeMd = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n: number) => n.toLocaleString();
const names = scenario.payloads.map(p => p.name);

// Find best (lowest total) for highlighting
const bestTotal = names.reduce((best, n) => results[n].total < results[best].total ? n : best, names[0]);
const bestLatency = names.reduce((best, n) => results[n].latency < results[best].latency ? n : best, names[0]);

const report = `# Benchmark: ${scenarioName} (MIMO - ${reasoning} effort)

*Generated on ${new Date().toLocaleString()}*

**Model:** ${model} | **Reasoning:** ${reasoning} | **Scenario:** ${scenarioName}

## Results

| Metric | ${names.join(' | ')} |
| :--- | ${names.map(() => ':---:').join(' | ')} |
| **Input** (Tokens) | ${names.map(n => fmt(results[n].input)).join(' | ')} |
| **Reasoning** (Tokens) | ${names.map(n => fmt(results[n].reasoning)).join(' | ')} |
| **Output** (Tokens) | ${names.map(n => fmt(results[n].output)).join(' | ')} |
| **Total** (Tokens) | ${names.map(n => n === bestTotal ? `**${fmt(results[n].total)}** 👑` : fmt(results[n].total)).join(' | ')} |
| **Latency** (ms) | ${names.map(n => n === bestLatency ? `**${fmt(results[n].latency)}** 👑` : fmt(results[n].latency)).join(' | ')} |

## Raw I/O

| Format | Input | Output |
| :--- | :--- | :--- |
${names.map(n => `| **${n}** | <pre>${escapeMd(results[n].rawInput.substring(0, 200))}</pre> | <pre>${escapeMd(results[n].rawOutput.substring(0, 500))}</pre> |`).join('\n')}
`;

fs.writeFileSync(outpath, report);
console.log(`\n✅ Laporan: ${outpath}`);
