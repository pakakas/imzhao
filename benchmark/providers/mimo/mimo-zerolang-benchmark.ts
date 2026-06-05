#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';
import { parseArgs } from 'util';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    outfile: { type: 'string', short: 'o', default: '' },
    apikey: { type: 'string', short: 'a', default: '' },
    reasoning: { type: 'string', short: 'r', default: 'low' },
  },
  strict: true,
  allowPositionals: true,
});

const apikey = (values.apikey || process.env.MIMO_API_KEY || '').replace(/\s*#.*$/, '').trim();
if (!apikey) {
  console.error('❌ API Key tidak ditemukan! Set MIMO_API_KEY atau gunakan --apikey');
  process.exit(1);
}

const reasoning = values.reasoning || 'low';
const outpath = values.outfile || path.resolve(import.meta.dir, '../results/zerolang-mimo-benchmark.md');

const scenarioDir = path.resolve(import.meta.dir, '../scenarios/zerolang-error/payloads');

const mzHeader = 'MZrulesⓖgridʀrowᴄcolumns¦delimiter→is※gridreference★titleɛescape';
const mzHeaderMdkv = "MZrules:ⓖ=grid:ʀ=row:ᴄ=columns:¦=delimiter:→=is:※=gridreference:★=title:ɛ=escape";
const mzHeaderEnglish = `Agent Data Notation:
ⓖ is grid marker
ʀ is row marker
ᴄ is column marker
¦ is delimiter
→ is key-value relation
※ is grid reference
★ is title marker
ɛ is escape marker`;

const payloads = [
    { name: 'JSON compact', file: path.join(scenarioDir, 'json.txt'), sysprompt: '' },
    { name: 'MDKV Minified', file: path.join(scenarioDir, 'mdkv.txt'), sysprompt: '' },
    { name: 'MarkZero (ADN)', file: path.join(scenarioDir, 'mz.txt'), sysprompt: '' },
    { name: 'MZ Header (sys)', file: path.join(scenarioDir, 'mz.txt'), sysprompt: mzHeader },
    { name: 'MZ Header MDKV (sys)', file: path.join(scenarioDir, 'mz.txt'), sysprompt: mzHeaderMdkv },
    { name: 'MZ Header English (sys)', file: path.join(scenarioDir, 'mz.txt'), sysprompt: mzHeaderEnglish },
    { name: 'MZ Header (payload)', file: path.join(scenarioDir, 'mz-header.txt'), sysprompt: '' },
    { name: 'TOON', file: path.join(scenarioDir, 'toon.txt'), sysprompt: '' },
];

const results: any = {};

async function runMimoBenchmark(name: string, userContent: string, systemPrompt?: string) {
  const startTime = Date.now();
  const messages = systemPrompt ? [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ] : [
    { role: 'user', content: userContent }
  ];

  try {
    const response = await fetch(`${process.env.MIMO_API_URL || 'https://api.xiaomimimo.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages: messages,
        reasoning_effort: reasoning,
        temperature: 0.01,
        top_p: 1.0,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (data.choices && data.choices[0]) {
      results[name] = {
        input: data.usage?.prompt_tokens || 0,
        reasoning: data.choices[0].message?.reasoning_tokens