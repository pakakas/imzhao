# devops-stack-trace

Nested exception chain: TypeError → AxiosError → 503 Service Unavailable.

## Data Type
- Error with stack trace, cause chain, request context

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `error.type` — TypeError
- `error.stack` — Application stack trace
- `error.cause` — Root cause (AxiosError → 503)
- `context.request_id` — Request tracing
- `context.duration_ms` — Latency

## DevOps Actions
- Check upstream service health
- Review circuit breaker / retry config
- Add null check in UserService.formatUsers
