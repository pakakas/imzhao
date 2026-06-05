# devops-health-check

Service health check dengan dependency status, latency, dan critical issues.

## Data Type
- Service health status, dependency checks, resource metrics

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `status` — healthy / unhealthy / degraded
- `checks[].name` — Check name (database, redis, disk, etc.)
- `checks[].status` — Check result
- `checks[].latency_ms` — Response time
- `dependencies` — Downstream service status

## DevOps Actions
- Investigate external_api timeout (18 consecutive failures)
- Restart notification-service
- Clean up disk space (/data at 82%)
