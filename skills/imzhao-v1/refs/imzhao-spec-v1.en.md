# iMZHAO Specification (v1)

## Overview
**iMZHAO (MarkZero Hybrid AgentOps)** is the Agent Intermediate Representation (AIR) protocol designed for handling the encapsulation, parsing, and execution of autonomous machine instructions and data within LLM text streams.

> For protocol envelope (`М`/`О`) and inline decoder header, see **[MarkZero Protocol Specification](../../../../markzero/skills/markzero/references/markzero-spec.en.md)**.

## 1. AIR Operational Markers
In addition to [ADN structural markers](../../../../markzero/skills/markzero/references/adn-spec-v1.en.md), iMZHAO defines operational markers for agent orchestration:

| Marker | Description |
| :---: | :--- |
| `⇒` | Pipe operator — chains tool outputs sequentially |
| `τ` | Type annotation prefix — e.g. `τstr`, `τgrid`, `τnum` |
| `ⓘ` | Invoke marker — triggers tool execution |

These also appear in `buildHeader()` output when present.

## 2. HITL (Human-In-The-Loop) Protocol

A lightweight, exit-code-based HITL protocol for CLI tools. Agent tools communicate with tool developers via `--hitl` flag; tools respond with HTTP-semantic exit codes.

### 2.1 Design Principles

1. **`--hitl` = Maintenis protocol** — agent tool sends `--hitl`, tool responds with exit code
2. **Exit codes = HTTP semantics** — mapping from HTTP status codes to 2-digit exit codes
3. **Tiered approval** — destructive tools require stricter confirmation even after "always allow"
4. **Backward compatible** — tools without HITL support return error, agent tool falls back to legacy behavior

### 2.2 `--hitl` Flag

Agent tool **always** sends `--hitl` before execute. Tool must respond:

```
Agent tool → tool cmd --hitl → tool respond exit code → agent tool handle
```

| Argument | Meaning | Sent by |
|----------|---------|---------|
| `--hitl` | Dry run, check approval | Agent tool (always first) |
| no `--hitl` | Execute, already approved | Agent tool (after user approve) |

### 2.3 Exit Codes (HTTP Semantics)

| Exit Code | HTTP Analog | Constant | Meaning | Agent Tool Action |
|-----------|-------------|----------|---------|-------------------|
| `0` | 200 OK | `EXIT_SUCCESS` | Success | None (normal) |
| `1` | 400 Bad Request | `EXIT_ERROR` | Error | Report to user |
| `22` | 202 Accepted | `EXIT_ACCEPTED` | Needs approval (moderate) | Ask user once |
| `23` | 423 Locked | `EXIT_LOCKED` | Needs approval (destructive) | Ask + strict warning |
| `28` | 428 Precondition Required | `EXIT_PRECONDITION` | Needs approval (irreversible) | Ask + double confirmation |
| `43` | 403 Forbidden | `EXIT_FORBIDDEN` | Rejected by user | Report rejection |

### 2.4 Tiered Approval

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: Default (all tools)                            │
│  --hitl → exit 22 → ASK user → approve/reject           │
│  User "always allow" → save to config                   │
├─────────────────────────────────────────────────────────┤
│  Tier 2: Destructive guard                              │
│  --hitl → exit 23/28 → even if user already "always"    │
│  → ASK AGAIN with stricter warning                      │
│  = 2x alert before execute                              │
└─────────────────────────────────────────────────────────┘
```

### 2.5 Execution Modes

Agent tool supports 3 execution modes, configurable per user and per tool:

| Mode | Description | Config | `--hitl` sent? |
|------|-------------|--------|----------------|
| **HITL** (default) | Full approval flow | none | Yes |
| **Always-allow** | Auto-approve, but Tier 2 still asks | `alwaysAllow: { tool: true }` | Yes |
| **YOLO** | Skip all warnings, execute immediately | `yolo: { tool: true }` | No |

**YOLO mode** = user takes full responsibility. No `--hitl` sent, no exit code check, no approval. Execution is logged with `[YOLO]` tag for audit trail.

Config example (per user + per tool):
```json
{
  "alwaysAllow": { "cat": true, "ls": true },
  "yolo": { "destruktool": true }
}
```

### 2.6 Tool Developer Responsibilities

1. Implement `--hitl` flag handler (dry run mode)
2. Check if command needs approval → respond with appropriate exit code
3. Output detail to stdout (any format: MZ, JSON, ASCII)
4. Without `--hitl` = execute normally (already approved)
5. Document exit codes in `--help` output

### 2.7 Agent Tool Responsibilities

1. Always send `--hitl` before execute
2. Read exit code → implement tiered approval logic
3. Persist "always allow" decisions to config
4. Enforce Tier 2 for destructive tools (exit 23/28)
5. Fall back to legacy behavior if tool doesn't support `--hitl`

### 2.8 Backward Compatibility

Deployed tools may not support `--hitl`. Agent tool must handle:

```
Agent tool sends: tool cmd --hitl
    │
    ├─ Tool responds exit 22/23/28 → HITL SUPPORTED → tiered approval
    │
    └─ Tool responds error "unknown option" → LEGACY → legacy behavior (ask once)
```

| Tool | Response | Agent tool behavior |
|------|----------|-------------------|
| `cat` (HITL) | exit 0 | Auto-approve (safe) |
| `destruktool` (HITL) | exit 28 | Tiered approval |
| `old-tool` (legacy) | "unknown option" | Ask once, then "always" |

---
*Official iMZHAO Specification — updated June 4, 2026*
