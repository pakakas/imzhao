---
name: imzhao-v1
description: Skill for handling iMZHAO agent protocol operational markers and tool calling patterns.
---

# iMZHAO Protocol Skill

## AIR Markers
- Use `τ` (U+03C4) as type annotation prefix (e.g., `τstr`, `τgrid`, `τnum`).
- Use `¡` (U+00A1) as invoke marker to trigger tool execution.

## Registry Grid
- Format tool registry using `░` grid with columns: `invoke`, `args`, `returns`.
- Map optional parameters using suffix `optional` (e.g., `path τstr optional`).

## Tool Calling (Special Grid)
- Do not prepend standard grid marker `░`. Always start tool calls with `¡` (INVOKE).
- Combine multiple commands in the invoke grid using:
  - **Sequential (Pipeline)**: Column separator `¦` (e.g., `¡grep const¦count -n 10`).
  - **Parallel**: Row marker `→` (e.g., `¡grep const→count -v`).
- Keep markers tight. Do not write spaces around `¦` and `→`.
