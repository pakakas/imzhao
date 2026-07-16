# Spesifikasi iMZHAO (v1)

## Ringkasan
**iMZHAO (MarkZero Hybrid AgentOps)** adalah protokol Agent Intermediate Representation (AIR) untuk menangani pemanggilan alat, eksekusi, dan alur human-in-the-loop (HITL) dalam aliran teks LLM.

> Untuk serialisasi data, lihat **[Spesifikasi ADN](adn-spec-v1.en.md)**.
> Untuk format amplop pesan, lihat **[Spesifikasi Protokol MarkZero](markzero-spec.en.md)**.

## 1. Ruang Lingkup

Agentic **tidak** mendefinisikan serialisasi data (itu tugas ADN) atau pembingkaian pesan (itu tugas MarkZero). Protokol ini mendefinisikan:

- **Markers Operasional AIR** — primitif orkestrasi agen
- **Protokol HITL** — alur persetujuan manusia untuk eksekusi perkakas
- **Pola Pemanggilan Alat (Tool Calling)** — pemanggilan tunggal, paralel, dan berurutan (sequential)

## 2. Markers Operasional AIR

| Marker | U+ | Deskripsi |
| :---: | :---: | :--- |
| `τ` | U+03C4 | Awalan anotasi tipe — misal: `τstr`, `τgrid`, `τnum` |
| `¡` | U+00A1 | Marker invoke — memicu eksekusi perkakas |

Markers ini dapat muncul di payload ADN dan dapat dirangkum dalam header instruksi menggunakan `buildHeader()`.

### 2.1 Modifikasi Parameter: Parameter Opsional
Parameter dalam registri dapat ditandai sebagai opsional:
- **Deteksi**: Dalam skema parameter terstruktur, parameter ditandai sebagai opsional jika definisi tipenya memuat kata `optional` (misal: `"string optional"`). Parser (`parseParams`) mendeteksi kata tersebut, menetapkan `optional: true`, dan menormalisasi anotasi tipe ke bentuk dasarnya (misal: `τstr`).
- **Pembuatan Registri**: Pada tabel Registri yang dihasilkan, parameter opsional diformat sebagai `${name} ${type} optional` (misal: `path τstr optional`).

## 3. Pola Pemanggilan Alat (Invoke Special Grid)

Blok invoke (pemanggilan alat) adalah **special grid**. Berbeda dengan grid biasa yang diawali dengan penanda grid standar `░`, invoke special grid diawali dengan penanda invoke `¡`.

Invoke grid mewakili satu atau lebih perintah yang akan dieksekusi:
- **Kolom (`¦`)** mewakili jalur pipa berurutan / pipeline (kolom untuk pipeline).
- **Baris (`→`)** mewakili eksekusi paralel (baris untuk paralel).

### 3.1 Pemanggilan Alat Tunggal
Satu perintah tunggal, direpresentasikan sebagai string datar:
```
¡grep pattern path
```
Hasil Dekode: `{ type: "tool-invoke", mode: "pipeline", commands: [["grep", "pattern", "path"]] }`

### 3.2 Pemanggilan Alat Berurutan (Pipeline)
Beberapa perintah yang dipisahkan oleh pembatas kolom (`¦`) untuk membentuk pipeline:
```
¡grep const¦count -n 10
```
Hasil Dekode: `{ type: "tool-invoke", mode: "pipeline", commands: [["grep", "const"], ["count", "-n", "10"]] }`

### 3.3 Pemanggilan Alat Paralel
Beberapa perintah yang dipisahkan oleh penanda baris (`→`) untuk eksekusi paralel:
```
¡grep const→count -v
```
Hasil Dekode: `{ type: "tool-invoke", mode: "parallel", commands: [["grep", "const"], ["count", "-v"]] }`

## 4. Tipe Kembalian Perkakas (Tool Return Types) dan Klasifikasi Data

Saat meregistrasikan perkakas di registri, tipe kembaliannya dianotasikan menggunakan awalan `τ` (misal: `τgrid`, `τmap`, `τset`). Representasi struktural dari hasilnya diklasifikasikan sebagai berikut:

### 4.1 Struktur Bersarang: Grid (`τgrid`)
Digunakan saat respons memuat struktur data hierarkis atau bersarang (misal: objek bersarang atau array dari objek).
- **Pengodean**: MarkZero meratakan data bersarang menjadi beberapa grid referensi yang terhubung via referensi grid (`※Index`).
- **Contoh**:
  - Grid 0: `░→status≡success→matches≡※1`
  - Grid 1: `░§file¦lines→main.ts¦※2`
  - Grid 2: `░10→20`

### 4.2 Kunci-Nilai Flat 1D: Map (`τmap`)
Digunakan saat respons berupa objek datar yang berisi pasangan kunci-nilai tanpa elemen bersarang.
- **Contoh**: `░→os≡windows→cpu≡intel`

### 4.3 Daftar Flat 1D: Set (`τset`)
Digunakan saat respons berupa array atau daftar datar dari nilai primitif.
- **Contoh**: `░Script1→Script2→Script3`

## 5. Protokol HITL (Human-In-The-Loop)

Protokol HITL yang ringan berdasarkan exit code untuk CLI tools. Agent tools berkomunikasi dengan tool developer via flag `--dry-run`; tools merespons dengan exit code bersemantik HTTP.

