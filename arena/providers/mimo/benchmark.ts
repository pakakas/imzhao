#!/usr/bin/env bun
/**
 * MiMo Benchmark Provider
 * Uses shared llm-utils for API calls, MiMo-specific for pricing/reasoning.
 */
import { parseArgs } from "util";
import fs from 'fs';
import path from 'path';
import { loadScenario, listScenarios } from '../../scenario-loader';
import { callLlm, getTokenUsage, cleanEnvValue, type LlmConfig } from '../../llm-utils';
import { writeReport, type BenchmarkRun } from '../../output-template';
import { encode } from '../../../../markzero/src/index';

// Approximate pricing (USD per 1M tokens)
const PRICING: Record<string, { input: number; output: number }> = {
  "mimo-v2.5-pro": { input: 0.10, output: 0.30 },
  "mimo-v2.5": { input: 0.05, output: 0.15 },
};

const estimateCost = (tokens: number, type: "input" | "output" = "input", modelId = "mimo-v2.5-pro"): string => {
  const price = PRICING[modelId] || PRICING["mimo-v2.5-pro"];
  const rate = type === "input" ? price.input : price.output;
  return `$${((tokens / 1_000_000) * rate).toFixed(6)}`;
};

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    apikey:   { type: 'string', short: 'k' },
    outfile:  { type: 'string', short: 'o' },
    reasoning:{ type: 'string', short: 'r', default: 'low' },
    model:    { type: 'string', short: 'm', default: 'mimo-v2.5-pro' },
    scenario: { type: 'string', short: 's', default: 'zerolang-error' },
    list:     { type: 'boolean', short: 'l' },
  },
  strict: true,
  allowPositionals: true,
});

const config: LlmConfig = {
  baseUrl: cleanEnvValue(process.env.MIMO_API_URL || 'https://api.xiaomimimo.com/v1'),
  apikey: cleanEnvValue(values.apikey || process.env.MIMO_API_KEY || ''),
  model: values.model,
};

if (values.list) {
  const names = listScenarios();
  console.log('📋 Available scenarios:');
  names.forEach(n => console.log(`  - ${n}`));
  process.exit(0);
}

if (!config.apikey) {
  console.error('❌ No MIMO_API_KEY found. Set in .env or use --apikey');
  process.exit(1);
}

const scenarioName = values.scenario;
const reasoning = values.reasoning;

// Load scenario
const scenario = loadScenario(scenarioName);
if (!scenario) {
  console.error(`❌ Scenario '${scenarioName}' not found!`);
  const names = listScenarios();
  console.log('Available:', names.join(', '));
  process.exit(1);
}

console.log(`🚀 MIMO Benchmark - Scenario: ${scenarioName}`);
console.log(`📦 Payloads: ${scenario.payloads.map(p => p.name).join(', ')}`);

const results: Record<string, any> = {};
const errors: string[] = [];
const runs: BenchmarkRun[] = [];

// MiMo-specific payload with reasoning_effort
const makeMimoPayload = (content: string) => ({
  model: config.model,
  temperature: 0.01,
  top_p: 1.0,
  reasoning_effort: reasoning,
  messages: [{ role: 'user', content }],
});

const callMimoLlm = async (content: string) => {
  const payload = makeMimoPayload(content);
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apikey}`,
    },
    body: JSON.stringify(payload),
  });
  const d = await response.json() as any;
  if (d.error || d.type === "error") {
    const msg = d.error?.message || d.error?.type || JSON.stringify(d.error);
    console.log(`  ❌ [${response.status}] ${msg}`);
    return null;
  }
  return d;
};

// Run all benchmarks
for (const p of scenario.payloads) {
  const startTime = Date.now();
  console.log(`\n--- Payload: ${p.name} ---`);

  const data = await callMimoLlm(p.content);
  const latency = Date.now() - startTime;

  if (data && data.choices?.[0]) {
    const usage = getTokenUsage(data);
    const reasoningTokens = data.usage?.completion_tokens_details?.reasoning_tokens || 0;

    console.log(`  Tokens: ${usage.prompt} in / ${reasoningTokens} reasoning / ${usage.completion} out / ${usage.total} total`);
    console.log(`  Latency: ${latency}ms`);

    results[p.name] = { ...usage, reasoning: reasoningTokens, latency, rawInput: p.content, rawOutput: data.choices[0]?.message?.content || '' };
    runs.push({ encodingType: p.name, promptTokens: usage.prompt, completionTokens: usage.completion, totalTokens: usage.total });
  } else {
    const errMsg = data?.error?.message || JSON.stringify(data).slice(0, 200);
    console.error(`  ❌ Error: ${errMsg}`);
    errors.push(`${p.name}: ${errMsg}`);
    results[p.name] = { prompt: 0, completion: 0, total: 0, reasoning: 0, latency: 0, rawInput: p.content, rawOutput: '', error: errMsg };
    runs.push({ encodingType: p.name, promptTokens: 0, completionTokens: 0, totalTokens: 0 });
  }

  // Cooldown between payloads
  if (p !== scenario.payloads[scenario.payloads.length - 1]) {
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Generate shared report
const outdir = path.resolve(import.meta.dir, '../../results');
const outfile = writeReport({
  provider: 'MiMo',
  model: `${config.model} (${reasoning} reasoning)`,
  scenario: scenarioName,
  date: new Date().toISOString(),
  runs,
}, outdir, values.outfile || undefined);

console.log(`\n📄 Report: ${outfile}`);

// MiMo-specific: dual output with .mz (machine-readable)
const names = scenario.payloads.map(p => p.name);
const mzData = {
  model: config.model,
  scenario: scenarioName,
  reasoning,
  timestamp: new Date().toISOString(),
  results: names.map(n => ({
    name: n,
    input: results[n].prompt,
    output: results[n].completion,
    reasoning: results[n].reasoning,
    total: results[n].total,
    latency: results[n].latency,
    costInput: results[n].error ? 0 : (results[n].prompt / 1_000_000) * ((PRICING[config.model] || PRICING["mimo-v2.5-pro"]).input),
    costOutput: results[n].error ? 0 : (results[n].completion / 1_000_000) * ((PRICING[config.model] || PRICING["mimo-v2.5-pro"]).output),
    ...(results[n].error && { error: results[n].error })
  })),
  ...(errors.length > 0 && { errors })
};

const mzPath = outfile.replace(/\.md$/, '.mz');
fs.writeFileSync(mzPath, encode(mzData));
console.log(`📦 MarkZero results: ${mzPath}`);

console.log(`\n✅ Benchmark completed (${names.length} payloads).`);
if (errors.length > 0) console.log(`⚠️  ${errors.length} errors occurred.`);
