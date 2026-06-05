# dev-test-failure

Jest test failure — performance assertion exceeded threshold dengan possible causes.

## Data Type
- Test result, assertion details, code context, performance analysis

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `assertion` — Expected vs received
- `code_context` — Failing test code
- `performance.possible_causes` — Root cause candidates
- `run_info` — Test suite summary

## Developer Actions
- Profile exportToCsv() for N+1 queries
- Implement streaming export
- Add database index
- Optimize CSV serialization
