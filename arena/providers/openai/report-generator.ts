#!/usr/bin/env bun
import { GPTTokens } from "gpt-tokens";
import { encode, ENC_VALUES, ENC_INTERN_ALL } from "@pakakas/markzero";
import { writeFileSync } from "node:fs";
import { addInlineDecoder, ENC_INTERN } from "../../../src/mz-header";

const MODEL = "gpt-4o";

function countTokens(text: string) {
  const usage = new GPTTokens({
    model: MODEL as any,
    messages: [{ role: "user", content: text }]
  });
  return usage.usedTokens - 7;
}

function getGain(base: number, target: number) {
  const gain = ((base - target) / base * 100);
  const sign = gain >= 0 ? "+" : "";
  return `**${sign}${gain.toFixed(1)}%**`;
}

function toDodJson(data: any): string {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
    return JSON.stringify(data);
  }
  const keys = Object.keys(data[0]);
  const dod: any = { _: "dod" }; // Marker for DoD
  keys.forEach(k => {
    dod[k] = data.map((item: any) => item[k]);
  });
  return JSON.stringify(dod);
}

function toToon(data: any, indent = "", isListItem = false): string | null {
  try {
    const quote = (s: any) => {
      const str = String(s);
      const needsQuoting =
        str === "" ||
        /^\s|\s$/.test(str) ||
        ["true", "false", "null"].includes(str) ||
        (!isNaN(Number(str)) && str.trim() !== "") ||
        /[:"\\\[\]{}]/.test(str) ||
        str.includes(",") ||
        str.startsWith("-");

      if (needsQuoting) {
        return `"${str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n")}"`;
      }
      return str;
    };

    if (data === null || data === undefined) return "null";
    if (typeof data !== 'object') return quote(data);

    if (Array.isArray(data)) {
      if (data.length === 0) return "[]";

      // Tabular Check
      const first = data[0];
      if (typeof first === 'object' && !Array.isArray(first) && first !== null) {
        const keys = Object.keys(first);
        const isUniform = data.every(item =>
          item !== null &&
          typeof item === 'object' &&
          !Array.isArray(item) &&
          Object.keys(item).length === keys.length &&
          Object.keys(item).every(k => keys.includes(k))
        );

        if (isUniform) {
          const header = `[${data.length}]{${keys.join(",")}}:`;
          const rows = data.map(item =>
            keys.map(k => {
              const v = (item as any)[k];
              return typeof v === 'object' ? "[Complex]" : quote(v);
            }).join(",")
          ).join(`\n${indent}  `);
          return `${header}\n${indent}  ${rows}`;
        }
      }

      // List Form
      const items = data.map(item => {
        const res = toToon(item, indent + "  ", true);
        return res === null ? "[Error]" : res;
      }).join(`\n${indent}- `);
      return `[${data.length}]:\n${indent}- ${items}`;
    }

    // Object Form
    const keys = Object.keys(data);
    if (keys.length === 0) return "{}";

    const lines = keys.map((k, i) => {
      const val = (data as any)[k];
      const prefix = (isListItem && i === 0) ? "" : indent;

      if (typeof val === 'object' && val !== null) {
        const sub = toToon(val, indent + "  ");
        // Canonical pattern for tabular as first field in list item
        if (isListItem && i === 0 && Array.isArray(val)) {
           return `${k}${sub}`;
        }
        return `${prefix}${k}:\n${indent}  ${sub}`;
      }
      return `${prefix}${k}: ${quote(val)}`;
    });
    return lines.join("\n");
  } catch { return null; }
}

function toMarkdown(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return "";
    if (typeof data[0] === 'object' && !Array.isArray(data[0]) && data[0] !== null) {
      const headers = Object.keys(data[0]);
      const headerLine = `| ${headers.join(" | ")} |`;
      const sepLine = `| ${headers.map(() => "---").join(" | ")} |`;
      const rows = data.map(obj => `| ${headers.map(h => String(obj[h] ?? "")).join(" | ")} |`).join("\n");
      return `${headerLine}\n${sepLine}\n${rows}`;
    }
    return data.map(item => `- ${String(item)}`).join("\n");
  }
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).map(([key, val]) => `- **${key}**: ${String(val)}`).join("\n");
  }
  return String(data);
}

