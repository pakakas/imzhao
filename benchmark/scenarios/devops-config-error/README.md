# devops-config-error

Docker Compose config validation errors dengan line/column, suggestion, dan missing env vars.

## Data Type
- Config validation errors with context
- Missing environment variables
- Deprecation warnings

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown tables
- `mz.txt` — MarkZero grid

## Key Fields
- `errors[].line` — Error location
- `errors[].message` — Error description
- `errors[].suggestion` — Fix suggestion
- `errors[].context` — Surrounding config text
- `env_missing` — Required but unset variables
- `warnings` — Non-blocking issues

## DevOps Actions
- Fix interpolation syntax
- Define missing service or remove dependency
- Correct port mapping format
- Remove obsolete 'version' key
- Set missing env variables
