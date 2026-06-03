# Benchmark: error-to-toolcall (MIMO - low effort)

*Generated on 6/3/2026, 2:15:00 AM*

**Model:** mimo-v2.5-pro | **Reasoning:** low | **Scenario:** error-to-toolcall

## Results

| Metric | json | mdkv | mz-header | mz | toon |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Input** (Tokens) | 393 | 362 | 422 | 372 | 415 |
| **Reasoning** (Tokens) | 104 | 149 | 1,142 | 152 | 140 |
| **Output** (Tokens) | 152 | 197 | 1,154 | 164 | 188 |
| **Total** (Tokens) | 545 | 559 | 1,576 | **536** 👑 | 603 |
| **Latency** (ms) | **4,914** 👑 | 6,116 | 27,946 | 6,754 | 5,213 |

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
| **mz-header** | <pre>Agent Data Notation:
ⓖ is grid marker
ʀ is row marker
ᴄ is column marker
¦ is delimiter
→ is key-value relation
★ is title marker
Agent Intermediate Representation:
τ is type annotation
ⓘ is invoke to</pre> | <pre>ⓘadd_import src/App.tsx react useState</pre> |
| **mz** | <pre>Choose your tool and respond with ⓘtool arg1 arg2
★Registryⓖᴄcmd¦args¦returnsʀadd_import¦file τstr module τstr imports τstr¦τgridʀapply_code_action¦file τstr line τnum action τstr¦τgridʀsearch_docs¦qu</pre> | <pre>ⓘadd_import src/App.tsx react useState</pre> |
| **toon** | <pre>task: determine_tool_call
context:
    file: src/App.tsx
    language: typescript
    project: react-dashboard
error:
    code: TS2304
    message: Cannot find name 'useState'.
    location:
        f</pre> | <pre>```json
{
    "tool": "add_import",
    "params": {
        "file": "src/App.tsx",
        "module": "react",
        "imports": ["useState"]
    }
}
```</pre> |