// 1. SCENARIOS DATA
const langScenarios = [
  { name: "Zig", raw: "/src/main.zig:10:5: 0x103456 in main\n    try secondFunction();\n    ^\n/src/main.zig:20:9: 0x103789 in secondFunction\n    return error.FileNotFound;\n    ^", data: [{ loc: "/src/main.zig:10:5", func: "main", msg: "try secondFunction()" }, { loc: "/src/main.zig:20:9", func: "secondFunction", msg: "return error.FileNotFound" }] },
  { name: "Go", raw: "panic: runtime error: index out of range\ngoroutine 1 [running]:\nmain.main()\n    /app/main.go:15 +0x25\nruntime.main()\n    /app/runtime.go:200 +0x112", data: { panic: "runtime error: index out of range", goroutine: 1, state: "running", stack: [{ func: "main.main", loc: "/app/main.go:15", pc: "0x25" }, { func: "runtime.main", loc: "/app/runtime.go:200", pc: "0x112" }] } },
  { name: "Rust", raw: "stack backtrace:\n   0: rust_begin_unwind\n             at src/libstd/panicking.rs:35\n   1: core::panicking::panic_fmt\n             at src/libcore/panicking.rs:12\n   2: my_app::main\n             at src/main.rs:5", data: [{ frame: 0, func: "rust_begin_unwind", loc: "src/libstd/panicking.rs:35" }, { frame: 1, func: "core::panicking::panic_fmt", loc: "src/libcore/panicking.rs:12" }, { frame: 2, func: "my_app::main", loc: "src/main.rs:5" }] },
  { name: "PHP", raw: "Fatal error: Uncaught Exception in /app/index.php:5\nStack trace:\n#0 /app/index.php(5): divide(10, 0)\n#1 /app/server.php(120): handleRequest('GET', '/')\n#2 {main}", data: [{ id: 0, loc: "/app/index.php:5", call: "divide(10, 0)" }, { id: 1, loc: "/app/server.php:120", call: "handleRequest('GET', '/')" }, { id: 2, loc: "{main}", call: "" }] },
  { name: "TypeScript", raw: "Error: Something went wrong\n    at Object.<anonymous> (/work/project/src/services/user.service.ts:12:5)\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1130:10)", data: [{ func: "Object.<anonymous>", loc: "/work/project/src/services/user.service.ts:12:5" }, { func: "Module._compile", loc: "node:internal/modules/cjs/loader:1101:14" }, { func: "Object.Module._extensions..js", loc: "node:internal/modules/cjs/loader:1130:10" }] },
  { 
    name: "Zero Official Diagnostic", 
    raw: "NAM003: Undeclared identifier 'count' at src/main.0:124\nRepair: REP_ADD_LET", 
    data: [{
      "code": "NAM003",
      "message": "Undeclared identifier 'count'",
      "node_id": "ast_node_592",
      "location": {
        "file": "src/main.0",
        "span": [124, 129]
      },
      "repair": {
        "repair_id": "REP_ADD_LET",
        "actions": [
          { "type": "insert", "pos": 124, "text": "let " }
        ]
      }
    }] 
  },
  { 
    name: "Bun (with Context)", 
    raw: "TypeError: undefined is not an object (evaluating 'decodedRows.map')\n      at /work/src/pap/decode.ts:114:26\n      112 |         // Mode: Explicit Headers\n      113 |         const headers = cellsOfFirstRow.map(resolve);\n    > 114 |         const decodedRows = rows.map(row => {\n          |                          ^\n      115 |           const cells = row.split(ITEM_SEP);", 
    data: [{
      error: "TypeError: undefined is not an object (evaluating 'decodedRows.map')",
      at: "/work/src/decode.ts:114:26",
      context: [
        { l: 112, c: "// Mode: Explicit Headers" },
        { l: 113, c: "const headers = cellsOfFirstRow.map(resolve);" },
        { l: 114, c: "const decodedRows = rows.map(row => {", active: true },
        { l: 115, c: "const cells = row.split(ITEM_SEP);" }
      ]
    }]
  },
  {
    name: "Java (Long OOM)",
    raw: "Exception in thread \"main\" java.lang.OutOfMemoryError: Java heap space\n    at java.base/java.util.Arrays.copyOf(Arrays.java:3512)\n    at java.base/java.util.Arrays.copyOf(Arrays.java:3481)\n    at java.base/java.util.ArrayList.grow(ArrayList.java:237)\n    at java.base/java.util.ArrayList.grow(ArrayList.java:244)\n    at java.base/java.util.ArrayList.add(ArrayList.java:454)\n    at java.base/java.util.ArrayList.add(ArrayList.java:467)\n    at com.example.app.DataProcessor.process(DataProcessor.java:120)\n    at com.example.app.DataProcessor.start(DataProcessor.java:45)\n    at com.example.app.Main.main(Main.java:20)",
    data: [
      { class: "java.util.Arrays", method: "copyOf", file: "Arrays.java", line: 3512 },
      { class: "java.util.Arrays", method: "copyOf", file: "Arrays.java", line: 3481 },
      { class: "java.util.ArrayList", method: "grow", file: "ArrayList.java", line: 237 },
      { class: "java.util.ArrayList", method: "grow", file: "ArrayList.java", line: 244 },
      { class: "java.util.ArrayList", method: "add", file: "ArrayList.java", line: 454 },
      { class: "java.util.ArrayList", method: "add", file: "ArrayList.java", line: 467 },
      { class: "com.example.app.DataProcessor", method: "process", file: "DataProcessor.java", line: 120 },
      { class: "com.example.app.DataProcessor", method: "start", file: "DataProcessor.java", line: 45 },
      { class: "com.example.app.Main", method: "main", file: "Main.java", line: 20 }
    ]
  },
  {
    name: "JavaScript (Nested Causes)",
    raw: "Error: Failed to fetch user profile\n    at fetchUserProfile (/app/src/api.ts:120:5)\n    at async loadData (/app/src/main.ts:45:10)\n[cause]: Error: Connection timeout\n    at Socket.onTimeout (node:net:950:12)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n[cause]: Error: ECONNREFUSED 127.0.0.1:5432\n    at TCP.onStreamRead (node:internal/stream_base_commons:190:23)",
    data: {
      error: "Failed to fetch user profile",
      stack: [
        { at: "fetchUserProfile", file: "/app/src/api.ts", line: "120:5" },
        { at: "loadData", file: "/app/src/main.ts", line: "45:10" }
      ],
      cause: {
        error: "Connection timeout",
        stack: [
          { at: "Socket.onTimeout", file: "node:net", line: "950:12" },
          { at: "process.processTicksAndRejections", file: "node:internal/process/task_queues", line: "95:5" }
        ],
        cause: {
          error: "ECONNREFUSED 127.0.0.1:5432",
          stack: [
            { at: "TCP.onStreamRead", file: "node:internal/stream_base_commons", line: "190:23" }
          ]
        }
      }
    }
  }
];

