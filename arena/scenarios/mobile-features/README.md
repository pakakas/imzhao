# mobile-features

Feature list untuk mobile app dengan prioritas, aktor, dan constraints.

## Data Type
- Array of feature objects
- 11 fitur (FR-MOB-01 to FR-MOB-11)

## Payload Formats
- `json.txt` — JSON array
- `yaml.txt` — YAML list
- `md.txt` — Markdown table
- `mz.txt` — MarkZero grid

## Key Fields
- `id` — Feature ID (FR-MOB-xx)
- `feature` — Nama fitur
- `priority` — P1 (must have) / P2 (should have)
- `actors` — Aktor yang menggunakan
- `constraint` — Technical constraint
- `size_impact` — Dampak ke bundle size (high/medium/low/constraint)

## Source
Wiki: `digitak_labs/portal-djka-task-note` — Mobile App - Note

## Potential Issues
- Bundle size exceed 50MB limit
- SSO dependency failure di mobile
- Offline capability tidak dispesifikasi
- Push notification reliability
