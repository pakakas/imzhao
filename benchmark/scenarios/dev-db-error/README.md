# dev-db-error

PostgreSQL constraint violations (unique, foreign key) dengan suggested fixes.

## Data Type
- SQL errors with query context, constraint details, fix suggestions

## Payload Formats
- `json.txt` — JSON array
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `code` — PostgreSQL error code (23505, 23503)
- `table` — Affected table
- `constraint` — Violated constraint
- `query` — Original SQL with params
- `suggestion` — Fix SQL

## Developer Actions
- Use ON CONFLICT for duplicate handling
- Validate foreign key references before insert
- Add database-level error handling in service layer
