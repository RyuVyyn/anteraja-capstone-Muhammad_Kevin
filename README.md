# Anteraja Hub Dwell Monitor

Anteraja Hub Dwell Monitor adalah dashboard operasional web berbasis React, Vite, TypeScript, Tailwind CSS, dan Leaflet yang dirancang khusus untuk supervisor operasional logistik Anteraja dalam memantau, menganalisis, dan memprioritaskan investigasi dwell time (waktu inap) paket di seluruh staging hub logistik secara cepat dan presisi.

Dokumentasi teknis, pengujian AI, analisis operasional, dan arsitektur data lengkap dapat diakses pada [docs/hub-dwell-monitor.md](docs/hub-dwell-monitor.md).

---

## Prasyarat Lingkungan (Requirements)

- **Node.js**: Versi `>= 18.0.0` (direkomendasikan Node.js LTS atau v20+)
- **NPM**: Versi `>= 9.0.0`
- **Modern Web Browser**: Chrome, Firefox, Edge, atau Safari dengan dukungan ES2022

---

## Instalasi & Menjalankan Proyek

### 1. Instalasi Dependensi
Jalankan perintah berikut pada terminal di root direktori proyek untuk menginstal seluruh pustaka yang dibutuhkan:
```bash
npm install
```

### 2. Pra-pemrosesan Data (`prepare-data`)
Skrip ini mengeksekusi pipeline ETL lokal: membaca `data/raw/events.csv`, menghitung seluruh statistik metrik ke `public/data/metrics.json` dan `public/data/invalid_records.json`, serta menghasilkan koordinat placeholder Jabodetabek ke `public/data/locations.json`:
```bash
npm run prepare-data
```
> *Catatan*: Perintah `npm run dev` dan `npm run build` secara otomatis menjalankan `prepare-data` sebelum eksekusi melalui hook lifecycle npm (`predev` dan `prebuild`).

### 3. Menjalankan Server Pengembangan (`dev`)
Menjalankan Vite development server lokal:
```bash
npm run dev
```
Buka browser pada alamat yang ditampilkan di terminal (default: `http://localhost:5173/`).

### 4. Menjalankan Unit Test (`test`)
Menjalankan pengujian otomatis fungsi metrik dwell time menggunakan Vitest:
```bash
npm test
```

### 5. Membangun Bundle Produksi (`build`)
Melakukan validasi tipe TypeScript (`tsc -b`) dan kompilasi aset produksi dengan Vite:
```bash
npm run build
```
Hasil build disimpan pada direktori `dist/`.

---

## Struktur Folder Proyek

Struktur folder aktual repository adalah sebagai berikut:

```
anteraja-hub-dwell-monitor/
├── .agents/                    # Konfigurasi skill dan aturan agent
├── data/
│   └── raw/
│       └── events.csv          # Log mentah event ARRIVAL dan DEPARTURE (23.088 baris)
├── dist/                       # Output build produksi (Vite)
├── docs/
│   └── hub-dwell-monitor.md    # Laporan teknis lengkap & dokumentasi operasional
├── public/
│   └── data/
│       ├── ai-summary.json     # Ringkasan analitis dari AI Studio
│       ├── hub_metrics.json    # File metrik legacy (arsip)
│       ├── invalid_records.json# Log event/pasangan tidak valid untuk audit
│       ├── locations.json      # Koordinat latitude/longitude hub (placeholder)
│       └── metrics.json        # Agregasi metrik per hub runtime
├── screenshots/                # Tangkapan layar antarmuka & pengujian AI
│   ├── ai-test-1.png
│   ├── ai-test-2.png
│   ├── ai-test-3.png
│   ├── ai-test-4.png
│   ├── desktop.png
│   ├── mobile-detail.png
│   ├── mobile.png
│   ├── stitch-v1.png
│   └── stitch-v2.png
├── scripts/
│   ├── generate-locations.ts   # Generator koordinat deterministik Jabodetabek
│   └── preprocess.ts           # ETL parser CSV dan kalkulator metrik hub
├── src/
│   ├── components/
│   │   ├── AiSummary.tsx       # Komponen kartu ringkasan AI
│   │   ├── Header.tsx          # Komponen navigasi atas
│   │   ├── HubDetail.tsx       # Panel detail hub (desktop side panel & mobile bottom sheet)
│   │   ├── HubList.tsx         # Daftar hub scrollable dengan peringkat
│   │   ├── HubMap.tsx          # Peta interaktif Leaflet dengan marker & popup
│   │   ├── KpiCards.tsx        # Ringkasan 4 kartu KPI global
│   │   ├── PriorityFilter.tsx  # Toolbar filter segmen prioritas dan input pencarian
│   │   ├── States.tsx          # Tampilan Skeleton, Empty State, dan Error State
│   │   └── TopHubs.tsx         # Kartu Top 3 Hub dengan dwell time tertinggi
│   ├── config/
│   │   └── priority.ts         # Konfigurasi ambang simulasi prioritas (6 jam) & meta styling
│   ├── lib/
│   │   └── metrics/
│   │       ├── dwell.test.ts   # Vitest unit test untuk kalkulasi metrik
│   │       └── dwell.ts        # Fungsi murni metrik (weighted mean, median, ranking, formatting)
│   ├── pages/
│   │   ├── Dashboard.tsx       # Halaman utama monitoring operasional
│   │   └── InvalidRecords.tsx  # Halaman audit data log yang tidak valid
│   ├── App.tsx                 # Root router berbasis hash (#invalid-records)
│   ├── index.css               # Styling global Tailwind CSS v4 & font Plus Jakarta Sans
│   └── main.tsx                # Titik masuk React 19 DOM
├── AGENTS.md                   # Dokumen acuan aturan pengembangan AI agent
├── design.md                   # Token desain visual & spesifikasi UI Modern Logistics Precision
├── index.html                  # Dokumen template HTML
├── package.json                # Skrip & daftar dependensi proyek
├── README.md                   # Panduan dokumentasi proyek
├── tsconfig.app.json           # Konfigurasi TypeScript untuk aplikasi
├── tsconfig.json               # Konfigurasi root TypeScript
├── tsconfig.node.json          # Konfigurasi TypeScript untuk skrip Node / Vite
└── vite.config.ts              # Konfigurasi bundler Vite
```

---

## Tautan Dokumentasi Terkait

Untuk pemahaman komprehensif mengenai metodologi data, perancangan antarmuka, verifikasi prompt AI Studio, hasil pengujian, serta rekomendasi investigasi operasional, silakan pelajari dokumen utama:
- [docs/hub-dwell-monitor.md](docs/hub-dwell-monitor.md)
