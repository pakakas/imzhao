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

const langScenarios = [
  {
    name: "Zig (Error Tracing)",
    raw: "/src/main.zig:10:5: 0x103456 in main\n    try secondFunction();\n    ^\n/src/main.zig:20:9: 0x103789 in secondFunction\n    return error.FileNotFound;\n    ^",
    data: [
      { loc: "/src/main.zig:10:5", func: "main", msg: "try secondFunction()" },
      { loc: "/src/main.zig:20:9", func: "secondFunction", msg: "return error.FileNotFound" }
    ]
  },
  {
    name: "Go (Panic/Goroutine)",
    raw: "panic: runtime error: index out of range\ngoroutine 1 [running]:\nmain.main()\n    /app/main.go:15 +0x25\nruntime.main()\n    /app/runtime.go:200 +0x112",
    data: {
      panic: "runtime error: index out of range",
      goroutine: 1,
      state: "running",
      stack: [
        { func: "main.main", loc: "/app/main.go:15", pc: "0x25" },
        { func: "runtime.main", loc: "/app/runtime.go:200", pc: "0x112" }
      ]
    }
  },
  {
    name: "Rust (Namespaces)",
    raw: "stack backtrace:\n   0: rust_begin_unwind\n             at src/libstd/panicking.rs:35\n   1: core::panicking::panic_fmt\n             at src/libcore/panicking.rs:12\n   2: my_app::main\n             at src/main.rs:5",
    data: [
      { frame: 0, func: "rust_begin_unwind", loc: "src/libstd/panicking.rs:35" },
      { frame: 1, func: "core::panicking::panic_fmt", loc: "src/libcore/panicking.rs:12" },
      { frame: 2, func: "my_app::main", loc: "src/main.rs:5" }
    ]
  },
  {
    name: "PHP (With Args)",
    raw: "Fatal error: Uncaught Exception in /app/index.php:5\nStack trace:\n#0 /app/index.php(5): divide(10, 0)\n#1 /app/server.php(120): handleRequest('GET', '/')\n#2 {main}",
    data: [
      { id: 0, loc: "/app/index.php:5", call: "divide(10, 0)" },
      { id: 1, loc: "/app/server.php:120", call: "handleRequest('GET', '/')" },
      { id: 2, loc: "{main}", call: "" }
    ]
  },
  {
    name: "TypeScript (V8 Engine)",
    raw: "Error: Something went wrong\n    at Object.<anonymous> (/work/project/src/services/user.service.ts:12:5)\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1130:10)",
    data: [
      { func: "Object.<anonymous>", loc: "/work/project/src/services/user.service.ts:12:5" },
      { func: "Module._compile", loc: "node:internal/modules/cjs/loader:1101:14" },
      { func: "Object.Module._extensions..js", loc: "node:internal/modules/cjs/loader:1130:10" }
    ]
  }
];

console.log(`\n🚀 Advanced Cross-Language Benchmark (Model: ${MODEL})\n`);
console.log(`Sorted by efficiency: [Worst] Left → Right [Winner]`);
console.log("-".repeat(110));

langScenarios.forEach(s => {
  const jsonT = countTokens(JSON.stringify(s.data));
  
  const formats = [
    { name: "RAW ", t: countTokens(s.raw) },
    { name: "JSON", t: jsonT },
    { name: "DEF ", t: countTokens(encode(s.data)) },
    { name: "VALS", t: countTokens(encode(s.data, ENC_VALUES)) },
    { name: "ALL ", t: countTokens(encode(s.data, ENC_INTERN_ALL)) }
  ];

  // Sort: Largest T (worst) first, Smallest T (winner) last
  formats.sort((a, b) => b.t - a.t);

  const header = `${s.name.padEnd(20)} | ` + formats.map(f => `${f.name.padEnd(12)}`).join(" | ");
  const row = `${"".padEnd(20)} | ` + formats.map(f => {
    const gain = ((jsonT - f.t) / jsonT * 100);
    const sign = gain >= 0 ? "+" : "";
    const gainStr = f.name.trim() === "JSON" ? "BASE" : `${sign}${gain.toFixed(1)}%`;
    return `${f.t.toString().padStart(3)}T ${gainStr.padStart(7)}`;
  }).join(" | ");

  console.log(header);
  console.log(row);
  console.log("-".repeat(110));
});

console.log("\n✅ T     : Total Token Count (Lower is better)");
console.log("✅ %     : Gain relative to JSON base");
