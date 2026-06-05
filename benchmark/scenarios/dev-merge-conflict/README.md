# dev-merge-conflict

Git merge conflict antara main dan feat/ticket-assignment, 2 conflict regions dengan recommendation.

## Data Type
- Merge conflict with both sides, code context, resolution recommendation

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `file` — Conflicted file
- `conflict_regions[].ours` — main branch code
- `conflict_regions[].theirs` — feature branch code
- `conflict_regions[].line_start/end` — Conflict location

## Developer Actions
- Take theirs for assignTicket (more complete)
- Take theirs for validateTransition (adds L2 statuses, typed)
- Review for backward compatibility
