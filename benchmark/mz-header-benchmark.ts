#!/usr/bin/env bun
import { addInlineDecoder, ENC_INTERN } from "../src/mz-header.ts";
import { encode } from "@pakakas/markzero";
import { GPTTokens } from "gpt-tokens";

const MODEL = "gpt-4o";

function countTokens(text: string) {
  const usage = new GPTTokens({
    model: MODEL as any,
    messages: [{ role: "user", content: text }]
  });
  return usage.usedTokens - 7;
}

const scenarios = [
  {
    name: "Small Payload (1 row)",
    desc: "Simple key-value pair.",
    data: [{ id: 1, name: "Test", status: "active" }]
  },
  {
    name: "Medium Payload (10 rows)",
    desc: "Simple table data.",
    data: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      product: `Widget ${i + 1}`,
      price: (Math.random() * 100).toFixed(2),
      stock: Math.floor(Math.random() * 1000)
    }))
  },
  {
    name: "Large Payload (100 rows)",
    desc: "More complex table data.",
    data: Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      user: `user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "editor" : "viewer",
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    }))
  }
];

console.log(`\n🚀 MZ Header Benchmark (Model: ${MODEL})\n`);
console.log(`${"Scenario".padEnd(25)} | ${"No Header".padStart(10)} | ${"With Header".padStart(10)} | ${"Overhead".padStart(10)}`);
console.log("-".repeat(65));

let totalBenchmarkTimeNoHeader = 0;
let totalBenchmarkTimeWithHeader = 0;
const RUNS = 10000;

scenarios.forEach(s => {
  const rawPayload = encode(s.data);
  
  // Token count
  const tokensNoHeader = countTokens(rawPayload);
  const payloadWithHeader = addInlineDecoder(rawPayload);
  const tokensWithHeader = countTokens(payloadWithHeader);
  const overhead = tokensWithHeader - tokensNoHeader;
  const overheadPercent = ((overhead / tokensNoHeader) * 100).toFixed(1);
  
  // Speed benchmark
  const startNoHeader = performance.now();
  for (let i = 0; i < RUNS; i++) { rawPayload; }
  const endNoHeader = performance.now();
  totalBenchmarkTimeNoHeader += endNoHeader - startNoHeader;
  
  const startWithHeader = performance.now();
  for (let i = 0; i < RUNS; i++) { addInlineDecoder(rawPayload); }
  const endWithHeader = performance.now();
  totalBenchmarkTimeWithHeader += endWithHeader - startWithHeader;
  
  // Output
  console.log(`${s.name.padEnd(25)} | ${tokensNoHeader.toString().padStart(10)} | ${tokensWithHeader.toString().padStart(10)} | ${`${overhead} (+${overheadPercent}%)`.padStart(10)}`);
  console.log(`  Avg addInlineDecoder: ${((endWithHeader - startWithHeader) / RUNS).toFixed(4)} ms/op`);
  console.log("-".repeat(65));
});

console.log(`\n✅ Benchmark complete!`);
console.log(`Total time no header (${RUNS * scenarios.length} ops): ${totalBenchmarkTimeNoHeader.toFixed(2)} ms`);
console.log(`Total time with header (${RUNS * scenarios.length} ops): ${totalBenchmarkTimeWithHeader.toFixed(2)} ms`);
