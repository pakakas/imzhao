#!/usr/bin/env bun
import { GPTTokens } from "gpt-tokens";
import { encode, ENC_INTERN_ALL } from "@pakakas/markzero";

const MODEL = "gpt-4o";

function countTokens(text: string) {
  const usage = new GPTTokens({
    model: MODEL as any,
    messages: [{ role: "user", content: text }]
  });
  return usage.usedTokens - 7;
}

const stackFrames = [
  { at: "run", file: "F:/work/00-oss/pakakas/src/index.ts", line: "45:12" },
  { at: "process.processTicksAndRejections", file: "node:internal/process/task_queues", line: "95:5" },
  { at: "async runTool", file: "F:/work/00-oss/pakakas/pakakasb/main.ts", line: "120:5" },
  { at: "run", file: "F:/work/00-oss/pakakas/src/index.ts", line: "45:12" },
  { at: "process.processTicksAndRejections", file: "node:internal/process/task_queues", line: "95:5" },
  { at: "async runTool", file: "F:/work/00-oss/pakakas/pakakasb/main.ts", line: "120:5" }
];

// 1. Raw Stdout Format
const rawStdout = `TypeError: Cannot read property 'map' of undefined\n` + 
  stackFrames.map(s => `    at ${s.at} (${s.file}:${s.line})`).join('\n');

// 2. JSON Format
const jsonFormatted = JSON.stringify({
  error: "TypeError: Cannot read property 'map' of undefined",
  stack: stackFrames
}, null, 2);

// 3. PAP v1 Format
const papData = [
  { error: "TypeError: Cannot read property 'map' of undefined" },
  stackFrames
];
const papFormatted = encode(papData, ENC_INTERN_ALL);

console.log("\n--- 1. CONVENTIONAL STDOUT ---");
console.log(rawStdout);
console.log(`Tokens: ${countTokens(rawStdout)}`);

console.log("\n--- 2. JSON FORMATTED ---");
console.log(jsonFormatted);
console.log(`Tokens: ${countTokens(jsonFormatted)}`);

console.log("\n--- 3. PAP v1 (Pakakas Agent Protocol) ---");
console.log(papFormatted);
console.log(`Tokens: ${countTokens(papFormatted)}`);

console.log("\n--- SUMMARY ---");
const results = [
  { format: "Stdout", tokens: countTokens(rawStdout) },
  { format: "JSON", tokens: countTokens(jsonFormatted) },
  { format: "PAP v1", tokens: countTokens(papFormatted) }
];
console.table(results);
