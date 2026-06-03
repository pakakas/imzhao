# Pakakas Benchmark Suite

Direktori ini berisi tool untuk melakukan benchmark token efficiency, reasoning bloat, dan latency pada format payload JSON, MDKV, MarkZero (ADN), dan TOON.


## 📂 Struktur Direktori

```
benchmark/
├── grok-benchmark-report.ts  # Script benchmark untuk Grok-4.3 (via browser)
├── mimo/
│   └── mimo-benchmark-report.ts  # Script benchmark untuk MiMo-v2.5-pro (via API)
│
├── scenarios/                  # Skenario test dan payload
│   ├── json-payload.txt
│   ├── mdkv-payload.txt
│   ├── mz-payload.txt
│   ├── mz-header-payload.txt
│   ├── toon-payload.txt
│   └── zerolang-error/        # Skenario error zero-lang (NAM003)
│       ├── ai-providers/      # Config provider AI
│       │   ├── grok.json
│       │   └── mimo.json
│       └── payloads/          # Payload untuk skenario ini
│           ├── json.txt
│           ├── mdkv.txt
│           ├── mz.txt
│           ├── mz-header.txt
│           └── toon.txt
│
└── results/                    # Semua laporan benchmark di-generate disini
```


## ✅ Prasyarat

1. **Bun**: Runtime TypeScript/JavaScript (install dari [bun.sh](https://bun.sh))
2. **MIMO_API_KEY**: API key untuk Xiaomi MiMo (dapatkan dari console Xiaomi AI)
3. **Untuk Grok-4.3**:
   - Browser dengan akses ke [Grok Console](https://console.x.ai)
   - Puppeteer (sudah termasuk di dependencies)
   - Browser remote debugging diaktifkan (contoh Chrome: `chrome --remote-debugging-port=9210`)


## 🚀 Setup

### 1. Install Dependencies
```bash
cd pakakas/imzhao
bun install
```

### 2. Set Environment Variables
Buat file `.env` di root project (`f:\work\00-oss\maintenis\`) dan tambahkan:
```env
MIMO_API_KEY="your-mimo-api-key-disini"
```


## 🏃 Cara Menjalankan Benchmark

### Menggunakan Runner Script (Recommended)
Entry point utama berada di `pakakas/imzhao/benchmark/index.ts` dan bisa dipanggil via npm scripts:

```bash
cd pakakas/imzhao

# Jalankan semua benchmark (MiMo + Grok)
bun run benchmark

# Atau spesifik provider
bun run benchmark:mimo
bun run benchmark:grok
```

#### Argumen opsional:
- `--provider <all|mimo|grok>`: Pilih provider AI (default: `all`)
- `--outdir <path>`: Direktori output laporan (default: `./results`)

Contoh:
```bash
# Hanya MiMo, output ke direktori kustom
bun run benchmark:mimo --outdir "./benchmark/results-custom"
```


### Manual (Tanpa Runner)
#### Benchmark MiMo (API)
```bash
cd pakakas/imzhao/benchmark/mimo
bun run mimo-benchmark-report.ts --outfile "../results/013-mimo-benchmark-new.md"
```

#### Benchmark Grok (Browser)
1. Aktifkan remote debugging browser:
   ```powershell
   # Contoh untuk Chrome/Edge di Windows
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9210
   ```
2. Buka [Grok Console](https://console.x.ai) dan login
3. Jalankan script:
   ```bash
   cd pakakas/imzhao/benchmark
   bun run grok-benchmark-report.ts --outfile "./results/014-grok-benchmark-new.md"
   ```


## 📊 Metodologi Benchmark

### Format yang di-test
1. **JSON Compact**: Format standar JSON minified
2. **MDKV Minified**: Format key-value dengan bullet markdown
3. **MarkZero (ADN)**: Format agent IR dengan simbol Unicode
4. **MarkZero + MZ Header**: MarkZero dengan header `MZrules` untuk menjelaskan simbol
5. **TOON**: Format tree-like dengan indentasi

### Metrik yang diukur
- **Input Tokens**: Jumlah token payload input
- **Reasoning Tokens**: Jumlah token yang digunakan untuk berpikir (khusus model reasoning)
- **Output Tokens**: Jumlah token output
- **Total Tokens**: Input + Output
- **Latency**: Waktu eksekusi (ms)

### Model yang di-test
- **mimo-v2.5-pro**: Via API Xiaomi MiMo
- **grok-4.3**: Via browser console (Puppeteer)


## 📈 Hasil Benchmark
Semua laporan benchmark disimpan di direktori `results/`.

Contoh ringkasan hasil sebelumnya:
- **MarkZero (ADN)**: Total token terendah untuk MIMO
- **TOON**: Latency tercepat untuk MIMO
- **MarkZero + MZ Header**: Buruk karena reasoning bloat parah


## 🎯 Kontribusi
Untuk menambah skenario baru:
1. Buat direktori di `scenarios/`
2. Tambahkan payload dalam berbagai format di subdirektori `payloads/`
3. Tambahkan config provider di `ai-providers/` (opsional)
