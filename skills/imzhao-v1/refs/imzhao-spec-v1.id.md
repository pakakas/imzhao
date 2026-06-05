# Spesifikasi iMZHAO (v1)

## Ringkasan
**iMZHAO (MarkZero Hybrid AgentOps)** adalah protokol Agent Intermediate Representation (AIR) yang dirancang untuk menangani enkapsulasi, parsing, dan eksekusi instruksi mesin otonom serta data dalam aliran teks LLM.

> Untuk envelope protokol (`М`/`О`) dan header decoder inline, lihat **[Spesifikasi Protokol MarkZero](../../../../markzero/skills/markzero/references/markzero-spec.md)**.

## 1. Markers Operasional AIR
Selain [markers struktural ADN](../../../../markzero/skills/markzero/references/adn-spec-v1.md), iMZHAO mendefinisikan markers operasional untuk orkestrasi agen:

| Marker | Deskripsi |
| :---: | :--- |
| `⇒` | Operator pipa — menghubungkan output tools secara berurutan |
| `τ` | Awalan anotasi tipe — contoh: `τstr`, `τgrid`, `τnum` |
| `ⓘ` | Marker invoke — memicu eksekusi tool |

Markers ini juga muncul di output `buildHeader()` jika ada.

## 2. Protokol HITL (Human-In-The-Loop)

Protokol HITL yang ringan berdasarkan exit code untuk CLI tools. Agent tools berkomunikasi dengan tool developer melalui flag `--hitl`; tools merespons dengan exit code bersemantik HTTP.

### 2.1 Prinsip Desain

1. **`--hitl` = protokol Maintenis** — agent tool mengirim `--hitl`, tool merespons dengan exit code
2. **Exit code = semantik HTTP** — mapping dari HTTP status code ke exit code 2 digit
3. **Persetujuan bertingkat** — tools destruktif memerlukan konfirmasi lebih ketat bahkan setelah "always allow"
4. **Kompatibel mundur** — tools tanpa dukungan HITL mengembalikan error, agent tool kembali ke behavior lama

### 2.2 Flag `--hitl`

Agent tool **selalu** mengirim `--hitl` sebelum eksekusi. Tool wajib merespons:

```
Agent tool → tool cmd --hitl → tool respond exit code → agent tool handle
```

| Argumen | Arti | Dikirim oleh |
|---------|------|-------------|
| `--hitl` | Dry run, cek persetujuan | Agent tool (selalu pertama) |
| tanpa `--hitl` | Eksekusi, sudah disetujui | Agent tool (setelah user approve) |

### 2.3 Exit Code (Semantik HTTP)

| Exit Code | Analog HTTP | Konstanta | Arti | Aksi Agent Tool |
|-----------|-------------|-----------|------|-----------------|
| `0` | 200 OK | `EXIT_SUCCESS` | Berhasil | Tidak ada (normal) |
| `1` | 400 Bad Request | `EXIT_ERROR` | Error | Laporkan ke user |
| `22` | 202 Accepted | `EXIT_ACCEPTED` | Butuh persetujuan (sedang) | Tanya user sekali |
| `23` | 423 Locked | `EXIT_LOCKED` | Butuh persetujuan (destruktif) | Tanya + peringatan ketat |
| `28` | 428 Precondition Required | `EXIT_PRECONDITION` | Butuh persetujuan (irreversible) | Tanya + konfirmasi ganda |
| `43` | 403 Forbidden | `EXIT_FORBIDDEN` | Ditolak user | Laporkan penolakan |

### 2.4 Persetujuan Bertingkat

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: Default (semua tool)                           │
│  --hitl → exit 22 → TANYA user → approve/reject         │
│  User "always allow" → simpan ke config                 │
├─────────────────────────────────────────────────────────┤
│  Tier 2: Penjaga destruktif                             │
│  --hitl → exit 23/28 → walau user sudah "always"        │
│  → TANYA LAGI dengan peringatan lebih ketat             │
│  = 2x alert sebelum eksekusi                            │
└─────────────────────────────────────────────────────────┘
```

### 2.5 Mode Eksekusi

Agent tool mendukung 3 mode eksekusi, dapat dikonfigurasi per user dan per tool:

| Mode | Deskripsi | Config | `--hitl` dikirim? |
|------|-----------|--------|-------------------|
| **HITL** (default) | Alur persetujuan penuh | tidak perlu | Ya |
| **Always-allow** | Auto-approve, tapi Tier 2 tetap tanya | `alwaysAllow: { tool: true }` | Ya |
| **YOLO** | Lewati semua peringatan, eksekusi langsung | `yolo: { tool: true }` | Tidak |

**Mode YOLO** = user mengambil tanggung jawab penuh. Tidak ada `--hitl` dikirim, tidak ada cek exit code, tidak ada persetujuan. Eksekusi dicatat dengan tag `[YOLO]` untuk audit trail.

Contoh config (per user + per tool):
```json
{
  "alwaysAllow": { "cat": true, "ls": true },
  "yolo": { "destruktool": true }
}
```

### 2.6 Tanggung Jawab Tool Developer

1. Implementasi handler flag `--hitl` (mode dry run)
2. Cek apakah command butuh persetujuan → respons dengan exit code yang tepat
3. Output detail ke stdout (format bebas: MZ, JSON, ASCII)
4. Tanpa `--hitl` = eksekusi normal (sudah disetujui)
5. Dokumentasikan exit code di output `--help`

### 2.7 Tanggung Jawab Agent Tool

1. Selalu kirim `--hitl` sebelum eksekusi
2. Baca exit code → implementasi logika persetujuan bertingkat
3. Simpan keputusan "always allow" ke config
4. Terapkan Tier 2 untuk tools destruktif (exit 23/28)
5. Kembali ke behavior lama jika tool tidak mendukung `--hitl`

### 2.8 Kompatibilitas Mundur

Tools yang sudah di-deploy mungkin belum mendukung `--hitl`. Agent tool harus menangani:

```
Agent tool mengirim: tool cmd --hitl
    │
    ├─ Tool merespons exit 22/23/28 → HITL DIDUKUNG → persetujuan bertingkat
    │
    └─ Tool merespons error "unknown option" → LEGACY → behavior lama (tanya sekali)
```

| Tool | Respons | Behavior agent tool |
|------|---------|-------------------|
| `cat` (HITL) | exit 0 | Auto-approve (aman) |
| `destruktool` (HITL) | exit 28 | Persetujuan bertingkat |
| `old-tool` (legacy) | "unknown option" | Tanya sekali, lalu "always" |

---
*Spesifikasi Resmi iMZHAO — diperbarui 4 Juni 2026*
