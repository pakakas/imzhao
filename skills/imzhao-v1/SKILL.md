---
name: imzhao-v1
description: Skill for handling iMZHAO agent protocol operational markers and tool calling patterns.
---

# iMZHAO Protocol Skill

## AIR Markers
- Type Annotation: `τ` (e.g., `τstr`, `τgrid`, `τnum`)
- Invoke Trigger: `¡`

## Registry Grid Example
```
†Tool Registry░§invoke¦args¦returns→grep¦pattern τstr path τstr optional¦τgrid
```

## Tool Calling (Special Grid)
- Single Command:
```
¡grep pattern path
```
- Pipeline (Sequential):
```
¡grep const¦count -n 10
```
- Parallel:
```
¡grep const→count -v
```
