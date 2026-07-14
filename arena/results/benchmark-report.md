# MarkZero v1 - Benchmark Report

*Generated automatically on: 6/2/2026, 8:32:25 PM*

## 1. Cross-Language Stack Traces
Comparison of stack trace formats across different languages. Formats are sorted from **Winner** (Top) to **Worst** (Bottom). Gain (%) is relative to the **Worst** format in each group.

### Zig Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>/src/main.zig:10:5: 0x103456 in main
    try secondFunction();
    ^
/src/main.zig:20:9: 0x103789 in secondFunction
    return error.FileNotFound;
    ^</code></pre>
<pre><b>JSON</b><code>[
  {
    "loc": "/src/main.zig:10:5",
    "func": "main",
    "msg": "try secondFunction()"
  },
  {
    "loc": "/src/main.zig:20:9",
    "func": "secondFunction",
    "msg": "return error.FileNotFound"
  }
]</code></pre>
<pre><b>TOON</b><code>[2]{loc,func,msg}:
  "/src/main.zig:10:5",main,try secondFunction()
  "/src/main.zig:20:9",secondFunction,return error.FileNotFound</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ§loc¦func¦msgʀ/src/main.zig:10:5¦main¦try secondFunction()ʀ/src/main.zig:20:9¦secondFunction¦return error.FileNotFound</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **TOON** | **45T** | +13.5% |
| MarkZero (No interning) | 47T | +9.6% |
| MarkZero (Value interning) | 47T | +9.6% |
| MarkZero (Full interning) | 47T | +9.6% |
| JSON (DoD) | 50T | +3.8% |
| JSON (Minified) | 51T | +1.9% |
| ASCII (Stderr) | 52T | WORST (BASE) |
| Markdown | 52T | WORST (BASE) |

### PHP Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>Fatal error: Uncaught Exception in /app/index.php:5
Stack trace:
#0 /app/index.php(5): divide(10, 0)
#1 /app/server.php(120): handleRequest('GET', '/')
#2 {main}</code></pre>
<pre><b>JSON</b><code>[
  {
    "id": 0,
    "loc": "/app/index.php:5",
    "call": "divide(10, 0)"
  },
  {
    "id": 1,
    "loc": "/app/server.php:120",
    "call": "handleRequest('GET', '/')"
  },
  {
    "id": 2,
    "loc": "{main}",
    "call": ""
  }
]</code></pre>
<pre><b>TOON</b><code>[3]{id,loc,call}:
  "0","/app/index.php:5","divide(10, 0)"
  "1","/app/server.php:120","handleRequest('GET', '/')"
  "2","{main}",""</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ§id¦loc¦callʀ0¦/app/index.php:5¦divide(10, 0)ʀ1¦/app/server.php:120¦handleRequest('GET', '/')ʀ2¦{main}¦</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **JSON (DoD)** | **53T** | +13.1% |
| ASCII (Stderr) | 54T | +11.5% |
| MarkZero (No interning) | 54T | +11.5% |
| MarkZero (Value interning) | 54T | +11.5% |
| MarkZero (Full interning) | 54T | +11.5% |
| TOON | 55T | +9.8% |
| JSON (Minified) | 61T | WORST (BASE) |
| Markdown | 61T | WORST (BASE) |

### Rust Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>stack backtrace:
   0: rust_begin_unwind
             at src/libstd/panicking.rs:35
   1: core::panicking::panic_fmt
             at src/libcore/panicking.rs:12
   2: my_app::main
             at src/main.rs:5</code></pre>
<pre><b>JSON</b><code>[
  {
    "frame": 0,
    "func": "rust_begin_unwind",
    "loc": "src/libstd/panicking.rs:35"
  },
  {
    "frame": 1,
    "func": "core::panicking::panic_fmt",
    "loc": "src/libcore/panicking.rs:12"
  },
  {
    "frame": 2,
    "func": "my_app::main",
    "loc": "src/main.rs:5"
  }
]</code></pre>
<pre><b>TOON</b><code>[3]{frame,func,loc}:
  "0",rust_begin_unwind,"src/libstd/panicking.rs:35"
  "1","core::panicking::panic_fmt","src/libcore/panicking.rs:12"
  "2","my_app::main","src/main.rs:5"</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ§frame¦func¦locʀ0¦rust_begin_unwind¦src/libstd/panicking.rs:35ʀ1¦core::panicking::panic_fmt¦src/libcore/panicking.rs:12ʀ2¦my_app::main¦src/main.rs:5</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **JSON (DoD)** | **63T** | +11.3% |
