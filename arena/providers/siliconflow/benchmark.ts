#!/usr/bin/env bun
/**
 * SiliconFlow Benchmark Provider
 * OpenAI-compatible API — only config differs from other providers.
 */
import { parseArgs } from "util";
import * as path from "path";
import * as fs from "fs";
import { loadScenario, listScenarios } from '../../scenario-loader';
import { callLlm, makePayload, getTokenUsage, cleanEnvValue, type LlmConfig } from '../../llm-utils';
import { writeReport, type BenchmarkRun } from '../../output-template';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    scenario: { type: 'string', short: 's', default: 'mz-legends' },
    outfile:  { type: 'string', short: 'o', default: '' },
    model:    { type: 'string', short: 'm', default: 'Qwen/Qwen3-8B' },
    apikey:   { type: 'string', short: 'k', default: '' },
  },
  strict: true,
  allowPositionals: true,
});

const config: LlmConfig = {
  baseUrl: cleanEnvValue(process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1'),
  apikey: cleanEnvValue(values.apikey || process.env.SILICONFLOW_API_KEY || ''),
  model: values.model,
};

const main = async () => {
  if (!config.apikey) {
    console.error('❌ No SILICONFLOW_API_KEY found. Set in .env or use --apikey');
    process.exit(1);
  }

  console.log(`\n🚀 SiliconFlow Benchmark (${config.model})`);
  console.log(`📋 Scenario: ${values.scenario}\n`);

  const scenarios = listScenarios();
  const scenarioName = scenarios.find(s => s === values.scenario) || values.scenario;
  const scenario = loadScenario(scenarioName);

  if (!scenario) {
    console.error(`❌ Scenario '${scenarioName}' not found. Available: ${scenarios.join(', ')}`);
    process.exit(1);
  }

  const runs: BenchmarkRun[] = [];

  for (const payloadInfo of scenario.payloads) {
    const content = fs.readFileSync(payloadInfo.fullPath, 'utf-8').trim();

    console.log(`\n--- Payload: ${payloadInfo.name} ---`);
    const data = await callLlm(makePayload(content, config), config);
    const usage = getTokenUsage(data);

    if (data) {
      console.log(`  Tokens: ${usage.prompt} in / ${usage.completion} out / ${usage.total} total`);
      runs.push({
        encodingType: payloadInfo.name,
        promptTokens: usage.prompt,
        completionTokens: usage.completion,
        totalTokens: usage.total,
      });
    } else {
      runs.push({ encodingType: payloadInfo.name, promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    }
  }

  const outdir = path.resolve(import.meta.dir, '../../results');
  const outfile = writeReport({
    provider: 'SiliconFlow',
    model: config.model,
    scenario: scenarioName,
    date: new Date().toISOString(),
    runs,
  }, outdir, values.outfile || undefined);

  console.log(`\n📄 Report: ${outfile}`);
};

main().catch(console.error);
