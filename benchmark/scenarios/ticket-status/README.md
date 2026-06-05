# ticket-status

State machine untuk sistem helpdesk ticketing dengan 7 status, transisi rules, dan SLA per level.

## Data Type
- Array of status objects with transition rules
- 7 status tiket (Open → Closed)

## Payload Formats
- `json.txt` — JSON array
- `yaml.txt` — YAML list
- `md.txt` — Markdown table
- `mz.txt` — MarkZero grid

## Key Fields
- `code` — Status code (01-07)
- `name` — Status name
- `actor` — Aktor yang bertanggung jawab
- `allowed_transitions` — Status yang bisa dituju
- `sla_first_response` — SLA target waktu respon pertama

## Source
Wiki: `digitak_labs/portal-djka-task-note` — Fitur - Ticketing Issue

## Potential Issues
- State transition yang salah bisa corrupt data tiket
- SLA breach tidak terdeteksi tepat waktu
- Transisi loop (Pending Info ↔ In Progress)
