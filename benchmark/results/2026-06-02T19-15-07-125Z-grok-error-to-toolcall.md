# Benchmark: error-to-toolcall (Grok - high effort)

*Generated on 6/3/2026, 2:16:38 AM*

**Model:** grok-4.3 | **Reasoning:** high | **Scenario:** error-to-toolcall

## Results

| Metric | json | mdkv | mz-header | mz | toon |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Input** (Tokens) | 260 | 230 | 317 | 262 | 284 |
| **Reasoning** (Tokens) | 303 | 288 | 566 | 443 | 337 |
| **Output** (Tokens) | 344 | 329 | 575 | 452 | 378 |
| **Total** (Tokens) | 604 | **559** 👑 | 892 | 714 | 662 |
| **Latency** (ms) | 7,099 | **3,301** 👑 | 7,308 | 4,873 | 4,206 |

## Raw I/O

| Format | Input | Output |
| :--- | :--- | :--- |
| **json** | <pre>{"task":"determine_tool_call","context":{"file":"src/App.tsx","language":"typescript","project":"react-dashboard"},"error":{"code":"TS2304","message":"Cannot find name 'useState'.","location":{"file":</pre> | <pre>{ "tool": "add_import", "params": { "file": "src/App.tsx", "module": "react", "imports": ["useState"] } }</pre> |
| **mdkv** | <pre>task:determine_tool_call<br>context.file:src/App.tsx<br>context.language:typescript<br>context.project:react-dashboard<br>error.code:TS2304<br>error.message:Cannot find name 'useState'.<br>error.location:src/App.tsx:5:</pre> | <pre>{ "tool": "add_import", "params": { "file": "src/App.tsx", "module": "react", "imports": ["useState"] } }</pre> |
| **mz-header** | <pre>Agent Data Notation:<br>ⓖ is grid marker<br>ʀ is row marker<br>ᴄ is column marker<br>¦ is delimiter<br>→ is key-value relation<br>★ is title marker<br>Agent Intermediate Representation:<br>τ is type annotation<br>ⓘ is invoke to</pre> | <pre>ⓘadd_import src/App.tsx react useState</pre> |
| **mz** | <pre>Choose your tool and respond with ⓘtool arg1 arg2<br>★Registryⓖᴄcmd¦args¦returnsʀadd_import¦file τstr module τstr imports τstr¦τgridʀapply_code_action¦file τstr line τnum action τstr¦τgridʀsearch_docs¦qu</pre> | <pre>ⓘadd_import src/App.tsx react useState</pre> |
| **toon** | <pre>task: determine_tool_call<br>context:<br>    file: src/App.tsx<br>    language: typescript<br>    project: react-dashboard<br>error:<br>    code: TS2304<br>    message: Cannot find name 'useState'.<br>    location:<br>        f</pre> | <pre>{ "name": "add_import", "params": { "file": "src/App.tsx", "module": "react", "imports": ["useState"] } }</pre> |