### 5.1 Prinsip Desain

1. **`--dry-run` = Protokol Maintenis** — agent tool mengirim `--dry-run`, tool merespons dengan exit code
2. **Exit code = Semantik HTTP** — pemetaan dari kode status HTTP ke exit code 2 digit
3. **Persetujuan bertingkat** — perkakas destruktif memerlukan konfirmasi lebih ketat bahkan setelah "always allow"
4. **Kompatibel mundur** — perkakas tanpa dukungan HITL mengembalikan error, agent tool kembali ke perilaku lama

### 5.2 Flag `--dry-run`

Agent tool **selalu** mengirim `--dry-run` sebelum eksekusi. Tool wajib merespons:

```
Agent tool → tool cmd --dry-run → tool respond exit code → agent tool handle
```

| Argumen | Arti | Dikirim oleh |
|---|---|---|
| `--dry-run` | Dry run, cek persetujuan | Agent tool (selalu pertama) |
| tanpa `--dry-run` | Eksekusi, sudah disetujui | Agent tool (setelah persetujuan user) |

### 5.3 Exit Code (Semantik HTTP)

| Exit Code | Analog HTTP | Konstanta | Arti | Tindakan Agent Tool |
|---|---|---|---|---|
| `0` | 200 OK | `EXIT_SUCCESS` | Berhasil | Tidak ada (normal) |
| `1` | 400 Bad Request | `EXIT_ERROR` | Error | Laporkan ke user |
| `22` | 202 Accepted | `EXIT_ACCEPTED` | Butuh persetujuan (sedang) | Tanya user sekali |
| `23` | 423 Locked | `EXIT_LOCKED` | Butuh persetujuan (destruktif) | Tanya + peringatan ketat |
| `28` | 428 Precondition Required | `EXIT_PRECONDITION` | Butuh persetujuan (irreversible) | Tanya + konfirmasi ganda |
| `43` | 403 Forbidden | `EXIT_FORBIDDEN` | Ditolak user | Laporkan penolakan |

### 5.4 Persetujuan Bertingkat

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: Default (semua perkakas)                       │
│  --dry-run → exit 22 → TANYA user → setujui/tolak       │
│  User "always allow" → simpan ke konfigurasi            │
├─────────────────────────────────────────────────────────┤
│  Tier 2: Penjaga destruktif                             │
│  --dry-run → exit 23/28 → bahkan jika user sudah pilih  │
│  "always allow" → TANYA LAGI dengan peringatan keras    │
│  = 2x peringatan sebelum dieksekusi                     │
└─────────────────────────────────────────────────────────┘
```

### 5.5 Mode Eksekusi

Agent tool mendukung 3 mode eksekusi, dapat dikonfigurasi per user dan per perkakas:

| Mode | Deskripsi | Konfigurasi | `--dry-run` dikirim? |
|---|---|---|---|
| **HITL** (default) | Alur persetujuan penuh | tidak ada | Ya |
| **Always-allow** | Auto-approve, tapi Tier 2 tetap bertanya | `alwaysAllow: { tool: true }` | Ya |
| **YOLO** | Lewati semua peringatan, eksekusi langsung | `yolo: { tool: true }` | Tidak |

**Mode YOLO** = user mengambil tanggung jawab penuh. Tidak ada `--dry-run` dikirim, tidak ada cek exit code, tidak ada persetujuan. Eksekusi dicatat dengan tag `[YOLO]` untuk audit trail.

Contoh konfigurasi (per user + per perkakas):
```json
{
  "alwaysAllow": { "cat": true, "ls": true },
  "yolo": { "destruktool": true }
}
```

### 5.6 Tanggung Jawab Tool Developer

1. Implementasikan handler flag `--dry-run` (mode dry run)
2. Cek apakah perintah butuh persetujuan → respons dengan exit code yang tepat
3. Keluarkan detail ke stdout (format bebas: MZ, JSON, ASCII)
4. Tanpa `--dry-run` = eksekusi secara normal (sudah disetujui)
5. Dokumentasikan exit code di output `--help`

### 5.7 Tanggung Jawab Agent Tool

1. Selalu kirim `--dry-run` sebelum eksekusi
2. Baca exit code → implementasikan logika persetujuan bertingkat
3. Simpan keputusan "always allow" ke konfigurasi
4. Terapkan Tier 2 untuk perkakas destruktif (exit 23/28)
5. Kembali ke perilaku legacy jika perkakas tidak mendukung `--dry-run`

### 5.8 Kompatibilitas Mundur

Perkakas yang terpasang mungkin belum mendukung `--dry-run`. Agent tool harus menangani:

```
Agent tool mengirim: tool cmd --dry-run
    │
    ├─ Tool merespons exit 22/23/28 → HITL DIDUKUNG → persetujuan bertingkat
    │
    └─ Tool merespons error "unknown option" → LEGACY → perilaku lama (tanya sekali)
```

| Perkakas | Respons | Perilaku agent tool |
|---|---|---|
| `cat` (HITL) | exit 0 | Auto-approve (aman) |
| `destruktool` (HITL) | exit 28 | Persetujuan bertingkat |
| `old-tool` (legacy) | "unknown option" | Tanya sekali, lalu "always" |

---
*Spesifikasi Resmi iMZHAO — diperbarui 16 Juli 2026*