| MarkZero (No interning) | 64T | +9.9% |
| MarkZero (Value interning) | 64T | +9.9% |
| MarkZero (Full interning) | 64T | +9.9% |
| ASCII (Stderr) | 65T | +8.5% |
| TOON | 66T | +7.0% |
| Markdown | 70T | +1.4% |
| JSON (Minified) | 71T | WORST (BASE) |

### TypeScript Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>Error: Something went wrong
    at Object.<anonymous> (/work/project/src/services/user.service.ts:12:5)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1130:10)</code></pre>
<pre><b>JSON</b><code>[
  {
    "func": "Object.<anonymous>",
    "loc": "/work/project/src/services/user.service.ts:12:5"
  },
  {
    "func": "Module._compile",
    "loc": "node:internal/modules/cjs/loader:1101:14"
  },
  {
    "func": "Object.Module._extensions..js",
    "loc": "node:internal/modules/cjs/loader:1130:10"
  }
]</code></pre>
<pre><b>TOON</b><code>[3]{func,loc}:
  Object.<anonymous>,"/work/project/src/services/user.service.ts:12:5"
  Module._compile,"node:internal/modules/cjs/loader:1101:14"
  Object.Module._extensions..js,"node:internal/modules/cjs/loader:1130:10"</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ§func¦locʀObject.<anonymous>¦/work/project/src/services/user.service.ts:12:5ʀModule._compile¦node:internal/modules/cjs/loader:1101:14ʀObject.Module._extensions..js¦node:internal/modules/cjs/loader:1130:10</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **ASCII (Stderr)** | **68T** | +5.6% |
| JSON (DoD) | 68T | +5.6% |
| TOON | 68T | +5.6% |
| MarkZero (No interning) | 69T | +4.2% |
| MarkZero (Value interning) | 69T | +4.2% |
| MarkZero (Full interning) | 69T | +4.2% |
| Markdown | 70T | +2.8% |
| JSON (Minified) | 72T | WORST (BASE) |

### Go Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>panic: runtime error: index out of range
goroutine 1 [running]:
main.main()
    /app/main.go:15 +0x25
runtime.main()
    /app/runtime.go:200 +0x112</code></pre>
<pre><b>JSON</b><code>{
  "panic": "runtime error: index out of range",
  "goroutine": 1,
  "state": "running",
  "stack": [
    {
      "func": "main.main",
      "loc": "/app/main.go:15",
      "pc": "0x25"
    },
    {
      "func": "runtime.main",
      "loc": "/app/runtime.go:200",
      "pc": "0x112"
    }
  ]
}</code></pre>
<pre><b>TOON</b><code>panic: "runtime error: index out of range"
goroutine: "1"
state: running
stack:
  [2]{func,loc,pc}:
    main.main,"/app/main.go:15","0x25"
    runtime.main,"/app/runtime.go:200","0x112"</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ§func¦loc¦pcʀmain.main¦/app/main.go:15¦0x25ʀruntime.main¦/app/runtime.go:200¦0x112ⓖʀpanic→runtime error: index out of rangeʀgoroutine→1ʀstate→runningʀstack→※0</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **Markdown** | **41T** | +42.3% |
| ASCII (Stderr) | 46T | +35.2% |
| JSON (Minified) | 64T | +9.9% |
| JSON (DoD) | 64T | +9.9% |
| TOON | 64T | +9.9% |
| MarkZero (No interning) | 71T | WORST (BASE) |
| MarkZero (Value interning) | 71T | WORST (BASE) |
| MarkZero (Full interning) | 71T | WORST (BASE) |

