#!/usr/bin/env bun
import { GPTTokens } from "gpt-tokens";
import { encode, ENC_VALUES, ENC_INTERN_ALL } from "@pakakas/markzero";

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
    name: "Repetitive Grid (10 rows)",
    desc: "Headers are keys, values are highly repetitive.",
    data: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      type: "regular-file-record",
      status: "active",
      owner: "pakakas-system",
      permission: "-rw-r--r--"
    }))
  },
  {
    name: "System Logs (10 entries)",
    desc: "Fixed keys, repetitive levels and process names.",
    data: Array.from({ length: 10 }, (_, i) => ({
      timestamp: `2026-05-23T23:55:${i.toString().padStart(2, '0')}Z`,
      level: i % 5 === 0 ? "ERROR" : "INFO",
      process: "pakakas-daemon",
      message: "Pulse check completed successfully"
    }))
  }
];

console.log(`\n🚀 PAP Encoding Modes Benchmark (Model: ${MODEL})\n`);
console.log(`${"Scenario".padEnd(25)} | ${"JSON".padStart(6)} | ${"DEF".padStart(6)} | ${"VALS".padStart(6)} | ${"ALL".padStart(6)}`);
console.log("-".repeat(70));

scenarios.forEach(s => {
  const jsonStr = JSON.stringify(s.data);
  const papDef = encode(s.data); // Default/Literal
  const papVals = encode(s.data, ENC_VALUES);
  const papAll = encode(s.data, ENC_INTERN_ALL);

  const jsonT = countTokens(jsonStr);
  const defT = countTokens(papDef);
  const valT = countTokens(papVals);
  const allT = countTokens(papAll);

  console.log(`${s.name.padEnd(25)} | ${jsonT.toString().padStart(6)} | ${defT.toString().padStart(6)} | ${valT.toString().padStart(6)} | ${allT.toString().padStart(6)}`);
  
  // Show visual difference for the first few characters
  console.log(`  [JSON] ${jsonStr.substring(0, 60)}...`);
  console.log(`  [DEF ] ${papDef.substring(0, 60)}...`);
  console.log(`  [VALS] ${papVals.substring(0, 60)}...`);
  console.log(`  [ALL ] ${papAll.substring(0, 60)}...`);
  console.log("-".repeat(70));
});

console.log("\n✅ DEF  : Literal mode (Markers only, no Pool).");
console.log("✅ VALS : Hardcoded keys/headers, pooled values.");
console.log("✅ ALL  : Pooled everything (keys + values).");
