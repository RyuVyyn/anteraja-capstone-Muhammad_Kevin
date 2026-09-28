# Anteraja Capstone Project

Repository ini merupakan capstone project untuk program Anteraja NextGen AI Academy. Fokus utama dari pengembangan ini adalah membangun fitur **Shipping Rate Calculator** — sebuah kalkulator ongkos kirim yang memungkinkan pengguna (khususnya pelaku UMKM) untuk melihat tarif pengiriman paket secara akurat, membandingkan layanan, dan mendapatkan rekomendasi pengiriman paling hemat.

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
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
| **Kalkulasi Berat Volume** | Otomatis menghitung berat volumetrik `(P×L×T/6000)` dan memilih berat terbesar |
| **Format Angka Otomatis** | Input harga produk secara otomatis diformat dengan pemisah ribuan (contoh: `50.000`) |
| **Filter Layanan** | Tabs filter: Semua Layanan, Paling Hemat, Paling Cepat, Saran Terbaik |
| **Service Cards** | Kartu layanan interaktif dengan status terpilih, disabled, dan badge porsi ongkir |
| **Simulasi Margin** | Menampilkan pengaruh ongkir terhadap harga jual produk beserta saran bisnis |
| **Rekomendasi Hemat** | Modal popup dengan analisis kenapa layanan tertentu paling cocok |
| **Perbandingan Layanan** | Tabel perbandingan lengkap (tarif, estimasi, batas jemput, COD) |
| **Toast Notification** | Feedback visual saat memilih layanan pengiriman |

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Bahasa | JavaScript (JSX) |
| Styling | Vanilla CSS (BEM methodology) |
| Linting | ESLint + eslint-plugin-react-hooks |

## Struktur Folder

```
anteraja-capstone-Muhammad_Kevin/
├── docs/                        # Dokumentasi project (PRD, FRD, Design System)
│   ├── prd-shipping-rate-calculator.md
│   ├── DESIGN.md
│   ├── dokumentasi-kesesuaian-ui-frd.md
│   ├── frd/
│   ├── data/
│   └── ui/
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
- `ShipmentContext` menggunakan `createContext` dan `useContext` untuk menampung state utama seperti asal, tujuan, berat, dimensi, harga produk, filter layanan, dan status submit. Dengan pola ini, komponen dapat membaca dan memperbarui state tanpa `prop drilling`.
- `App` bertindak sebagai orchestrator: ia memanggil custom hook wilayah, memetakan data API ke form suggestion, dan menjaga state kalkulasi bisnis tetap konsisten dengan PRD/FRD yang sudah dibuat.

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
│   ├── MarginCalculator               ← Simulasi pengaruh ongkir (statis)
│   ├── RecommendationEngine           ← Filter tabs + service cards grid
│   │   └── RecommendationModal        ← Modal popup rekomendasi hemat
│   └── ServiceComparison              ← Tabel perbandingan layanan (statis)
├── <footer>                           ← Footer statis (kontak, navigasi, sosmed)
└── Toast Notification                 ← Conditional: muncul saat layanan dipilih
```

### Deskripsi Komponen

| Komponen | Tipe | File | Deskripsi |
|----------|------|------|-----------|
| **App** | Stateful | `src/App.jsx` | Root component yang mengelola seluruh state aplikasi dan meneruskan data ke child components via props |
| **ShippingForm** | Stateless (Controlled) | `src/features/shipping-form/components/ShippingForm.jsx` | Form input kota asal/tujuan, berat, dimensi, dan harga. Semua input dikontrol lewat props dari App |
| **MarginCalculator** | Stateless (Static) | `src/features/margin-calculator/components/MarginCalculator.jsx` | Menampilkan simulasi pengaruh ongkir terhadap margin usaha. Saat ini menggunakan data statis |
| **RecommendationEngine** | Stateful (Local) | `src/features/recommendation-engine/components/RecommendationEngine.jsx` | Menampilkan filter tabs dan grid kartu layanan. Memiliki local state `isModalOpen` untuk kontrol modal |
| **RecommendationModal** | Stateless (Controlled) | `src/features/recommendation-engine/components/RecommendationModal.jsx` | Modal popup yang menampilkan detail rekomendasi layanan terbaik. Menggunakan `useEffect` untuk keyboard event dan scroll lock |
| **ServiceComparison** | Stateless (Static) | `src/features/service-comparison/components/ServiceComparison.jsx` | Tabel perbandingan spesifikasi semua layanan Anteraja |

### Alur Props dan State

#### State yang Dikelola di `App`

Seluruh state utama dikelola secara terpusat di komponen `App` mengikuti pola **Unidirectional Data Flow** (data mengalir satu arah dari parent ke child):

| State | Tipe Data | Nilai Awal | Kegunaan |
|-------|-----------|------------|----------|
| `origin` | `string` | `'Bandung (Coblong, 40132)'` | Kota asal pengiriman |
| `destination` | `string` | `'Surabaya (Gubeng, 60281)'` | Kota tujuan pengiriman |
| `weight` | `string` | `'5'` | Berat fisik paket (kg) |
| `dimensions` | `object` | `{ panjang: '30', lebar: '20', tinggi: '20' }` | Dimensi paket (cm) |
| `price` | `string` | `'50.000'` | Harga produk (Rupiah, terformat) |
| `activeFilter` | `string` | `'all'` | Tab filter layanan yang aktif |
| `selectedService` | `string` | `'ekonomi'` | ID layanan yang dipilih user |
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
| `services` | `src/data/serviceCatalog.js` | Array berisi 4 objek layanan (Ekonomi, Reguler, Next Day, Same Day) dengan properti `id`, `tags`, `name`, `price`, `eta`, `tones`, dll |
| `filterTabs` | `src/data/serviceCatalog.js` | Array berisi 4 objek tab filter (`all`, `cheapest`, `fastest`, `recommended`) |

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