### Zero Official Diagnostic Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>NAM003: Undeclared identifier 'count' at src/main.0:124
Repair: REP_ADD_LET</code></pre>
<pre><b>JSON</b><code>[
  {
    "code": "NAM003",
    "message": "Undeclared identifier 'count'",
    "node_id": "ast_node_592",
    "location": {
      "file": "src/main.0",
      "span": [
        124,
        129
      ]
    },
    "repair": {
      "repair_id": "REP_ADD_LET",
      "actions": [
        {
          "type": "insert",
          "pos": 124,
          "text": "let "
        }
      ]
    }
  }
]</code></pre>
<pre><b>TOON</b><code>[1]{code,message,node_id,location,repair}:
  NAM003,Undeclared identifier 'count',ast_node_592,[Complex],[Complex]</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ124ʀ129ⓖʀfile→src/main.0ʀspan→※0ⓖ§type¦pos¦textʀinsert¦124¦let ⓖʀrepair_id→REP_ADD_LETʀactions→※2ⓖ§code¦message¦node_id¦location¦repairʀNAM003¦Undeclared identifier 'count'¦ast_node_592¦※1¦※3</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **ASCII (Stderr)** | **24T** | +74.7% |
| TOON | 33T | +65.3% |
| Markdown | 50T | +47.4% |
| JSON (Minified) | 69T | +27.4% |
| JSON (DoD) | 76T | +20.0% |
| MarkZero (No interning) | 95T | WORST (BASE) |
| MarkZero (Value interning) | 95T | WORST (BASE) |
| MarkZero (Full interning) | 95T | WORST (BASE) |

