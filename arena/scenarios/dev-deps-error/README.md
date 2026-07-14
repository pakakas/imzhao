# dev-deps-error

Package dependency errors: workspace not found, peer dep conflict, native build failure, security warnings.

## Data Type
- Package install errors, peer dependency conflicts, native build failures, CVE warnings

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `packages[].error` — Package-specific error
- `packages[].peer_dep` — Peer dependency conflict details
- `packages[].build_error` — Native module build failure
- `warnings` — Security vulnerabilities, deprecation
- `lockfile` — Lockfile status

## Developer Actions
- Run 'bun install' in monorepo root first
- Upgrade @types/express or downgrade express
- Install windows-build-tools or use WSL
- Replace lodash with lodash-es, moment with dayjs
