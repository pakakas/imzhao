# integrations

Daftar integrasi sistem eksternal dengan protokol, arah data, modul terdampak, dan criticality level.

## Data Type
- Array of integration objects
- 17 integrasi ke sistem eksternal (SSO, API, ESB, Spatial DB)

## Payload Formats
- `json.txt` — JSON array
- `yaml.txt` — YAML list
- `md.txt` — Markdown table
- `mz.txt` — MarkZero grid

## Key Fields
- `id` — Integration ID (INT-01 to INT-17)
- `system` — Nama sistem eksternal
- `protocol` — Protokol komunikasi (REST, OAuth, ESB, Spatial DB)
- `direction` — pull / push / bidirectional
- `modules` — Modul yang terdampak
- `refresh_interval` — Frekuensi sinkronisasi
- `criticality` — critical / high / medium / low

## Source
Wiki: `digitak_labs/portal-djka-task-note` — PRD, SRS

## Potential Issues
- API sistem eksternal tidak kompatibel/tidak tersedia
- SSO dependency blocking semua modul
- Refresh interval conflict dengan real-time requirement