### Bun (with Context) Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>TypeError: undefined is not an object (evaluating 'decodedRows.map')
      at /work/src/pap/decode.ts:114:26
      112 |         // Mode: Explicit Headers
      113 |         const headers = cellsOfFirstRow.map(resolve);
    > 114 |         const decodedRows = rows.map(row => {
          |                          ^
      115 |           const cells = row.split(ITEM_SEP);</code></pre>
<pre><b>JSON</b><code>[
  {
    "error": "TypeError: undefined is not an object (evaluating 'decodedRows.map')",
    "at": "/work/src/decode.ts:114:26",
    "context": [
      {
        "l": 112,
        "c": "// Mode: Explicit Headers"
      },
      {
        "l": 113,
        "c": "const headers = cellsOfFirstRow.map(resolve);"
      },
      {
        "l": 114,
        "c": "const decodedRows = rows.map(row => {",
        "active": true
      },
      {
        "l": 115,
        "c": "const cells = row.split(ITEM_SEP);"
      }
    ]
  }
]</code></pre>
<pre><b>TOON</b><code>[1]{error,at,context}:
  "TypeError: undefined is not an object (evaluating 'decodedRows.map')","/work/src/decode.ts:114:26",[Complex]</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ§l¦c¦activeʀ112¦// Mode: Explicit Headers¦ʀ113¦const headers = cellsOfFirstRow.map(resolve);¦ʀ114¦const decodedRows = rows.map(row => {¦trueʀ115¦const cells = row.split(ITEM_SEP);¦ⓖ§error¦at¦contextʀTypeError: undefined is not an object (evaluating 'decodedRows.map')¦/work/src/decode.ts:114:26¦※0</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **TOON** | **42T** | +62.2% |
| Markdown | 57T | +48.6% |
| ASCII (Stderr) | 91T | +18.0% |
| JSON (Minified) | 105T | +5.4% |
| MarkZero (No interning) | 107T | +3.6% |
| MarkZero (Value interning) | 107T | +3.6% |
| MarkZero (Full interning) | 107T | +3.6% |
| JSON (DoD) | 111T | WORST (BASE) |

### Java (Long OOM) Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
    at java.base/java.util.Arrays.copyOf(Arrays.java:3512)
    at java.base/java.util.Arrays.copyOf(Arrays.java:3481)
    at java.base/java.util.ArrayList.grow(ArrayList.java:237)
    at java.base/java.util.ArrayList.grow(ArrayList.java:244)
    at java.base/java.util.ArrayList.add(ArrayList.java:454)
    at java.base/java.util.ArrayList.add(ArrayList.java:467)
    at com.example.app.DataProcessor.process(DataProcessor.java:120)
    at com.example.app.DataProcessor.start(DataProcessor.java:45)
    at com.example.app.Main.main(Main.java:20)</code></pre>
<pre><b>JSON</b><code>[
  {
    "class": "java.util.Arrays",
    "method": "copyOf",
    "file": "Arrays.java",
    "line": 3512
  },
  {
    "class": "java.util.Arrays",
    "method": "copyOf",
    "file": "Arrays.java",
    "line": 3481
  },
  {
    "class": "java.util.ArrayList",
    "method": "grow",
    "file": "ArrayList.java",
    "line": 237
  },
  {
    "class": "java.util.ArrayList",
    "method": "grow",
    "file": "ArrayList.java",
    "line": 244
  },
  {
    "class": "java.util.ArrayList",
    "method": "add",
    "file": "ArrayList.java",
    "line": 454
  },
  {
    "class": "java.util.ArrayList",
    "method": "add",
    "file": "ArrayList.java",
    "line": 467
  },
  {
    "class": "com.example.app.DataProcessor",
    "method": "process",
    "file": "DataProcessor.java",
    "line": 120
  },
  {
    "class": "com.example.app.DataProcessor",
    "method": "start",
    "file": "DataProcessor.java",
    "line": 45
  },
  {
    "class": "com.example.app.Main",
    "method": "main",
    "file": "Main.java",
    "line": 20
  }
]</code></pre>
<pre><b>TOON</b><code>[9]{class,method,file,line}:
  java.util.Arrays,copyOf,Arrays.java,"3512"
  java.util.Arrays,copyOf,Arrays.java,"3481"
  java.util.ArrayList,grow,ArrayList.java,"237"
  java.util.ArrayList,grow,ArrayList.java,"244"
  java.util.ArrayList,add,ArrayList.java,"454"
  java.util.ArrayList,add,ArrayList.java,"467"
  com.example.app.DataProcessor,process,DataProcessor.java,"120"
  com.example.app.DataProcessor,start,DataProcessor.java,"45"
  com.example.app.Main,main,Main.java,"20"</code></pre>
<pre><b>MarkZero</b><code>RAW:
·java.util.ArrayList·com.example.app.DataProcessorⓖ§class¦method¦file¦lineʀjava.util.Arrays¦copyOf¦Arrays.java¦3512ʀjava.util.Arrays¦copyOf¦Arrays.java¦3481ʀ¤0¦grow¦ArrayList.java¦237ʀ¤0¦grow¦ArrayList.java¦244ʀ¤0¦add¦ArrayList.java¦454ʀ¤0¦add¦ArrayList.java¦467ʀ¤1¦process¦DataProcessor.java¦120ʀ¤1¦start¦DataProcessor.java¦45ʀcom.example.app.Main¦main¦Main.java¦20</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **JSON (DoD)** | **134T** | +30.2% |
| TOON | 136T | +29.2% |
| MarkZero (Value interning) | 137T | +28.6% |
| MarkZero (Full interning) | 137T | +28.6% |
| MarkZero (No interning) | 140T | +27.1% |
| ASCII (Stderr) | 149T | +22.4% |
| Markdown | 154T | +19.8% |
| JSON (Minified) | 192T | WORST (BASE) |

### JavaScript (Nested Causes) Stack Trace

<details>
<summary><b>Click to view Raw Stack Trace</b></summary>
<br>
<pre><b>Raw STDERR</b><code>Error: Failed to fetch user profile
    at fetchUserProfile (/app/src/api.ts:120:5)
    at async loadData (/app/src/main.ts:45:10)
[cause]: Error: Connection timeout
    at Socket.onTimeout (node:net:950:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
[cause]: Error: ECONNREFUSED 127.0.0.1:5432
    at TCP.onStreamRead (node:internal/stream_base_commons:190:23)</code></pre>
<pre><b>JSON</b><code>{
  "error": "Failed to fetch user profile",
  "stack": [
    {
      "at": "fetchUserProfile",
      "file": "/app/src/api.ts",
      "line": "120:5"
    },
    {
      "at": "loadData",
      "file": "/app/src/main.ts",
      "line": "45:10"
    }
  ],
  "cause": {
    "error": "Connection timeout",
    "stack": [
      {
        "at": "Socket.onTimeout",
        "file": "node:net",
        "line": "950:12"
      },
      {
        "at": "process.processTicksAndRejections",
        "file": "node:internal/process/task_queues",
        "line": "95:5"
      }
    ],
    "cause": {
      "error": "ECONNREFUSED 127.0.0.1:5432",
      "stack": [
        {
          "at": "TCP.onStreamRead",
          "file": "node:internal/stream_base_commons",
          "line": "190:23"
        }
      ]
    }
  }
}</code></pre>
<pre><b>TOON</b><code>error: Failed to fetch user profile
stack:
  [2]{at,file,line}:
    fetchUserProfile,/app/src/api.ts,"120:5"
    loadData,/app/src/main.ts,"45:10"
cause:
    error: Connection timeout
  stack:
    [2]{at,file,line}:
      Socket.onTimeout,"node:net","950:12"
      process.processTicksAndRejections,"node:internal/process/task_queues","95:5"
  cause:
        error: "ECONNREFUSED 127.0.0.1:5432"
    stack:
      [1]{at,file,line}:
        TCP.onStreamRead,"node:internal/stream_base_commons","190:23"</code></pre>
<pre><b>MarkZero</b><code>RAW:
ⓖ§at¦file¦lineʀfetchUserProfile¦/app/src/api.ts¦120:5ʀloadData¦/app/src/main.ts¦45:10ⓖ§at¦file¦lineʀSocket.onTimeout¦node:net¦950:12ʀprocess.processTicksAndRejections¦node:internal/process/task_queues¦95:5ⓖ§at¦file¦lineʀTCP.onStreamRead¦node:internal/stream_base_commons¦190:23ⓖʀerror→ECONNREFUSED 127.0.0.1:5432ʀstack→※2ⓖʀerror→Connection timeoutʀstack→※1ʀcause→※3ⓖʀerror→Failed to fetch user profileʀstack→※0ʀcause→※4</code></pre>
</details>

| Format | Token Count | Efficiency Gain |
| :--- | :---: | :---: |
| **Markdown** | **32T** | +82.3% |
| ASCII (Stderr) | 122T | +32.6% |
| TOON | 154T | +14.9% |
| JSON (Minified) | 157T | +13.3% |
| JSON (DoD) | 157T | +13.3% |
| MarkZero (No interning) | 181T | WORST (BASE) |
| MarkZero (Value interning) | 181T | WORST (BASE) |
| MarkZero (Full interning) | 181T | WORST (BASE) |


## 2. Forensic Error Components

Sorted by MarkZero v1 efficiency (ascending). Gain (%) is relative to JSON standard.

| Component | **MarkZero v1 (Token)** | TOON (Token) | Markdown (Token) | JSON (Token) | Gain (vs JSON) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Code Snippets | **53** | 52 | 57 | 52 | -1.9% |
| Complexity Torture | **75** | 79 | 39 | 49 | -53.1% |
| Application State | **87** | 25 | 37 | 68 | -27.9% |
| Runtime Env | **120** | 132 | 142 | 150 | +20.0% |

## 3. Configuration Errors

Sorted by MarkZero v1 efficiency (ascending). Gain (%) is relative to JSON standard.

| System / Tool | **MarkZero v1 (Token)** | TOON (Token) | Markdown (Token) | ASCII (Stderr) (Token) | JSON (Token) | Gain (vs JSON) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apache Error | **44** | 35 | 18 | 41 | 35 | -25.7% |
| Nginx Error | **50** | 37 | 16 | 25 | 40 | -25.0% |

## 4. MZ Header Overhead Test

Tests the token overhead of adding the **MZrules inline decoder header on top of MarkZero payloads.

| Payload Size | **MZ No Header (T)** | **MZ + MZrules (T)** | **MZ + MZrules + Intern (T)** | **Overhead (vs No Header)** |
| :--- | :---: | :---: | :---: | :---: |
| Small Payload (1 row) | **18** | 38 | 43 | 20 (+111.1%) |
| Medium Payload (10 rows) | **143** | 163 | 168 | 20 (+14.0%) |
| Large Payload (100 rows) | **3016** | 3036 | 3041 | 20 (+0.7%) |