const forensicScenarios = [
  { name: "Application State", data: [{ func: "processOrder", args: { id: "ORD-99", retry: 0, user: "admin" } }, { func: "validateUser", args: { id: "ORD-99", retry: 0, user: "admin" } }, { func: "checkStock", args: { id: "ORD-99", retry: 0, user: "admin" } }] },
  { name: "Runtime Env", data: Array.from({ length: 3 }, () => ({ runtime: "Bun v1.4.0-canary.1", os: "win32 x64", git_sha: "4c8a21b14736f86235b2e987c938f456", env: "production" })) },
  { name: "Code Snippets", data: [{ file: "src/decode.ts", line: 45, code: "const markers = [metaStart, gridStart, titleStart];\nconst poolEnd = markers.length > 0 ? Math.min(...markers) : mzString.length;" }] },
  {
    name: "Complexity Torture",
    desc: "Mixed types, deeply nested objects in grid cells, and collision-prone strings.",
    data: [
      { id: 1, data: { type: "config", flags: [1, 2, 3] } },
      { id: 2, data: "raw_string: with, commas and : colons" },
      [1, 2, { nested: "deep" }]
    ]
  }
];

const configScenarios = [
  { 
    name: "Nginx Error", 
    raw: 'nginx: [emerg] unknown directive "proxy_passs" in /etc/nginx/sites-enabled/api.conf:45',
    data: { tool: "nginx", errors: [{ level: "emerg", message: "unknown directive \"proxy_passs\"", file: "/etc/nginx/sites-enabled/api.conf", line: 45 }] } 
  },
  { 
    name: "Apache Error", 
    raw: "AH00526: Syntax error on line 50 of /etc/apache2/apache2.conf:\nInvalid command 'AllowOveride', perhaps misspelled or defined by a module not included in the server configuration",
    data: { tool: "apache2ctl", errors: [{ file: "/etc/apache2/apache2.conf", line: 50, msg: "Invalid command 'AllowOveride'" }] } 
  }
];

