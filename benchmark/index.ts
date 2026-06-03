#!/usr/bin/env bun
import { parseArgs } from 'util';
import path from 'path';
import { spawn } from 'child_process';
import { listScenarios } from './scenario-loader';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    outdir: { type: 'string', default: './results' },
    provider: { type: 'string', short: 'p', default: 'all' },
    scenario: { type: 'string', short: 's' },
    list: { type: 'boolean', short: 'l' },
  },
  strict: true,
  allowPositionals: true,
});

const scenariosDir = path.resolve(import.meta.dir, 'scenarios');

if (values.list) {
  const names = await listScenarios(scenariosDir);
  console.log('📋 Available scenarios:');
  names.forEach(n => console.log(`  - ${n}`));
  process.exit(0);
}

const outdir = values.outdir || './results';
const provider = values.provider || 'all';
const scenario = values.scenario || 'zerolang-error';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🚀 Pakakas Benchmark Runner');
console.log(`📁 Output directory: ${outdir}`);
console.log(`📋 Provider: ${provider}`);
console.log(`🎯 Scenario: ${scenario}`);
console.log('');

async function runBenchmark(name: string, script: string, args: string[]) {
  console.log(`🔄 Running ${name}...`);
  return new Promise<void>((resolve, reject) => {
    const child = spawn('bun', ['run', script, ...args], {
      cwd: path.resolve(import.meta.dir, '../..'),
      stdio: 'inherit',
    });
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} selesai!`);
        resolve();
      } else {
        console.error(`❌ ${name} gagal! Exit code: ${code}`);
        reject(new Error(`${name} gagal`));
      }
    });
  });
}

async function main() {
  try {
    if (provider === 'all' || provider === 'mimo') {
      const outfile = path.resolve(import.meta.dir, outdir, `${timestamp}-mimo-${scenario}.md`);
      await runBenchmark('MiMo Benchmark', path.join(import.meta.dir, 'mimo/mimo-benchmark-report.ts'), [
        '--scenario', scenario,
        '--outfile', outfile,
      ]);
      console.log(`📄 Hasil MiMo: ${outfile}\n`);
    }

    if (provider === 'all' || provider === 'grok') {
      const outfile = path.resolve(import.meta.dir, outdir, `${timestamp}-grok-${scenario}.md`);
      await runBenchmark('Grok Benchmark', path.join(import.meta.dir, 'grok-benchmark-report.ts'), [
        '--scenario', scenario,
        '--outfile', outfile,
      ]);
      console.log(`📄 Hasil Grok: ${outfile}\n`);
    }

    console.log('🎉 Semua benchmark selesai!');
  } catch (err) {
    console.error('❌ Benchmark gagal:', err);
    process.exit(1);
  }
}

main();
