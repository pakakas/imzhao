# actors-permissions

RBAC matrix untuk 5 aktor dengan permission per modul.

## Data Type
- Array of actor objects with nested permissions
- 5 aktor (Pegawai, Pimpinan, Helpdesk, Badan Usaha, Masyarakat)

## Payload Formats
- `json.txt` — JSON array with nested permissions
- `yaml.txt` — YAML list
- `md.txt` — Markdown table (simplified)
- `mz.txt` — MarkZero grid (actor metadata only)

## Key Fields
- `actor` — Actor ID (A-01 to A-05)
- `name` — Nama aktor
- `type` — Tipe (ASN, Eselon, Staff, Eksternal, Publik)
- `auth` — Metode autentikasi (SSO, Login Mandiri, Tanpa Login)
- `modules` — Permission per modul (read, write, full, approve_reject)

## Source
Wiki: `digitak_labs/portal-djka-task-note` — PRD, SRS, Mobile App

## Potential Issues
- Permission leak antar aktor
- SSO dependency untuk aktor internal
- Mode publik tanpa autentikasi butuh rate limiting
