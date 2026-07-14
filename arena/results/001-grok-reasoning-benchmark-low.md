# Inference / Reasoning Bloat (Live Grok-4.3 Tests)

This document tracks the hidden token inference penalty incurred when passing data payloads to reasoning-capable LLMs without explicit prompt instructions (Zero-Shot Decoding).

## Benchmark: Human IR vs Agent IR (Zero-Shot)

**System Instruction:** `""` (Empty)
**Reasoning Effort:** `low`
**Model:** `grok-4.3`

### Payloads Tested

**1. JSON compact (Human IR - 123 bytes):** 
```json
[["id","name","role","admin","user","active"],[[0,1,2],[101,"Alice",3],[102,"Bob",4]],[[0,5,2],[103,true,4],[104,false,4]]]
```

**2. MarkZero / ADN (Agent IR - 100 chars):** 
```text
·id·name·role·admin·user·activeⓖ§¤0¦¤1¦¤2ʀ101¦Alice¦¤3ʀ102¦Bob¦¤4ⓖ§¤0¦¤5¦¤2ʀ103¦true¦¤4ʀ104¦false¦¤4
```

**3. MD KV Minified (Human IR - 133 chars):**
```text
- id:101
 name:Alice
 role:admin
- id:102
 name:Bob
 role:user
- id:103
 active:true
 role:user
- id:104
 active:false
 role:user
```

### Results (Low Effort)

| Metric (Unit) | JSON compact | MarkZero (ADN) | MD KV (Minified) |
| :--- | :---: | :---: | :---: |
| **Input** (Tokens) | 179 | 200 | 176 |
| **Reasoning** (Tokens) | **1,086** ❌ | **1,166** ❌❌ | **414** ✅ |
| **Output** (Tokens) | 1,163 | 1,281 | 584 |
| **Total** (Tokens) | 1,342 | 1,481 | 760 |
| **Latency** (ms) | 9,551 | 10,639 | 5,492 |

### Raw Outputs

**1. JSON compact (Output):**
```json
{
  "headers": ["id", "name", "role", "admin", "user", "active"],
  "blocks": [
    [[0,1,2], [101,"Alice",3], [102,"Bob",4]],
    [[0,5,2], [103,true,4], [104,false,4]]
  ]
}
```

**2. MarkZero / ADN (Output):**
```text
**Parsed data (best interpretation):**

### Table 1 – Users
| id  | name  | role |
|-----|-------|------|
| 101 | Alice | —    |
| 102 | Bob   | —    |

### Table 2 – Status / Flags
| id  | value | flag |
|-----|-------|------|
| 103 | true  | —    |
| 104 | false | —    |

(The original string appears to be a compact/obfuscated dump of two small tables using unusual separators and symbols.)
```

**3. MD KV Minified (Output):**
```text
Here's a clean, organized view of the data you provided:

| ID  | Name  | Role  | Active |
|-----|-------|-------|--------|
| 101 | Alice | admin | —      |
| 102 | Bob   | user  | —      |
| 103 | —     | user  | true   |
| 104 | —     | user  | false  |

### Quick observations:
- **Admins**: Only Alice (id 101)
- **Users**: Bob (102), and the two entries without names (103, 104)
- **Active status**: Only available for IDs 103 and 104

Would you like me to:
- Convert this to JSON/YAML?
- Filter by role or active status?
- Add missing fields (e.g., infer names or active status)?
```

### Analysis & Conclusion (Low Effort)

- **The OCD Beautification Reflex (JSON):** Even with an empty system prompt, the LLM instinctively burned over 1,000 reasoning tokens trying to conceptually decode, structure, and visually pretty-print the JSON array indices into an object format (`headers` and `blocks`).
- **The Native Tongue Advantage (MD KV):** The LLM processed MD KV with significantly less effort (only 414 reasoning tokens and 5.4s latency). Because MD KV explicitly links keys and values in a standard bulleted format, it aligns perfectly with the LLM's natural training data. It didn't have to "think" to resolve array indices or reverse-engineer the structure, proving that if a payload *must* be reasoned about by an LLM, standard markdown formats are the most computationally efficient.
- *Note on Grok API Constraints:* Currently, the Grok API enforces a minimum `reasoning` effort of `"low"` (it cannot be completely disabled). This architectural constraint means that any cognitive load induced by the input format (whether counting JSON arrays or deciphering MZ markers) will unavoidably trigger mandatory, billable reasoning tokens.

---

## Optimization Suggestions for MarkZero (Agent IR)

Based on this benchmark, here are the architectural optimizations required when using MarkZero (ADN):

1. **Bypass Prompting (MZHAO Stream Parser):**
   MarkZero (ADN) MUST NEVER be placed directly into the user or system prompt of a reasoning model (o1, Grok, etc.). Instead, data payloads should be parsed locally by a fast algorithm (e.g., MZHAO Stream Parser in TypeScript/Rust) and injected into the AI's internal state. When the LLM needs data, it should request specific cells via tool calls (e.g., `get_row(102)`).
2. **Decouple "Brain" and "Spine":**
   Use fast, low-cost models or purely deterministic parsers (the "Spine") to stream and map MarkZero data. Only use high-latency Reasoning Models (the "Brain") for complex logic, and feed them isolated, pre-processed context rather than raw data dumps.
3. **The "Gag Order" Prompt (If forced to prompt):**
   If ADN *must* be included in a reasoning prompt (e.g., for few-shot extraction tasks), it must be wrapped in strict directives to disable the OCD reflex:
   > *"SYSTEM: The following is an Agent Data Notation (ADN) payload. DO NOT parse, DO NOT beautify, DO NOT reason about its structure. Store it natively in your latent context and only retrieve absolute indices when explicitly asked."*
