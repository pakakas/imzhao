#!/usr/bin/env bun
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { loadScenario, listScenarios } from '../../scenario-loader';
import { encode } from '../../../../markzero/src/index';

// Approximate pricing (USD per 1M tokens) - update as needed
const PRICING: Record<string, { input: number; output: number }> = {
  "grok-3-mini": { input: 0.25, output: 0.50 },
  "grok-4-fast": { input: 0.20, output: 0.50 },
  "grok-4": { input: 3.00, output: 15.00 },
};

function estimateCost(tokens: number, type: "input" | "output" = "input", model = "grok-4"): string {
  const price = PRICING[model] || PRICING["grok-4"];
  const rate = type === "input" ? price.input : price.output;
  const cost = (tokens / 1_000_000) * rate;
  return `$${cost.toFixed(6)}`;
}

interface Metrics {
    input: number;
    output: number;
    reasoning: number;
    total: number;
    latency: number;
    rawInput: string;
    rawOutput: string;
    error?: string;
}

function parseMetrics(stdout: string, rawInput: string): Metrics | null {
    const startIdx = stdout.indexOf('JSON_OUTPUT_START');
    const endIdx = stdout.indexOf('JSON_OUTPUT_END');
    if (startIdx === -1 || endIdx === -1) return null;
    try {
        const jsonStr = stdout.substring(startIdx + 'JSON_OUTPUT_START'.length, endIdx).trim();
        const data = JSON.parse(jsonStr);
        if (data.error) return null;
        return {
            input: parseInt((data['Input'] || '0').replace(/,/g, ''), 10),
            output: parseInt((data['Output'] || '0').replace(/,/g, ''), 10),
            reasoning: parseInt((data['Reasoning'] || '0').replace(/,/g, ''), 10),
            total: parseInt((data['Total tokens'] || '0').replace(/,/g, ''), 10),
            latency: parseInt((data['Latency'] || '0').replace(/ms|,/g, ''), 10),
            rawInput: rawInput,
            rawOutput: data['rawOutput'] || ''
        };
    } catch { return null; }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

(async () => {
    const args = process.argv.slice(2);
    let scenarioName = 'zerolang-error';
    let outfile = '';
    let reasoning = 'high';
    let model = 'grok-4';
    const errors: string[] = [];

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--scenario' && args[i+1]) { scenarioName = args[i+1]; i++; }
        else if (args[i] === '--outfile' && args[i+1]) { outfile = args[i+1]; i++; }
        else if (args[i] === '--reasoning' && args[i+1]) { reasoning = args[i+1].toLowerCase(); i++; }
        else if (args[i] === '--model' && args[i+1]) { model = args[i+1]; i++; }
        else if (args[i] === '--list') {
            const names = await listScenarios(resolve(__dirname, 'scenarios'));
            console.log('📋 Available:', names.join(', '));
            process.exit(0);
        }
    }

    const scenariosDir = resolve(__dirname, 'scenarios');
    const scenario = await loadScenario(scenariosDir, scenarioName);
    if (!scenario) {
        console.error(`❌ Scenario '${scenarioName}' not found!`);
        const names = await listScenarios(scenariosDir);
        console.log('Available:', names.join(', '));
        process.exit(1);
    }

    if (!outfile) {
        outfile = `./results/${new Date().toISOString().replace(/[:.]/g, '-')}-grok-${scenarioName}.md`;
    }

    console.log(`🚀 Grok Benchmark - Scenario: ${scenarioName} (${reasoning.toUpperCase()} Reasoning)`);
    console.log(`📁 Output: ${outfile}`);
    console.log(`📦 Payloads: ${scenario.payloads.map(p => p.name).join(', ')}`);

    const results: Record<string, Metrics> = {};

    for (const p of scenario.payloads) {
        console.log(`\n======================================`);
        console.log(`Menjalankan benchmark untuk: ${p.name}`);
        console.log(`======================================`);

        // 1. Clear
        console.log("🧹 Membersihkan riwayat percakapan...");
        execSync('bun run ../../xai-web-console/grok-clear.ts', { stdio: 'inherit', cwd: __dirname });
        await sleep(2000);

        // 2. Run
        console.log(`💉 Menginjeksi payload ${p.name}...`);
        // Write content to temp file for grok-run.ts
        const tmpFile = resolve(__dirname, `results/.tmp-${p.name}.txt`);
        writeFileSync(tmpFile, p.content, 'utf-8');
        const cmd = `bun run ../../xai-web-console/grok-run.ts --input "${tmpFile}" --reasoning ${reasoning}`;
        execSync(cmd, { stdio: 'inherit', cwd: __dirname });

        // 3. Get metrics
        console.log("⏳ Menunggu Grok berpikir...");
        let metrics: Metrics | null = null;
        try {
            const out = execSync('bun run ../../xai-web-console/grok-get-metrics.ts', { encoding: 'utf-8', cwd: __dirname });
            metrics = parseMetrics(out, p.content);
            if (metrics) console.log("✅ Metrik berhasil ditarik!");
        } catch(e: any) {
            const msg = e?.message || String(e);
            errors.push(`${p.name}: ${msg}`);
            console.error("Error:", msg.slice(0, 100));
        }

        if (!metrics) {
            const errMsg = `GAGAL mendapatkan metrik untuk ${p.name}`;
            console.error(`❌ ${errMsg}`);
            errors.push(errMsg);
            results[p.name] = { input: 0, output: 0, reasoning: 0, total: 0, latency: 0, rawInput: p.content, rawOutput: '', error: errMsg };
        } else {
            results[p.name] = metrics;
        }
        console.log("❄️ Cooldown 5 detik...");
        await sleep(5000);
    }

    // Generate report
    console.log("\n📝 Men-generate Laporan...");
    const reportPath = resolve(__dirname, outfile);
    const fmt = (n: number) => n.toLocaleString('en-US');
    const escapeMd = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
    const names = scenario.payloads.map(p => p.name);

    const validNames = names.filter(n => !results[n].error);
    const bestTotal = validNames.length > 0
        ? validNames.reduce((best, n) => results[n].total < results[best].total ? n : best, validNames[0])
        : names[0];
    const bestLatency = validNames.length > 0
        ? validNames.reduce((best, n) => results[n].latency < results[best].latency ? n : best, validNames[0])
        : names[0];

    let md = `# Benchmark: ${scenarioName} (Grok - ${reasoning} effort)

*Generated on ${new Date().toLocaleString()}*

**Model:** ${model} | **Reasoning:** ${reasoning} | **Scenario:** ${scenarioName}

## Results

| Metric | ${names.join(' | ')} |
| :--- | ${names.map(() => ':---:').join(' | ')} |
| **Input** (Tokens) | ${names.map(n => results[n].error ? 'ERROR' : fmt(results[n].input)).join(' | ')} |
| **Reasoning** (Tokens) | ${names.map(n => results[n].error ? '-' : fmt(results[n].reasoning)).join(' | ')} |
| **Output** (Tokens) | ${names.map(n => results[n].error ? '-' : fmt(results[n].output)).join(' | ')} |
| **Total** (Tokens) | ${names.map(n => results[n].error ? '-' : (n === bestTotal ? `**${fmt(results[n].total)}** 👑` : fmt(results[n].total))).join(' | ')} |
| **Est. Cost (input)** | ${names.map(n => results[n].error ? '-' : estimateCost(results[n].input, 'input', model)).join(' | ')} |
| **Est. Cost (output)** | ${names.map(n => results[n].error ? '-' : estimateCost(results[n].output, 'output', model)).join(' | ')} |
| **Latency** (ms) | ${names.map(n => results[n].error ? '-' : (n === bestLatency ? `**${fmt(results[n].latency)}** 👑` : fmt(results[n].latency))).join(' | ')} |

## Raw I/O

| Format | Input | Output |
| :--- | :--- | :--- |
${names.map(n => `| **${n}** | <pre>${escapeMd(results[n].rawInput.substring(0, 200))}</pre> | <pre>${escapeMd(results[n].rawOutput.substring(0, 500))}</pre> |`).join('\n')}
`;

    if (errors.length > 0) {
        md += `\n## Errors\n\n`;
        errors.forEach(e => md += `- ${e}\n`);
    }

    // Dual output: .md (human) + .mz (machine)
    writeFileSync(reportPath, md, 'utf8');
    console.log(`📄 Human report: ${reportPath}`);

    const mzData = {
        model,
        scenario: scenarioName,
        reasoning,
        timestamp: new Date().toISOString(),
        results: names.map(n => ({
            name: n,
            input: results[n].input,
            output: results[n].output,
            reasoning: results[n].reasoning,
            total: results[n].total,
            latency: results[n].latency,
            costInput: results[n].error ? 0 : (results[n].input / 1_000_000) * ((PRICING[model] || PRICING["grok-4"]).input),
            costOutput: results[n].error ? 0 : (results[n].output / 1_000_000) * ((PRICING[model] || PRICING["grok-4"]).output),
            ...(results[n].error && { error: results[n].error })
        })),
        ...(errors.length > 0 && { errors })
    };

    const mzPath = reportPath.replace(/\.md$/, '.mz');
    writeFileSync(mzPath, encode(mzData));
    console.log(`📦 MarkZero results: ${mzPath}`);

    console.log(`\n✅ Benchmark completed (${names.length} payloads).`);
    if (errors.length > 0) console.log(`⚠️  ${errors.length} errors occurred.`);
})();
