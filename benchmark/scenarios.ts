export const scenarios = [
  {
    name: "Small Metadata",
    data: { id: 123, status: "active", category: "tool" }
  },
  {
    name: "Small Grid (3 rows)",
    data: [
      { id: 1, name: "index.ts", size: 1024 },
      { id: 2, name: "util.ts", size: 512 },
      { id: 3, name: "main.ts", size: 2048 }
    ]
  },
  {
    name: "Repetitive Grid (10 rows)",
    data: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      type: "regular-file-record",
      status: "active",
      owner: "pakakas-system"
    }))
  },
  {
    name: "Mixed Data (Meta + Large Grid)",
    data: [
      { user: "hyuze", role: "admin", version: "1.0.3" },
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        key: `key-${i}`,
        val: `val-${i}`,
        tag: "stable"
      }))
    ]
  },
  {
    name: "Multiline Code Cells",
    data: [
      {
        filename: "main.ts",
        content: "function hello() {\n  console.log('world');\n}\n\nhello();"
      },
      {
        filename: "util.ts",
        content: "export const add = (a: number, b: number) => {\n  return a + b;\n};"
      }
    ]
  },
  {
    name: "Zero Official Diagnostic",
    data: [
      {
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
      }
    ]
  },
  {
    name: "Error Stack Trace",
    data: [
      {
        timestamp: "2026-05-23T23:45:00Z",
        level: "ERROR",
        message: "Uncaught TypeError: Cannot read property 'map' of undefined",
        stack: "TypeError: Cannot read property 'map' of undefined\n    at run (F:/work/00-oss/pakakas/src/index.ts:45:12)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async runTool (F:/work/00-oss/pakakas/pakakasb/main.ts:120:5)"
      },
      {
        timestamp: "2026-05-23T23:45:05Z",
        level: "ERROR",
        message: "Uncaught TypeError: Cannot read property 'map' of undefined",
        stack: "TypeError: Cannot read property 'map' of undefined\n    at run (F:/work/00-oss/pakakas/src/index.ts:45:12)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async runTool (F:/work/00-oss/pakakas/pakakasb/main.ts:120:5)"
      }
    ]
  },
  {
    name: "Tool Registry (Schema)",
    data: [
      {
        cmd: "grep",
        args: {
          pattern: "τstr",
          files: "τset optional",
          flags: "τmap optional"
        }
      },
      {
        cmd: "ls",
        args: {
          directory: "τstr optional",
          flags: "τmap optional"
        }
      }
    ]
  }
];
