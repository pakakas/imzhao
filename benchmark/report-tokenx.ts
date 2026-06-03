#!/usr/bin/env bun
import { estimateTokenCount } from "tokenx";
import { encode, ENC_VALUES, ENC_INTERN_ALL } from "@pakakas/markzero";
import { writeFileSync } from "node:fs";

function toDodJson(data: any): string {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
    return JSON.stringify(data);
  }
  const keys = Object.keys(data[0]);
  const dod: any = { _: "dod" };
  keys.forEach(k => {
    dod[k] = data.map((item: any) => item[k]);
  });
  return JSON.stringify(dod);
}

const langScenarios = [
  { name: "Zig", raw: "/src/main.zig:10:5: 0x103456 in main\n    try secondFunction();\n    ^\n/src/main.zig:20:9: 0x103789 in secondFunction\n    return error.FileNotFound;\n    ^", data: [{ loc: "/src/main.zig:10:5", func: "main", msg: "try secondFunction()" }, { loc: "/src/main.zig:20:9", func: "secondFunction", msg: "return error.FileNotFound" }] },
  { name: "Go", raw: "panic: runtime error: index out of range\ngoroutine 1 [running]:\nmain.main()\n    /app/main.go:15 +0x25\nruntime.main()\n    /app/runtime.go:200 +0x112", data: { panic: "runtime error: index out of range", goroutine: 1, state: "running", stack: [{ func: "main.main", loc: "/app/main.go:15", pc: "0x25" }, { func: "runtime.main", loc: "/app/runtime.go:200", pc: "0x112" }] } },
  { name: "Rust", raw: "stack backtrace:\n   0: rust_begin_unwind\n             at src/libstd/panicking.rs:35\n   1: core::panicking::panic_fmt\n             at src/libcore/panicking.rs:12\n   2: my_app::main\n             at src/main.rs:5", data: [{ frame: 0, func: "rust_begin_unwind", loc: "src/libstd/panicking.rs:35" }, { frame: 1, func: "core::panicking::panic_fmt", loc: "src/libcore/panicking.rs:12" }, { frame: 2, func: "my_app::main", loc: "src/main.rs:5" }] },
  { name: "PHP", raw: "Fatal error: Uncaught Exception in /app/index.php:5\nStack trace:\n#0 /app/index.php(5): divide(10, 0)\n#1 /app/server.php(120): handleRequest('GET', '/')\n#2 {main}", data: [{ id: 0, loc: "/app/index.php:5", call: "divide(10, 0)" }, { id: 1, loc: "/app/server.php:120", call: "handleRequest('GET', '/')" }, { id: 2, loc: "{main}", call: "" }] },
  { name: "TypeScript", raw: "Error: Something went wrong\n    at Object.<anonymous> (/work/project/src/services/user.service.ts:12:5)\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1130:10)", data: [{ func: "Object.<anonymous>", loc: "/work/project/src/services/user.service.ts:12:5" }, { func: "Module._compile", loc: "node:internal/modules/cjs/loader:1101:14" }, { func: "Object.Module._extensions..js", loc: "node:internal/modules/cjs/loader:1130:10" }] },
  { 
    name: "Bun (with Context)", 
    raw: "TypeError: undefined is not an object (evaluating 'decodedRows.map')\n      at /work/src/pap/decode.ts:114:26\n      112 |         // Mode: Explicit Headers\n      113 |         const headers = cellsOfFirstRow.map(resolve);\n    > 114 |         const decodedRows = rows.map(row => {\n          |                          ^\n      115 |           const cells = row.split(ITEM_SEP);", 
    data: [{
      error: "TypeError: undefined is not an object (evaluating 'decodedRows.map')",
      at: "/work/src/pap/decode.ts:114:26",
      context: [
        { l: 112, c: "// Mode: Explicit Headers" },
        { l: 113, c: "const headers = cellsOfFirstRow.map(resolve);" },
        { l: 114, c: "const decodedRows = rows.map(row => {", active: true },
        { l: 115, c: "const cells = row.split(ITEM_SEP);" }
      ]
    }]
  }
];

// 2. GENERATION LOGIC
let md = `# TokenX Benchmark Report (Heuristic Estimation)\n\n`;
md += `This report uses the **tokenx** library for token estimation. Unlike Tiktoken-based counters, **tokenx** uses fast heuristics to estimate token counts.\n\n`;
md += `*Generated automatically on: ${new Date().toLocaleString()}*\n\n`;

md += `## 1. Cross-Language Stack Traces (via TokenX)\n`;
md += `Formats are sorted from **Winner** (Top) to **Worst** (Bottom). Gain (%) is relative to the **Worst** format.\n\n`;

langScenarios.forEach(s => {
  md += `### ${s.name} Stack Trace\n\n`;
  md += `<details>\n<summary><b>Click to view Raw Stack Trace</b></summary>\n<br/>\n`;
  md += `<pre><code>${s.raw}</code></pre>\n`;
  md += `</details>\n\n`;

  md += `| Format | Estimated Tokens | Efficiency Gain |\n`;
  md += `| :--- | :---: | :---: |\n`;

  const formats = [
    { n: "RAW (Stderr)", t: estimateTokenCount(s.raw) },
    { n: "JSON (Minified)", t: estimateTokenCount(JSON.stringify(s.data)) },
    { n: "JSON (DoD)", t: estimateTokenCount(toDodJson(s.data)) },
    { n: "PAP (No interning)", t: estimateTokenCount(encode(s.data)) },
    { n: "PAP (Value interning)", t: estimateTokenCount(encode(s.data, ENC_VALUES)) },
    { n: "PAP (Full interning)", t: estimateTokenCount(encode(s.data, ENC_INTERN_ALL)) }
  ].sort((a, b) => a.t - b.t);

  const maxT = Math.max(...formats.map(f => f.t));

  formats.forEach(f => {
    const isWinner = f === formats[0];
    const isWorst = f.t === maxT;
    const name = isWinner ? `**${f.n}**` : f.n;
    const tokens = isWinner ? `**${f.t}T**` : `${f.t}T`;
    const gainVal = ((maxT - f.t) / maxT * 100);
    const gain = isWorst ? "WORST (BASE)" : `+${gainVal.toFixed(1)}%`;
    md += `| ${name} | ${tokens} | ${gain} |\n`;
  });
  md += `\n`;
});

const reportPath = ".internal/laporan-tokenx.md";
writeFileSync(reportPath, md);
console.log(`✅ TokenX report generated at: ${reportPath}`);
