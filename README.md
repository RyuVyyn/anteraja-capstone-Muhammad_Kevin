# Anteraja Capstone Project

Repository ini merupakan capstone project untuk program Anteraja NextGen AI Academy. Fokus utama dari pengembangan ini adalah membangun fitur **Shipping Rate Calculator** — sebuah kalkulator ongkos kirim yang memungkinkan pengguna (khususnya pelaku UMKM) untuk melihat tarif pengiriman paket secara akurat, membandingkan layanan, dan mendapatkan rekomendasi pengiriman paling hemat.

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Backend PHP dan SQLite](#backend-php-dan-sqlite)
- [Perilaku Kalkulasi](#perilaku-kalkulasi)
- [Komponen React](#komponen-react)
  - [Component Tree](#component-tree)
  - [Deskripsi Komponen](#deskripsi-komponen)
  - [Alur Props dan State](#alur-props-dan-state)
- [Cara Menjalankan](#cara-menjalankan)
- [Riwayat Branch](#riwayat-branch)

## Tentang Project

Shipping Rate Calculator Anteraja dirancang untuk membantu pelaku UMKM menghitung ongkos kirim berdasarkan berat fisik, volume paket, dan harga barang. Aplikasi ini juga menyediakan rekomendasi layanan pengiriman yang paling efisien dari sisi biaya, sehingga penjual dapat mengambil keputusan yang tepat sebelum mengirim barang.

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Cek Tarif & Estimasi** | Form input kota asal/tujuan, berat, dimensi, dan harga produk dengan validasi real-time |
| **Kalkulasi Berat Volume** | Menghitung berat volumetrik `(P×L×T/6000)` dan berat ditagih dengan pembulatan ke atas |
| **Berat Fisik Desimal** | Menerima titik atau koma desimal, maksimal dua angka pecahan sesuai `DECIMAL(6,2)` |
| **Format Angka Otomatis** | Input harga produk secara otomatis diformat dengan pemisah ribuan (contoh: `50.000`) |
| **Service Cards** | Harga tampil setelah kalkulasi; menandai rekomendasi BR-09, tarif termurah, SLA tercepat, dan layanan yang tidak tersedia |
| **Simulasi Margin** | Menghitung rasio ongkir terhadap harga produk dari hasil API; tanpa angka contoh sebelum kalkulasi |
| **Rekomendasi BR-09** | Memilih layanan dengan aturan bisnis dan menampilkan alasan dalam bahasa sederhana |
| **Perbandingan Layanan** | Tabel tarif, margin, dan SLA berdasarkan rute; layanan yang tidak tersedia ditampilkan sebagai `-` |
| **Toast Notification** | Feedback visual saat memilih layanan pengiriman |

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Bahasa | JavaScript (JSX) |
| Styling | Vanilla CSS (BEM methodology) |
| Linting | ESLint + eslint-plugin-react-hooks |
| Backend demo | PHP 8 dengan PDO |
| Database demo | SQLite (`api/anteraja.db`) |

## Struktur Folder

```
anteraja-capstone-Muhammad_Kevin/
├── api/                         # Endpoint kalkulasi dan setup database SQLite
│   ├── calculate.php
│   ├── RecommendationEngine.php # Mesin rekomendasi BR-09 berbasis class
│   ├── setup_db.php
│   └── test_recommendation_engine.php # Uji aturan rekomendasi PHP
├── docs/                        # Dokumentasi project (PRD, FRD, Design System)
│   ├── prd-shipping-rate-calculator.md
│   ├── DESIGN.md
│   ├── dokumentasi-kesesuaian-ui-frd.md
│   ├── frd/
│   └── data/                     # schema.sql, seeder.sql, dan dataset demo
│       └── shipping_rate_calculator_dummy_dataset.csv
├── public/                      # Aset statis (favicon, icons)
├── src/
│   ├── assets/                  # Gambar dan logo
│   ├── context/                 # Centralized state via Context API
│   │   └── ShipmentContext.jsx
│   ├── data/
│   │   └── serviceCatalog.js    # Data layanan pengiriman & filter tabs
│   ├── features/                # Komponen fitur (feature-based structure)
│   │   ├── shipping-form/
│   │   │   └── components/
│   │   │       └── ShippingForm.jsx
│   │   ├── margin-calculator/
│   │   │   └── components/
│   │   │       └── MarginCalculator.jsx
│   │   ├── recommendation-engine/
│   │   │   └── components/
│   │   │       ├── RecommendationEngine.jsx
│   │   │       └── RecommendationModal.jsx
│   │   └── service-comparison/
│   │       └── components/
│   │           └── ServiceComparison.jsx
│   ├── hooks/                   # Custom hooks untuk async data fetching
│   │   ├── useLocationData.js
│   │   ├── useShippingCalculation.js
│   │   └── usePostalSearch.js
│   ├── prototype/               # Prototype HTML/CSS/JS statis (tahap sebelumnya)
│   │   ├── anteraja-cek-ongkir-ramah-umkm-statis.html
│   │   ├── anteraja-cek-ongkir-ramah-umkm-statis.css
│   │   ├── anteraja-recommendation-section-statis.html
│   │   ├── js/app.js
│   │   └── DOKUMENTASI-INTERAKSI-JS.md
│   ├── shared/
│   │   └── utils/
│   │       └── numberFormat.js  # Utility: parseNumber(), formatRibuan()
│   ├── App.jsx                  # Root component + provider orchestration
│   ├── App.css                  # Stylesheet utama
│   ├── index.css                # Global/reset styles
│   └── main.jsx                 # Entry point React
├── index.html                   # HTML shell untuk Vite
├── package.json
├── vite.config.js
└── eslint.config.js
```

## Arsitektur Custom Hooks & Context API

Project ini kini diorganisasi berdasarkan pemisahan concern agar data fetching dan state global tidak bercampur dengan logika UI:

- `useLocationData` mengambil data wilayah Indonesia dari satu API publik `emsifa` melalui `fetch`, memuat daftar provinsi serta kota sesuai provinsi yang dipilih, dan mengelola status `isLoading`, `isError`, serta `errorMessage`.
- `useShippingCalculation` mengirim input pengiriman ke `POST /api/calculate.php` dan mengelola hasil tarif serta error kalkulasi. Vite meneruskan `/api` ke server PHP pada port `8080`.
- `ShipmentContext` menggunakan `createContext` dan `useContext` untuk menampung state utama seperti asal, tujuan, berat, dimensi, harga produk, filter layanan, dan status submit. Dengan pola ini, komponen dapat membaca dan memperbarui state tanpa `prop drilling`.
- `App` memetakan opsi dari API ke empat slot layanan pada UI. Sebelum kalkulasi, kartu tidak menampilkan harga; setelah kalkulasi, opsi yang tidak tersedia ditandai sebagai tidak tersedia.

## Riwayat Branch

| Branch | Deskripsi |
|--------|-----------|
| `main` | Branch utama |
| `5-ui` | Desain UI dan mockup |
| `6-db` | Skema database |
| `6-prototype` | Prototype statis (HTML/CSS) |
| `7-prototype` | Prototype interaktif (JavaScript) |
| `8-react` | Integrasi React, custom hooks, async fetching, dan Context API |

## Komponen React

### Component Tree

Berikut adalah hierarki komponen React yang digunakan dalam aplikasi:

```
App                                    ← Root component, mengelola seluruh state
├── <header>                           ← Header statis (logo, navigasi, login)
├── <main>
│   ├── ShippingForm                   ← Form input pengiriman + validasi
│   ├── MarginCalculator               ← Simulasi margin dari hasil API
│   ├── RecommendationEngine           ← Kartu layanan, badge harga/SLA, rekomendasi BR-09
│   │   └── RecommendationModal        ← Modal popup rekomendasi hemat
│   └── ServiceComparison              ← Tabel tarif, margin, dan SLA per rute
├── <footer>                           ← Footer statis (kontak, navigasi, sosmed)
└── Toast Notification                 ← Conditional: muncul saat layanan dipilih
```

### Deskripsi Komponen

| Komponen | Tipe | File | Deskripsi |
|----------|------|------|-----------|
| **App** | Stateful | `src/App.jsx` | Root component yang mengelola seluruh state aplikasi dan meneruskan data ke child components via props |
| **ShippingForm** | Stateless (Controlled) | `src/features/shipping-form/components/ShippingForm.jsx` | Form input kota asal/tujuan, berat, dimensi, dan harga. Semua input dikontrol lewat props dari App |
| **MarginCalculator** | Stateful | `src/features/margin-calculator/components/MarginCalculator.jsx` | Menampilkan ringkasan dan tips berbasis hasil kalkulasi; accordion tertutup secara default |
| **RecommendationEngine** | Stateful (Local) | `src/features/recommendation-engine/components/RecommendationEngine.jsx` | Menampilkan kartu layanan dan rekomendasi BR-09. Memiliki local state `isModalOpen` |
| **RecommendationModal** | Stateful | `src/features/recommendation-engine/components/RecommendationModal.jsx` | Menampilkan alasan dan perbandingan harga/SLA terhadap layanan pembanding yang relevan |
| **ServiceComparison** | Stateless (API-driven) | `src/features/service-comparison/components/ServiceComparison.jsx` | Membandingkan tarif, rasio ongkir, ketersediaan, dan SLA; penanda termurah/tercepat mengikuti hasil API |

### Alur Props dan State

#### State yang Dikelola di `App`

Seluruh state utama dikelola secara terpusat di komponen `App` mengikuti pola **Unidirectional Data Flow** (data mengalir satu arah dari parent ke child):

| State | Tipe Data | Nilai Awal | Kegunaan |
|-------|-----------|------------|----------|
| `origin` | `string` | `''` | Kota asal pengiriman |
| `destination` | `string` | `''` | Kota tujuan pengiriman |
| `weight` | `string` | `'5'` | Berat fisik paket (kg) |
| `dimensions` | `object` | `{ panjang: '30', lebar: '20', tinggi: '20' }` | Dimensi paket (cm) |
| `price` | `string` | `'50.000'` | Harga produk (Rupiah, terformat) |
| `activeFilter` | `string` | `'all'` | Tab filter layanan yang aktif |
| `selectedService` | `string` | `''` | Tidak ada layanan yang aktif sebelum dipilih user |
| `toast` | `object \| null` | `null` | Data toast notification (name, price, eta) |
| `submitMessage` | `string` | `''` | Pesan sukses setelah submit form |
| `errors` | `object` | `{}` | Kumpulan pesan error validasi per field |
| `isSubmitting` | `boolean` | `false` | Status loading saat proses submit |

Selain state, `App` juga menggunakan:
- **`useMemo`** untuk `volumeSummary` — menghitung berat volumetrik hanya ketika `dimensions` atau `weight` berubah
- **`useRef`** untuk `servicesGridRef` — referensi DOM untuk scroll otomatis ke hasil layanan

#### State Lokal di `RecommendationEngine`

| State | Tipe Data | Nilai Awal | Kegunaan |
|-------|-----------|------------|----------|
| `isModalOpen` | `boolean` | `false` | Mengontrol visibilitas RecommendationModal |

#### Diagram Alur Props

```
┌─────────────────────────────────────────────────────────────────────┐
│                            App (State Owner)                        │
│                                                                     │
│  State: origin, destination, weight, dimensions, price,             │
│         activeFilter, selectedService, toast, submitMessage,        │
│         errors, isSubmitting                                        │
│  Derived: volumeSummary (useMemo), visibleServices (filter)         │
└──────┬──────────────┬─────────────────┬────────────────┬────────────┘
       │              │                 │                │
       ▼              ▼                 ▼                ▼
 ┌───────────┐ ┌──────────────┐ ┌──────────────────┐ ┌──────────────┐
 │ShippingForm│ │MarginCalc.   │ │RecommendationEng.│ │ServiceComp.  │
 │            │ │(tanpa props) │ │                  │ │(tanpa props) │
 │ Props:     │ └──────────────┘ │ Props:           │ └──────────────┘
 │ • origin   │                  │ • filterTabs     │
 │ • dest.    │                  │ • activeFilter   │
 │ • weight   │                  │ • setActiveFilter │
 │ • dimens.  │                  │ • visibleServices│
 │ • price    │                  │ • selectedService│
 │ • errors   │                  │ • onSelectService│
 │ • volumeS. │                  │                  │
 │ • submitM. │                  │ Local State:     │
 │ • isSubm.  │                  │ • isModalOpen    │
 │            │                  │        │         │
 │ Callbacks: │                  │        ▼         │
 │ • onChange │                  │ ┌──────────────┐ │
 │ • onBlur   │                  │ │Recomm.Modal  │ │
 │ • onSubmit │                  │ │              │ │
 └───────────┘                  │ │ Props:       │ │
                                 │ │ • isOpen     │ │
       ▲ Events naik ke App      │ │ • onClose    │ │
       │ via callback props      │ │ • onSelectS. │ │
       │                         │ │ • recomm.S.  │ │
       │  contoh:                │ │ • isSelected │ │
       │  onWeightChange(e)      │ └──────────────┘ │
       │  → setWeight(raw)       └──────────────────┘
       │
       │  onSelectService(svc)
       │  → setSelectedService(svc.id)
       │  → setToast({...})
```

#### Pola Update State (Immutable)

Semua update state dilakukan secara **immutable** (tanpa mutasi langsung):

```jsx
// ✅ Spread operator untuk update objek
setDimensions((current) => ({ ...current, [field]: raw }))

// ✅ Functional updater untuk update berdasarkan state sebelumnya
setErrors((current) => {
  const next = { ...current }
  if (message) next[field] = message
  else delete next[field]
  return next
})

// ✅ Replace penuh untuk tipe primitif
setWeight(raw)
setActiveFilter(tab.filter)
setSelectedService(service.id)
```

### Shared Utilities

| Fungsi | File | Deskripsi |
|--------|------|-----------|
| `parseNumber(value)` | `src/shared/utils/numberFormat.js` | Mengubah string berformat Indonesia (`50.000`) menjadi angka JavaScript (`50000`) |
| `formatRibuan(value)` | `src/shared/utils/numberFormat.js` | Memformat angka menjadi string dengan pemisah ribuan Indonesia (`50.000`) |

### Data Layer

| Ekspor | File | Deskripsi |
|--------|------|-----------|
| `services` | `src/data/serviceCatalog.js` | Katalog dasar untuk empat jenis kartu layanan; harga aktual berasal dari API, bukan harga fallback katalog |
| `filterTabs` | `src/data/serviceCatalog.js` | Konfigurasi lama untuk filter; rekomendasi saat ini ditentukan BR-09, bukan tab rekomendasi |

## Backend PHP dan SQLite

Backend demo menerima input JSON melalui `POST /api/calculate.php`, menghitung berat volumetrik dan berat ditagih, mengambil tarif aktif untuk rute dari SQLite, menghitung tarif total dan rasio ongkir, mengevaluasi rekomendasi BR-09, lalu menyimpan shipment dan opsi layanan. Frontend memakai Vite proxy ke `http://localhost:8080`.

Logika BR-09 berada di `api/RecommendationEngine.php`. Class `RecommendationEngine` menyimpan ambang aturan melalui properti dan constructor; method `pilih($options, $beratDitagih, $hargaJual)` mengembalikan layanan rekomendasi, kode aturan, dan alasan, atau `null` jika tidak ada pilihan yang sesuai. Loop mencari layanan termurah untuk menyusun alasan, sementara `continue` melewati opsi berisiko merah saat memeriksa apakah semua layanan berisiko merah. Prioritas keputusan BR-09 tetap Reguler, Ekonomi, Next Day, lalu default Reguler.

Jalankan uji aturan rekomendasi tanpa menginisialisasi atau menghapus database:

```powershell
php api/test_recommendation_engine.php
```

Jalankan frontend dan PHP di dua terminal dari root project:

```powershell
# Terminal 1: server PHP untuk endpoint API
php -S localhost:8080 -t .

# Terminal 2: frontend Vite
npm run dev
```

Untuk inisialisasi pertama saja, jalankan `php api/setup_db.php`. **Perhatian:** script ini menghapus dan membuat ulang `api/anteraja.db`, termasuk menghapus riwayat kalkulasi lokal. Jangan jalankan ulang jika ingin mempertahankan data; database yang sudah ada diperbarui dengan SQL secara terpisah.

Schema dan data demo berada di `docs/data/schema.sql` dan `docs/data/seeder.sql`. Seed mencakup seluruh empat layanan untuk rute Bandung–Surabaya dan Jakarta–Surabaya; rute demo lain dapat memiliki cakupan layanan yang lebih sedikit.

## Perilaku Kalkulasi

- Berat fisik menerima titik atau koma desimal sampai dua angka pecahan. Berat volumetrik adalah `(P × L × T) / 6000`; berat ditagih adalah nilai terbesar yang dibulatkan ke atas per 1 kg.
- Tarif per layanan dihitung dari tarif per kg dikali berat ditagih. Margin menggunakan `(tarif ongkir / harga jual) × 100%`, dengan ambang hijau `≤15%`, kuning `>15% sampai 30%`, dan merah `>30%`.
- Rekomendasi mengikuti urutan BR-09: Reguler jika marginnya `≤30%` dan delta harga `≤Rp10.000`; jika tidak, Ekonomi jika semua opsi berisiko merah atau berat ditagih `>5 kg`; jika tidak, Next Day jika harga produk `>Rp1.000.000` dan marginnya `≤10%`; selain itu Reguler sebagai default. Aturan hanya memilih layanan yang tersedia untuk rute.
- Kartu menampilkan rekomendasi BR-09, tarif termurah, dan SLA tercepat sebagai penanda terpisah. Popup membandingkan rekomendasi Reguler dengan opsi termurah lain; rekomendasi selain Reguler dibandingkan dengan Reguler jika tersedia.
- Tabel perbandingan dan simulasi margin menggunakan hasil API. Sebelum kalkulasi tidak ada angka rute contoh yang ditampilkan; layanan yang tidak tersedia ditandai `-`.
- Batas waktu pickup dan dukungan COD pada tabel masih berupa informasi demo statis karena belum tersedia pada schema tarif/API.

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Jalankan linting
npm run lint

# Uji mesin rekomendasi PHP
php api/test_recommendation_engine.php
```

## Riwayat Branch

| Branch | Deskripsi |
|--------|-----------|
| `main` | Branch utama |
| `5-ui` | Desain UI dan mockup |
| `6-db` | Skema database |
| `6-prototype` | Prototype statis (HTML/CSS) |
| `7-prototype` | Prototype interaktif (JavaScript) |
| `8-react` | Migrasi ke komponen React (branch ini) |
