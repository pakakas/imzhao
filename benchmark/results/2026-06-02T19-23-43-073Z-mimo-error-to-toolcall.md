# Benchmark: error-to-toolcall (MIMO - low effort)

*Generated on 6/3/2026, 2:24:58 AM*

**Model:** mimo-v2.5-pro | **Reasoning:** low | **Scenario:** error-to-toolcall

## Results

| Metric | json | mdkv | mz-header | mz | toon |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Input** (Tokens) | 393 | 362 | 404 | 372 | 415 |
| **Reasoning** (Tokens) | 61 | 77 | 1,065 | 171 | 839 |
| **Output** (Tokens) | 109 | 125 | 1,125 | 195 | 883 |
| **Total** (Tokens) | 502 | **487** 👑 | 1,529 | 567 | 1,298 |
| **Latency** (ms) | **4,444** 👑 | 4,630 | 28,967 | 7,636 | 21,785 |

## Raw I/O

| Format | Input | Output |
| :--- | :--- | :--- |
| **json** | <pre>{"task":"determine_tool_call","context":{"file":"src/App.tsx","language":"typescript","project":"react-dashboard"},"error":{"code":"TS2304","message":"Cannot find name 'useState'.","location":{"file":</pre> | <pre>```json
{
  "tool": "add_import",
  "params": {
    "file": "src/App.tsx",
    "module": "react",
    "imports": ["useState"]
  }
}
```</pre> |
| **mdkv** | <pre>task:determine_tool_call
context.file:src/App.tsx
context.language:typescript
context.project:react-dashboard
error.code:TS2304
error.message:Cannot find name 'useState'.
error.location:src/App.tsx:5:</pre> | <pre>```json
{
  "tool": "add_import",
  "params": {
    "file": "src/App.tsx",
    "module": "react",
    "imports": ["useState"]
  }
}
```</pre> |
| **mz-header** | <pre>Agent Data Intermediate Representationⓖ grid marker
ʀ row marker
ᴄ column marker
¦ delimiter
→ key-value relation
★ title marker
τ type annotation
Choose your tool and respond with ⓘtool arg1 arg2
★Re</pre> | <pre>Based on the provided error and context, the issue is a missing import for the `useState` hook in your React and TypeScript project. I'll use the `add_import` tool to resolve this by adding the necessary import statement.

ⓘadd_import src/App.tsx react { useState }</pre> |
| **mz** | <pre>Choose your tool and respond with ⓘtool arg1 arg2
★Registryⓖᴄcmd¦args¦returnsʀadd_import¦file τstr module τstr imports τstr¦τgridʀapply_code_action¦file τstr line τnum action τstr¦τgridʀsearch_docs¦qu</pre> | <pre>ⓘadd_import src/App.tsx "import React, { useState } from 'react';" τgrid</pre> |
| **toon** | <pre>task: determine_tool_call
context:
    file: src/App.tsx
    language: typescript
    project: react-dashboard
error:
    code: TS2304
    message: Cannot find name 'useState'.
    location:
        f</pre> | <pre>{
  "tool": "add_import",
  "params": {
    "file": "src/App.tsx",
    "module": "react",
    "imports": ["useState"]
  }
}</pre> |