// 2. GENERATION LOGIC
let md = `# MarkZero v1 - Benchmark Report\n\n`;
md += `*Generated automatically on: ${new Date().toLocaleString()}*\n\n`;

// Section 1: Cross Language
md += `## 1. Cross-Language Stack Traces\n`;
md += `Comparison of stack trace formats across different languages. Formats are sorted from **Winner** (Top) to **Worst** (Bottom). Gain (%) is relative to the **Worst** format in each group.\n\n`;

// Sort languages by their min token count (ascending)
const sortedLangs = [...langScenarios].sort((a, b) => {
  const tA = countTokens(encode(a.data, ENC_VALUES));
  const tB = countTokens(encode(b.data, ENC_VALUES));
  return tA - tB;
});

sortedLangs.forEach(s => {
  md += `### ${s.name} Stack Trace\n\n`;
  
  // Create an accordion for the raw source
  // if (s.name === "Zig") {
    md += `<details>\n<summary><b>Click to view Raw Stack Trace</b></summary>\n<br>\n`;

    md += `<pre><b>Raw STDERR</b><code>${s.raw}</code></pre>\n`;

    // Add JSON
    md += `<pre><b>JSON</b><code>${JSON.stringify(s.data, null, 2)}</code></pre>\n`;

    // Add TOON
    md += `<pre><b>TOON</b><code>${toToon(s.data)}</code></pre>\n`;

    // Add MarkZero (Raw & Pretty) merged in 1 <pre>
    const rawMZ = encode(s.data, ENC_VALUES).substring(1); // skip ⓟ
    // const prettyMZ = prettify(encode(s.data, ENC_VALUES));
    md += `<pre><b>MarkZero</b><code>RAW:\n${rawMZ}</code></pre>\n`;

    md += `</details>\n\n`;
  // }

  md += `| Format | Token Count | Efficiency Gain |\n`;
  md += `| :--- | :---: | :---: |\n`;

  const toonStr = toToon(s.data);
  const mdStr = toMarkdown(s.data);
  const formats: any[] = [
    { n: "ASCII (Stderr)", t: countTokens(s.raw) },
    { n: "JSON (Minified)", t: countTokens(JSON.stringify(s.data)) },
    { n: "JSON (DoD)", t: countTokens(toDodJson(s.data)) },
    { n: "MarkZero (No interning)", t: countTokens(encode(s.data)) },
    { n: "MarkZero (Value interning)", t: countTokens(encode(s.data, ENC_VALUES)) },
    { n: "MarkZero (Full interning)", t: countTokens(encode(s.data, ENC_INTERN_ALL)) },
    { n: "Markdown", t: countTokens(mdStr) }
  ];

  if (toonStr) {
    formats.push({ n: "TOON", t: countTokens(toonStr) });
  } else {
    formats.push({ n: "TOON", t: Infinity, label: "CAN'T ENCODE" });
  }

  formats.sort((a, b) => a.t - b.t); // Smallest T at top

  const maxT = Math.max(...formats.filter(f => f.t !== Infinity).map(f => f.t));

  formats.forEach(f => {
    const isWinner = f === formats[0];
    const name = isWinner ? `**${f.n}**` : f.n;
    let tokens = "";
    let gain = "";

    if (f.t === Infinity) {
      tokens = `*${f.label}*`;
      gain = "-";
    } else {
      const isWorst = f.t === maxT;
      tokens = isWinner ? `**${f.t}T**` : `${f.t}T`;
      const gainVal = ((maxT - f.t) / maxT * 100);
      gain = isWorst ? "WORST (BASE)" : `+${gainVal.toFixed(1)}%`;
    }
    
    md += `| ${name} | ${tokens} | ${gain} |\n`;
  });
  md += `\n`;
});

// Section 2: Forensic
md += `\n## 2. Forensic Error Components\n\n`;
md += `Sorted by MarkZero v1 efficiency (ascending). Gain (%) is relative to JSON standard.\n\n`;
md += `| Component | **MarkZero v1 (Token)** | TOON (Token) | Markdown (Token) | JSON (Token) | Gain (vs JSON) |\n`;
md += `| :--- | :---: | :---: | :---: | :---: | :---: |\n`;

