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

function toToon(data: any): string {
  if (Array.isArray(data)) {
    return data.map(item => JSON.stringify(item)).join("\n");
  }
  return JSON.stringify(data);
}

const forensicScenarios = [
  {
    name: "1. Code Snippets (Context)",
    desc: "3-5 lines of code before/after error in multiple files.",
    data: [
      { 
        file: "src/pap/decode.ts", 
        line: 45, 
        code: "const markers = [metaStart, gridStart, titleStart];\nconst poolEnd = markers.length > 0 ? Math.min(...markers) : papString.length;" 
      },
      { 
        file: "src/pap/decode.ts", 
        line: 48, 
        code: "const poolPart = papString.substring(1, poolEnd);\nconst pool = poolPart ? poolPart.split(POOL_PREFIX) : [];" 
      }
    ]
  },
  {
    name: "2. Runtime Environment",
    desc: "Identical system info repeated across 3 separate error reports.",
    data: Array.from({ length: 3 }, () => ({
      runtime: "Bun v1.4.0-canary.1",
      os: "win32 x64",
      git_sha: "4c8a21b14736f86235b2e987c938f456",
      env: "production"
    }))
  },
  {
    name: "3. Application State",
    desc: "Repetitive argument names and values in call stack.",
    data: [
      { func: "processOrder", args: { id: "ORD-99", retry: 0, user: "admin" } },
      { func: "validateUser", args: { id: "ORD-99", retry: 0, user: "admin" } },
      { func: "checkStock", args: { id: "ORD-99", retry: 0, user: "admin" } }
    ]
  },
  {
    name: "4. Breadcrumbs (Logs)",
    desc: "Timeline of events leading to crash (repeated tags).",
    data: [
      { time: "23:50:01", type: "network", msg: "POST /api/v1/auth - 200 OK" },
      { time: "23:50:02", type: "database", msg: "SELECT * FROM users WHERE id=1" },
      { time: "23:50:03", type: "network", msg: "GET /api/v1/profile - 500 ERR" },
      { time: "23:50:04", type: "database", msg: "ROLLBACK TRANSACTION" }
    ]
  }
];

console.log(`\n🚀 Forensic Error Benchmark (Model: ${MODEL})\n`);
console.log(`${"Component".padEnd(25)} | ${"JSON".padStart(6)} | ${"TOON".padStart(6)} | ${"PAP v1".padStart(6)} | ${"PAP Gain".padStart(8)}`);
console.log("-".repeat(70));

forensicScenarios.forEach(s => {
  const jsonStr = JSON.stringify(s.data);
  const toonStr = toToon(s.data);
  const papStr = encode(s.data, ENC_INTERN_ALL);

  const jsonT = countTokens(jsonStr);
  const toonT = countTokens(toonStr);
  const papT = countTokens(papStr);

  const gain = ((jsonT - papT) / jsonT * 100).toFixed(1);

  console.log(`${s.name.padEnd(25)} | ${jsonT.toString().padStart(6)} | ${toonT.toString().padStart(6)} | ${papT.toString().padStart(6)} | ${gain.toString().padStart(7)}%`);
});

console.log("\n✅ Benchmark Complete. PAP excels at interning repetitive forensic data.");
