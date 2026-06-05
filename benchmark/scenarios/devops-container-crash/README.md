# devops-container-crash

Pod CrashLoopBackOff dengan OOMKilled, events, dan log tail.

## Data Type
- Pod status, container resources, k8s events, application logs

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown tables
- `mz.txt` — MarkZero grid

## Key Fields
- `status` — CrashLoopBackOff
- `last_exit_code` — 137 (OOMKilled)
- `restart_count` — 14
- `resources.limits.memory` — 256Mi
- `events` — Warning: BackOff, OOMKilling
- `logs_tail` — Memory usage ramp up → OOM

## DevOps Actions
- Increase memory limit
- Investigate memory leak in application
- Check batch job #4521 memory footprint
