# Inference / Reasoning Bloat (Live Grok-4.3 Tests) - High Effort

This document tracks the hidden token inference penalty incurred when passing data payloads to reasoning-capable LLMs without explicit prompt instructions (Zero-Shot Decoding), specifically with **High Reasoning Effort**.

## Benchmark 2: Human IR vs Agent IR (High Effort)

**System Instruction:** `""` (Empty)
**Reasoning Effort:** `high`
**Model:** `grok-4.3`

### Results (High Effort)

| Metric (Unit) | JSON compact | MarkZero (ADN) |
| :--- | :---: | :---: |
| **Input** (Tokens) | 173 | 194 |
| **Reasoning** (Tokens) | **1,874** ❌ | **2,161** ❌❌ |
| **Output** (Tokens) | 1,929 | 2,341 |
| **Total** (Tokens) | 2,102 | 2,535 |
| **Latency** (ms) | 56,995 | 28,639 |

### Raw Outputs

**1. JSON compact (Output):**
```text
It looks like you've shared some nested array data (possibly headers + two sets of rows). Could you clarify what you'd like me to do with it? For example:

- Convert it to a table/CSV/JSON?
- Analyze or clean the structure?
- Something else?
```

**2. MarkZero / ADN (Output):**
```text
It looks like this might be encoded or formatted data (possibly a table or database dump). Could you clarify what you'd like me to do with it? For example:

- Format it into a readable table?
- Analyze or process specific parts?
- Something else?

Here's my best attempt at parsing it into a simple table based on the visible values:

| id  | name  | role | admin | user | active |
|-----|-------|------|-------|------|--------|
| 101 | Alice | 3    | -     | -    | -      |
| 102 | Bob   | 4    | -     | -    | -      |
| 103 | -     | -    | true  | -    | -      |
| 104 | -     | -    | false | -    | -      |

Let me know how to adjust!
```

### Analysis & Conclusion (High Effort)

- **AI Confusion & Hallucinated Tables (MarkZero):** When forced into "high effort" reasoning on pure MarkZero (Agent IR) without context, Grok failed catastrophically. It attempted to guess the structure, outputting a hallucinated markdown table where it incorrectly merged rows and misaligned data (placing ID `103` under `admin = true` instead of `active = true`). It also explicitly pleaded for instructions: *"Could you clarify what you'd like me to do with it?"*.
- **The "What do I do?" Reflex (JSON):** Even for the familiar JSON format, Grok responded with: *"It looks like you've shared some nested array data... Could you clarify what you'd like me to do with it?"* while avoiding outputting the data entirely.
- **The Latency Anomaly:** Despite MarkZero burning slightly more reasoning tokens (2,161 vs 1,874), the latency for processing the JSON payload was nearly double (57 seconds vs 28 seconds). This suggests that computing the relations of raw JSON arrays internally caused significant computational stalling for the model.
- **Overall Verdict:** You **cannot** use MarkZero (ADN) as a raw prompt input for a generic LLM with reasoning enabled. The LLM will waste massive amounts of tokens trying to "understand" the alien syntax and will often hallucinate invalid structures. MarkZero is an *Agent IR*, meaning it must be parsed computationally (via MZHAO) and injected into the AI's structural memory, bypassing the LLM's visual and reasoning cortex completely.

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
