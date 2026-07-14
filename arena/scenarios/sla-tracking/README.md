# sla-tracking

SLA rules untuk ticketing system dengan target waktu respon, resolusi, dan escalation.

## Data Type
- Array of SLA rule objects
- 6 rules (L1: Low/Medium/High/Critical, L2: Technical/System Critical)

## Payload Formats
- `json.txt` — JSON array
- `yaml.txt` — YAML list
- `md.txt` — Markdown table
- `mz.txt` — MarkZero grid

## Key Fields
- `level` — Support level (L1 / L2)
- `priority` — Prioritas (Low, Medium, High, Critical, Technical, System Critical)
- `category` — Kategori masalah
- `first_response` — Target waktu respon pertama
- `resolution` — Target waktu penyelesaian
- `escalation` — Rule eskalasi
- `escalation_trigger` — Waktu trigger eskalasi

## Source
Wiki: `digitak_labs/portal-djka-task-note` — Fitur - Ticketing Issue

## Potential Issues
- SLA breach tidak terdeteksi otomatis
- Eskalasi manual butuh monitoring 24/7
- Clock drift antara server dan client