const sortedForensic = forensicScenarios
  .map(s => {
    const jT = countTokens(JSON.stringify(s.data));
    const pT = countTokens(encode(s.data, ENC_VALUES));
    const toonStr = toToon(s.data);
    const tT = toonStr ? countTokens(toonStr) : Infinity;
    const mdStr = toMarkdown(s.data);
    const mT = countTokens(mdStr);
    return { ...s, jT, pT, tT, mT };
  })
  .sort((a, b) => a.pT - b.pT);

sortedForensic.forEach(s => {
  const gainVal = ((s.jT - s.pT) / s.jT * 100);
  const sign = gainVal >= 0 ? "+" : "";
  const tDisp = s.tT === Infinity ? "*CAN'T ENCODE*" : s.tT.toString();
  md += `| ${s.name} | **${s.pT}** | ${tDisp} | ${s.mT} | ${s.jT} | ${sign}${gainVal.toFixed(1)}% |\n`;
});

// Section 3: Config
md += `\n## 3. Configuration Errors\n\n`;
md += `Sorted by MarkZero v1 efficiency (ascending). Gain (%) is relative to JSON standard.\n\n`;
md += `| System / Tool | **MarkZero v1 (Token)** | TOON (Token) | Markdown (Token) | ASCII (Stderr) (Token) | JSON (Token) | Gain (vs JSON) |\n`;
md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

const sortedConfig = configScenarios
  .map(s => {
    const jT = countTokens(JSON.stringify(s.data));
    const pT = countTokens(encode(s.data, ENC_VALUES));
    const toonStr = toToon(s.data);
    const tT = toonStr ? countTokens(toonStr) : Infinity;
    const mdStr = toMarkdown(s.data);
    const mT = countTokens(mdStr);
    const aT = countTokens(s.raw);
    return { ...s, jT, pT, tT, mT, aT };
  })
  .sort((a, b) => a.pT - b.pT);

sortedConfig.forEach(s => {
  const gainVal = ((s.jT - s.pT) / s.jT * 100);
  const sign = gainVal >= 0 ? "+" : "";
  const tDisp = s.tT === Infinity ? "*CAN'T ENCODE*" : s.tT.toString();
  md += `| ${s.name} | **${s.pT}** | ${tDisp} | ${s.mT} | ${s.aT} | ${s.jT} | ${sign}${gainVal.toFixed(1)}% |\n`;
});

// Section 4: MZ Header
md += `\n## 4. MZ Header Overhead Test\n\n`;
md += `Tests the token overhead of adding the **MZrules inline decoder header on top of MarkZero payloads.\n\n`;
md += `| Payload Size | **MZ No Header (T)** | **MZ + MZrules (T)** | **MZ + MZrules + Intern (T)** | **Overhead (vs No Header)** |
| :--- | :---: | :---: | :---: | :---: |\n`;

const mzHeaderScenarios = [
  { name: "Small Payload (1 row)", data: [{ id: 1, name: "Test", status: "active" }] },
  { name: "Medium Payload (10 rows)", data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, product: `Widget ${i + 1}`, price: (Math.random() * 100).toFixed(2), stock: Math.floor(Math.random() * 1000) })) },
  { name: "Large Payload (100 rows)", data: Array.from({ length: 100 }, (_, i) => ({ id: i + 1, user: `user_${i + 1}`, email: `user${i + 1}@example.com`, role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "editor" : "viewer", createdAt: new Date(Date.now() - i * 86400000).toISOString() })) }
];

mzHeaderScenarios.forEach(s => {
  const rawMZ = encode(s.data, ENC_VALUES);
  const mzNoHeader = countTokens(rawMZ);
  const mzWithHeader = countTokens(addInlineDecoder(rawMZ));
  const mzWithHeaderIntern = countTokens(addInlineDecoder(rawMZ, ENC_INTERN));
  const overhead = mzWithHeader - mzNoHeader;
  const overheadPercent = ((overhead / mzNoHeader) * 100).toFixed(1);

  md += `| ${s.name} | **${mzNoHeader}** | ${mzWithHeader} | ${mzWithHeaderIntern} | ${overhead} (+${overheadPercent}%) |\n`;
});

const reportPath = import.meta.dirname + "/benchmark-report.md";
writeFileSync(reportPath, md);
console.log(`✅ Official Markdown report generated at: ${reportPath}`);
