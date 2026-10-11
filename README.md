# Anteraja Capstone Project

Repository ini merupakan capstone project untuk program Anteraja NextGen AI Academy. Fokus utama dari pengembangan ini adalah membangun fitur **Shipping Rate Calculator** — sebuah kalkulator ongkos kirim yang memungkinkan pengguna (khususnya pelaku UMKM) untuk melihat tarif pengiriman paket secara akurat, membandingkan layanan, dan mendapatkan rekomendasi pengiriman paling hemat.

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Arsitektur Custom Hooks & Context API](#arsitektur-custom-hooks--context-api)
- [Komponen React](#komponen-react)
  - [Component Tree](#component-tree)
  - [Deskripsi Komponen](#deskripsi-komponen)
  - [Alur Props dan State](#alur-props-dan-state)
- [Backend Laravel dan PostgreSQL](#backend-laravel-dan-postgresql)
- [Optimasi Performa API & Redis Caching](#optimasi-performa-api--redis-caching)
- [Eloquent, Async Logging, & API Riwayat Simulasi](#eloquent-async-logging--api-riwayat-simulasi)
- [Perilaku Kalkulasi](#perilaku-kalkulasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Panduan Pengujian & UAT (TESTING.md)](TESTING.md)
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
| Backend | Laravel 13 (PHP 8.3+) |
| Database | PostgreSQL (termasuk Supabase Database) |
| In-Memory Cache | Redis via Predis (`predis/predis`) |

## Struktur Folder

```
anteraja-capstone-Muhammad_Kevin/
├── backend/                     # API Laravel, migrations, seeders, dan tests
├── api/                         # Implementasi PHP lama untuk pembanding
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
- `useShippingCalculation` mengirim input pengiriman ke `POST /api/calculate.php` dan mengelola hasil tarif serta error kalkulasi. Vite meneruskan `/api` ke server Laravel pada port `8000`.
- `ShipmentContext` menggunakan `createContext` dan `useContext` untuk menampung state utama seperti asal, tujuan, berat, dimensi, harga produk, filter layanan, dan status submit. Dengan pola ini, komponen dapat membaca dan memperbarui state tanpa `prop drilling`.
- `App` memetakan opsi dari API ke empat slot layanan pada UI. Sebelum kalkulasi, kartu tidak menampilkan harga; setelah kalkulasi, opsi yang tidak tersedia ditandai sebagai tidak tersedia.

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

## Backend Laravel dan PostgreSQL

API aktif berada di `backend/`. Endpoint `POST /api/calculate.php` mempertahankan payload dan response JSON yang digunakan React. Laravel menerjemahkan label kota/provinsi dari form menjadi foreign key lokasi menggunakan **Eloquent Model** (`ShippingRate`, `ShippingService`, `Location`, `Shipment`, `ShipmentOption`), menghitung berat, tarif, dan margin, menjalankan aturan BR-09, lalu **menyimpan riwayat secara asinkron** setelah response JSON terkirim menggunakan `dispatch()->afterResponse()`.

Laravel 13 memerlukan PHP 8.3 atau lebih baru dan Composer 2. Aktifkan ekstensi `pdo_pgsql` pada runtime PHP yang digunakan. Isi koneksi PostgreSQL di `backend/.env`; untuk Supabase gunakan detail koneksi database project dan jangan commit kredensial.

Inisialisasi database PostgreSQL baru dari folder `backend/`:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
composer install
php artisan key:generate
php artisan migrate --seed
```

Jalankan backend dan frontend di dua terminal:

```powershell
# Terminal 1, dari backend/
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2, dari root repository
npm run dev
```

Migrations Laravel adalah sumber kebenaran skema. `docs/data/schema.sql`, `docs/data/seeder.sql`, dan `docs/data/erd.md` adalah referensi PostgreSQL. `api/` berisi implementasi PHP lama untuk pembanding; jangan jalankan `api/setup_db.php`, karena script itu menghapus database SQLite lama.

## Optimasi Performa API & Redis Caching

Pada dua commit (`09eddb8` dan `24f8fe0`), dilakukan restrukturisasi arsitektur data dan implementasi caching in-memory menggunakan **Redis** untuk mengatasi bottleneck latensi pada endpoint kalkulasi pengiriman (`POST /api/calculate.php`).

### 1. Analisis Masalah & Baseline Benchmark (Sebelum Optimasi)

Sebelum optimasi, pengujian benchmark 5 pemanggilan sekuensial menghasilkan waktu respons rata-rata **3.705 ms (~3,7 detik)** (Min: 1.485 ms, Max: 5.639 ms).

**Penyebab Utama Latensi (Root Causes):**
1. **LocationResolver Full Table Scan**: Setiap pencarian `kota_asal` dan `kota_tujuan` mengeksekusi query database PostgreSQL remote (Supabase `ap-southeast-1`) secara sekuensial tanpa caching.
2. **Uncached Rates Query**: Query relasional dengan `JOIN` antara tabel `shipping_rates` dan `shipping_services` dieksekusi ulang ke Supabase pada setiap kalkulasi, meskipun data tarif rute bersifat statis.
3. **N+1 Remote Network Round-Trips (Insert Transaksi)**: Opsi layanan (`shipment_options`) disimpan melalui loop `insert()` satu per satu di dalam transaksi database. Karena server database berlokasi di region Singapura (`ap-southeast-1`), akumulasi round-trip latency jaringan menyebabkan waktu eksekusi membengkak.

---

### 2. Implementasi Optimasi (Commit `09eddb8` & `24f8fe0`)

#### A. Integrasi Redis Caching (`predis/predis`)
- Menambahkan dependensi `predis/predis: ^3.6` pada Laravel untuk koneksi Redis tanpa ketergantungan ekstensi PHP C-extension (`ext-redis`).
- Mengarahkan cache store aplikasi ke Redis pada `backend/.env`:
  ```env
  CACHE_STORE=redis
  REDIS_CLIENT=predis
  REDIS_HOST=127.0.0.1
  REDIS_PORT=6379
  ```

#### B. Batching & Master Location Caching (`LocationResolver.php`)
- **Batch Resolution**: Mengubah pemanggilan individual menjadi batch lookup: `resolveMany([$kotaAsal, $kotaTujuan])` untuk mengeliminasi pemanggilan fungsi ganda.
- **Master Data Caching (`locations:all`)**: Seluruh master data lokasi di-cache ke dalam Redis dengan durasi TTL 24 jam (`86.400 detik`). Pencarian dan filter lokasi dilakukan di memori via Laravel Collection tanpa menyentuh database remote.
- **Normalisasi Alias Kota**: Menambahkan penanganan prefix variasi nama kota (seperti `KOTA`, `KABUPATEN`, `KOTA ADM`, `KOTA ADMINISTRASI`) agar input dari form dapat dicocokkan secara akurat.

#### C. Route-Based Rates Caching (`ShippingCalculationController.php`)
- Menyimpan hasil query tarif pengiriman ke dalam Redis dengan composite cache key format `rates:{origin_id}:{destination_id}` berdurasi TTL 1 jam (`3.600 detik`).
- Request kalkulasi dengan pasangan rute yang sama langsung disajikan dari memori Redis, memotong waktu eksekusi query SQL remote ke Supabase.

#### D. Batch Insert Optimization (`shipment_options`)
- Menggantikan per-item `insert()` loop dengan **1x bulk insert** (`DB::table('shipment_options')->insert($shipmentOptions)`) di dalam database transaction, memangkas overhead RTT jaringan ke Supabase secara signifikan.

#### E. Perbaikan Bug Serialisasi Driver Redis (`24f8fe0`)
- Menyelesaikan kendala deserialisasi objek bawaan `stdClass` (`__PHP_Incomplete_Class`) pada driver Predis. Data hasil query dikonversi menjadi associative array murni sebelum disimpan ke Redis (`->map(fn (object $row): array => (array) $row)->all()`), lalu di-cast kembali menjadi `object` saat diambil dari cache. Hal ini menjamin reliabilitas 100% pada seluruh pemanggilan cache hit.

#### F. Automated Testing
- Menambahkan unit/feature test `test_it_resolves_city_aliases_without_province_labels` pada `backend/tests/Feature/ShippingCalculationTest.php` untuk memastikan pencocokan alias nama kota tanpa label provinsi tetap valid dan konsisten.

---

### 3. Hasil Benchmark & Evaluasi Performa

| Metrik Pengujian | Sebelum Optimasi (Baseline) | Sesudah Optimasi (Warm Cache) | Peningkatan / Dampak |
|---|---|---|---|
| **Response Time Rata-rata** | **3.705 ms** (~3,7 detik) | **~560 ms** | **Turun ~85% (6.6x lebih cepat)** |
| **Response Time Minimum** | 1.485 ms | ~530 ms | Peningkatan responsivitas form |
| **Response Time Maksimum** | 5.639 ms | ~610 ms | Menghilangkan lonjakan latensi |
| **Success Rate (5x Run)** | 1/5 (sebelum fix deserialisasi) | **5/5 (100% 200 OK)** | Stabil tanpa error `__PHP_Incomplete_Class` |
| **Database Queries (Hit)** | Multiple SELECT + Loop INSERT | **0 SELECT (cached)** + 1 bulk INSERT | Mengurangi beban koneksi Supabase |

> [!NOTE]
> Latensi pada warm hit sebelumnya (~500–560 ms) didominasi oleh transaksi penulisan riwayat ke Supabase. Masalah ini telah diatasi dengan `dispatch()->afterResponse()` — response JSON dikirim ke React **terlebih dahulu**, lalu INSERT berjalan setelahnya di proses PHP yang sama. Lihat bagian [Eloquent, Async Logging, & API Riwayat Simulasi](#eloquent-async-logging--api-riwayat-simulasi) untuk detail.


## Eloquent, Async Logging, & API Riwayat Simulasi

### 1. Migrasi ke Eloquent ORM

Seluruh akses data pada `ShippingCalculationController` direfaktor dari `DB::table()` (Query Builder) ke **Eloquent Model** dengan relasi:

| Model | Tabel | Relasi |
|---|---|---|
| `Location` | `locations` | — |
| `ShippingService` | `shipping_services` | `hasMany(ShippingRate)` |
| `ShippingRate` | `shipping_rates` | `belongsTo(ShippingService)`, `belongsTo(Location)` × 2 |
| `Shipment` | `shipments` | `hasMany(ShipmentOption)`, `belongsTo(Location)` × 2 |
| `ShipmentOption` | `shipment_options` | `belongsTo(Shipment)`, `belongsTo(ShippingService)` |

Query tarif kini menggunakan **Eager Loading** (`ShippingRate::with('service')`) untuk menghindari N+1 query.

### 2. Invalidasi Cache Otomatis (`ShippingRateObserver`)

`ShippingRateObserver` terdaftar di `AppServiceProvider::boot()`. Setiap kali data tarif di-create, update, atau delete melalui Eloquent, cache Redis rute terkait (`rates:{asal_id}:{tujuan_id}`) secara otomatis dihapus via `Cache::forget()`, memastikan kalkulasi berikutnya mengambil data fresh.

### 3. Pencatatan Riwayat Asinkron (`afterResponse`)

Penyimpanan riwayat simulasi (`shipments` + `shipment_options`) kini dijalankan **setelah response JSON terkirim** ke React menggunakan:

```php
dispatch(function () use ($catat, $shipmentOptions): void {
    DB::transaction(function () use ($catat, $shipmentOptions): void {
        Shipment::create($catat);
        if ($shipmentOptions !== []) {
            ShipmentOption::insert($shipmentOptions);
        }
    });
})->afterResponse();
```

Penjual tidak perlu menunggu proses INSERT ke Supabase — response langsung dikembalikan. Kegagalan INSERT di-log tanpa mengganggu user.

### 4. Endpoint API Riwayat Simulasi

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/simulasi/tabel` | Riwayat simulasi berhalaman (server-side pagination) |
| `GET` | `/api/simulasi/agregat` | Rata-rata margin per layanan (`selectRaw` + `groupBy`) |

**`GET /api/simulasi/tabel`** — Query parameter:

| Parameter | Contoh | Deskripsi |
|---|---|---|
| `dari` | `2026-10-01` | Filter mulai tanggal (inclusive) |
| `sampai` | `2026-10-31` | Filter sampai tanggal (inclusive) |
| `layanan` | `SRV_EKO` | Filter berdasarkan service_id yang recommended |
| `per_page` | `15` | Jumlah item per halaman (maks 100) |

Response menggunakan format pagination Laravel (`data`, `current_page`, `per_page`, `total`, `last_page`, dll.) dan menyertakan Eager Loading relasi `options.service`, `kotaAsal`, dan `kotaTujuan`.

**`GET /api/simulasi/agregat`** — Mengembalikan rata-rata `persentase_ongkir` per layanan yang dikelompokkan dengan `groupBy('service_id')`, diurutkan dari margin terendah.

---

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

# Uji backend Laravel
Push-Location backend
php artisan test
Pop-Location

# Bersihkan cache Redis / Laravel jika diperlukan
Push-Location backend
php artisan cache:clear
Pop-Location
```

> [!TIP]
> Untuk panduan langkah demi langkah menjalankan server di lingkungan **Lokal (Localhost)** dan **Supabase (Remote Cloud)**, panduan automated test, serta skenario lengkap **User Acceptance Testing (UAT)**, silakan merujuk ke dokumen [TESTING.md](TESTING.md).

## Riwayat Branch

| Branch | Deskripsi |
|--------|-----------|
| `main` | Branch utama |
| `5-ui` | Desain UI dan mockup |
| `6-db` | Skema database |
| `6-prototype` | Prototype statis (HTML/CSS) |
| `7-prototype` | Prototype interaktif (JavaScript) |
| `8-react` | Migrasi ke komponen React |
| `laravel` | Migrasi ke Laravel, Redis caching, Eloquent, async logging (branch ini) |