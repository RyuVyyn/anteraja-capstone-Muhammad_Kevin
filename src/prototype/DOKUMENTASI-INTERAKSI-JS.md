# Dokumentasi Implementasi 5 Interaksi JavaScript Murni (Vanilla JS)
## Kalkulator Cek Tarif & Estimasi Pengiriman Anteraja (Ramah UMKM)

## 1. Arsitektur & Struktur Direktori

Seluruh logika JavaScript dibangun tanpa dependensi eksternal (murni tanpa jQuery atau library lain). Kode dipecah menjadi tiga modul independen di dalam direktori `src/prototype/js/` untuk memastikan prinsip *Separation of Concerns* dan kemudahan migrasi ke React:

```
src/
└── prototype/
    ├── anteraja-cek-ongkir-ramah-umkm-statis.html   # Halaman utama kalkulator & hasil ongkir
    ├── anteraja-cek-ongkir-ramah-umkm-statis.css    # Styling utama + utilitas class JS
    ├── anteraja-recommendation-section-statis.html  # Halaman rekomendasi terpisah
    ├── DOKUMENTASI-INTERAKSI-JS.md                  # Dokumentasi teknis terpisah ini
    └── js/
        ├── constants.js   # Konstanta nilai tetap, teks UI, mapping filter, durasi
        ├── utils.js       # Pure functions (parsing angka, format ribuan, validasi, volumetrik)
        └── app.js         # Entry point: DOM selectors, centralized state, event listeners
```

### Karakteristik Desain:
1. **Zero Global Scope Pollution**: Menggunakan modul standar ES (`<script type="module" src="js/app.js">`), semua variabel dan fungsi terisolasi di dalam modul.
2. **Pure Functions di `utils.js`**: Seluruh fungsi perhitungan dan manipulasi string tidak menyentuh DOM (`window` / `document`), sehingga dapat dites (*unit testable*) dan dipindahkan ke React utilitas tanpa perubahan.
3. **Single Source of Truth (`constants.js`)**: Angka pembagi volumetrik (`DIVISOR_VOLUMETRIK = 6000`), durasi simulasi loader (`DELAY_LOADER_MS = 800`), durasi feedback sukses submit (`DURASI_FEEDBACK_SUKSES_MS = 3000`), durasi auto-dismiss toast (`DURASI_TOAST_MS = 4000`), locale (`id-ID`), teks validasi, dan kategori filter didefinisikan secara terpusat.
4. **Centralized State (`state` di `app.js`)**: State aplikasi ditampung dalam objek terpusat yang memodelkan state yang nantinya menjadi `useState`/`useReducer` di React.

---

## 2. Rincian 5 Interaksi JavaScript

### Interaksi 1: Format Ribuan Otomatis & Validasi Input Numerik
* **Tujuan**: Membantu pengguna UMKM memasukkan nilai uang dan ukuran barang dengan format standar Indonesia (`10.000`), serta mencegah input kosong atau nilai tidak valid secara langsung.
* **Elemen Terkait**:
  - Input Harga Produk (`#priceInput`)
  - Input Berat Fisik (`#weightInput`)
  - Input Dimensi P x L x T (`#dimPanjang`, `#dimLebar`, `#dimTinggi`)
* **Mekanisme Kerja**:
  - **Saat Mengetik (`input` event)**: Fungsi `handleFormatInput` membaca nilai mentah, membersihkan titik pemisah dengan `parseAngka()`, memformat ulang dengan `formatRibuan()` (`toLocaleString('id-ID')`), dan menghitung *offset* posisi kursor sehingga pengetikan tidak meloncat ke akhir teks.
  - **Validasi Nilai**: Validasi memeriksa apakah field kosong (`WAJIB_DIISI`), bukan angka (`HARUS_ANGKA`), atau bernilai $\le 0$ (`HARUS_POSITIF`).
  - **Saat Kehilangan Fokus (`blur` event)**: `handleValidasiBlur` mengecek validitas field. Jika tidak valid, ditambahkan class `.input-error`, atribut `aria-invalid="true"`, dan pesan kesalahan teks kecil (`.input-error-msg`) tepat di bawah elemen input. Jika valid, error otomatis dibersihkan.
* **Commit**: `2eac420 feat: add automatic thousand separator formatting and input validation`

---

### Interaksi 2: Perhitungan Berat Volumetrik Real-time
* **Tujuan**: Menghitung secara dinamis berat volumetrik paket berdasarkan standar kargo logistik nasional:
  $$\text{Berat Volumetrik (kg)} = \frac{\text{Panjang (cm)} \times \text{Lebar (cm)} \times \text{Tinggi (cm)}}{6000}$$
  dan membandingkannya dengan berat aktual untuk menentukan berat tagihan (*chargeable weight*).
* **Elemen Terkait**:
  - Input dimensi: `#dimPanjang`, `#dimLebar`, `#dimTinggi`
  - Input berat: `#weightInput`
  - Kotak audit volumetrik: `.volume-summary` (`.vol-bold`, `.vol-normal`, `.vol-primary`)
* **Mekanisme Kerja**:
  - Event listener dipasang pada keempat input dimensi dan berat.
  - Fungsi murni `hitungBeratVolumetrik({ panjang, lebar, tinggi })` menghitung estimasi berat volume yang dibulatkan 2 desimal.
  - Fungsi `tentukanBeratDihitung({ beratAktual, beratVolumetrik })` mengambil nilai $\max(\text{beratAktual}, \text{beratVolumetrik})$ dan menandai apakah tarif mengikuti volume atau berat fisik.
  - DOM di `.volume-summary` langsung diperbarui secara instan dengan teks dinamis, misal: `Ukuran Volume: 2.0 kg • Berat Aktual: 0.5 kg • Berat Dihitung: 2.0 kg (mengikuti volume paket)`.
* **Commit**: `664ea7d feat: add real-time volumetric weight recalculation`

---

### Interaksi 3: Simulasi Loading, Scroll ke Hasil, & Feedback Form Hitung Ongkir
* **Tujuan**: Memberikan feedback responsif ketika form dikirim (*submit*), mensimulasikan pemrosesan kalkulasi tarif dengan animasi spinner, menggulir tampilan ke daftar layanan secara mulus, dan menampilkan feedback konfirmasi keberhasilan.
* **Elemen Terkait**:
  - Formulir pengiriman: `#shippingForm`
  - Tombol submit: `.btn-submit`
  - Kontainer hasil layanan: `.services-grid`
* **Mekanisme Kerja**:
  - Saat form di-*submit*, `event.preventDefault()` dipanggil untuk mencegah reload halaman bawaan browser.
  - Dicek apakah form sedang dalam status loading (`state.isSubmitting`). Jika ya, aksi submit diabaikan untuk mencegah *double submit*.
  - Melakukan validasi menyeluruh pada seluruh field numerik via `validasiSemuaInput()`. Jika ada input tidak valid, proses submit langsung diblokir dan fokus diarahkan ke field error pertama.
  - Jika validasi berhasil (jalur sukses), state diubah ke `isSubmitting = true`. Tombol submit diberi class `.btn-submit--loading`, atribut `disabled = true`, dan teks diganti dengan animasi spinner CSS `@keyframes spin` serta tulisan `"Menghitung..."`.
  - Menggunakan `setTimeout` dengan konstanta `DELAY_LOADER_MS = 800`, status loading dimatikan, tombol submit dipulihkan ke teks awal `"Hitung Ongkir"`, dan fungsi `scrollKeHasilLayanan(elements.servicesGrid)` memanggil `scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })`. Pengecekan `window.matchMedia('(prefers-reduced-motion: reduce)')` memastikan animasi scroll ramah aksesibilitas. Scroll ini hanya dijalankan pada jalur sukses.
  - Bersamaan dengan itu, muncul notifikasi sukses `.btn-submit__success` bertuliskan *"Tarif pengiriman berhasil diperbarui!"* yang otomatis hilang setelah durasi `DURASI_FEEDBACK_SUKSES_MS = 3000`.
* **Commit**: `0725369 feat: add submit button loading state and calculation feedback`

---

### Interaksi 4: Filter Kategori Layanan (Filter Tabs)
* **Tujuan**: Memungkinkan pelaku UMKM menyaring pilihan kurir berdasarkan kebutuhan toko (semua layanan, paling hemat ongkir, paling cepat sampai, atau saran rekomendasi terbaik).
* **Elemen Terkait**:
  - Kontainer tab: `.filter-tabs`
  - Tombol tab: `.filter-tab` (`data-filter="all"`, `"cheapest"`, `"fastest"`, `"recommended"`)
  - Kartu layanan: `.service-card` (`data-tags="cheapest,recommended"`, `"regular"`, `"fastest"`, dll)
* **Mekanisme Kerja**:
  - Setiap tab tombol memiliki event `click` yang memicu `handleFilterTab(filterKey, elements)`.
  - State tab aktif disimpan pada `state.activeFilter`.
  - Class visual tab diperbarui (`filter-tab--active` vs `filter-tab--inactive`), serta nilai aksesibilitas `aria-selected` diperbarui ke `true`/`false`.
  - Fungsi membaca `FILTER_MAP[filterKey]` dari `constants.js` dan mencocokkan atribut `data-tags` pada masing-masing `.service-card`. Kartu yang tidak sesuai kriteria diberi class CSS `.card-hidden` (`display: none !important`), sedangkan kartu yang sesuai ditampilkan.
* **Commit**: `19d78c4 feat: add service category filtering tabs`

---

### Interaksi 5: Pemilihan Kartu Layanan Interaktif & Floating Toast Summary
* **Tujuan**: Memberikan pengalaman memilih layanan yang intuitif, visual feedback yang jelas pada kartu yang dipilih, dan notifikasi mengambang (*floating toast summary*) di bagian bawah layar.
* **Elemen Terkait**:
  - Kartu layanan: `.service-card` (`data-service-id`, `data-service-name`, `data-service-price`, `data-service-eta`)
  - Tombol aksi kartu: `.btn-pilih`
  - Indikator centang kartu: `.card-check`
  - Notifikasi melayang: `.toast-summary`
* **Mekanisme Kerja**:
  - Pengguna dapat mengeklik kartu layanan atau tombol *"Pilih Layanan"* pada kartu yang berstatus aktif (kartu dengan `data-disabled="true"` diabaikan).
  - Fungsi `pilihLayanan(serviceId)` memperbarui `state.selectedService`.
  - Kartu yang dipilih mendapatkan class `.service-card--selected` (border aksen warna utama dan bayangan menonjol), ikon `.card-check--selected` dengan centang terisi, dan tombol `.btn-pilih--selected` dengan label *"Layanan Terpilih ✓"*. Kartu lain yang tidak dipilih dikembalikan ke status netral.
  - Memunculkan elemen `.toast-summary` di bagian bawah tengah layar dengan animasi halus `fadeInUp`, menampilkan detail:
    - Nama Layanan (misal: **Anteraja Ekonomi**)
    - Tarif Ongkir (misal: **Rp 18.000**)
    - Estimasi Waktu (misal: **3 - 5 Hari**)
    - Tombol tutup ($x$) untuk dismiss instan, atau otomatis hilang sesuai konstanta `DURASI_TOAST_MS = 4000`.
* **Commit**: `92d2d1f feat: add interactive service selection with summary toast`

---

## 3. Strategi & Mindset Migrasi ke React

Kode JavaScript ini dirancang sejak awal agar proses migrasi ke React nantinya berjalan mulus tanpa penulisan ulang logika dari nol:

| Bagian Kode Vanilla JS | Rencana Implementasi di React | Alasan & Kemudahan |
|---|---|---|
| `constants.js` | `src/constants/shipping.js` | Tidak perlu diubah sama sekali (100% reusable ES Module). |
| `utils.js` (Pure Functions) | `src/utils/shippingUtils.js` | Pure functions tanpa DOM, langsung dapat diimpor ke custom hooks atau komponen React. |
| `state` object di `app.js` | `const [state, setState] = useState(...)` atau `useReducer(shippingReducer, initialState)` | Struktur state 1-ke-1 langsung cocok dengan React state hook. |
| `handleFormatInput` | Controlled Component: `value={form.price}` & `onChange={(e) => handlePriceChange(e)}` | Posisi kursor dan formatting dapat diatur di custom hook `useNumericFormat`. |
| `updateVolumeSummary` | `useMemo(() => hitungBeratVolumetrik(dimensions), [dimensions])` | Perhitungan otomatis terpicu setiap dependensi dimensi berubah (reactive computation). |
| `handleSubmitForm` & timer | `async function handleSubmit(e) { ... }` dengan `setIsSubmitting(true)` | Loading state tombol dikendalikan oleh boolean prop di komponen `<Button loading={isSubmitting} />`. |
| Filter tabs & kartu tersembunyi | `services.filter(s => matchesFilter(s, activeFilter)).map(service => <ServiceCard key={service.id} ... />)` | Menggantikan manipulasi class `.card-hidden` dengan deklaratif conditional rendering. |
| `pilihLayanan` & `.toast-summary` | State `selectedServiceId` & komponen `<ToastNotification service={selectedService} onClose={...} />` | Toast hanya dirender ketika ada state toast aktif (komponen deklaratif). |

---

## 4. Riwayat Git Commit Bertahap

Proyek dikerjakan dengan komitmen bertahap mengikuti kaidah *Conventional Commits*:

1. `2eac420` — `feat: add automatic thousand separator formatting and input validation`
2. `664ea7d` — `feat: add real-time volumetric weight recalculation`
3. `0725369` — `feat: add submit button loading state and calculation feedback`
4. `19d78c4` — `feat: add service category filtering tabs`
5. `92d2d1f` — `feat: add interactive service selection with summary toast`
6. `fdc125a` — `refactor: move feedback and toast durations to constants`
7. `717eb7c` — `feat: scroll to service results after shipping calculation`
8. `commit ini` — `docs: add UX interaction documentation`

---

## 5. Keterbatasan dan Rencana Perbaikan

Berikut adalah catatan evaluasi teknis implementasi saat ini beserta rekomendasi perbaikannya:

1. **Integrasi URL Parameter (`?service=`)**: Tombol *"Pilih Layanan Ini ✓"* di halaman rekomendasi saat ini masih berupa tautan kembali tanpa mengubah pilihan kartu di halaman utama secara dinamis. Rencana perbaikan: ubah `href` menjadi `?service=ekonomi` dan gunakan `URLSearchParams` pada saat load untuk memanggil `pilihLayanan()`, yang di React nantinya diimplementasikan via query params atau state terangkat (*lifted state*).
2. **Karakter Statis Halaman Rekomendasi**: Halaman rekomendasi saat ini bersifat statis dengan data tarif *hardcoded* dan belum terhubung dinamis dengan kalkulasi berat volumetrik form utama. Rencana perbaikan: sinkronkan data ringkasan rekomendasi melalui URL search params, shared state, atau *context* saat berpindah ke arsitektur React.
3. **Pola Event Listener Kartu Layanan**: Interaksi 5 memasang listener secara individual pada tiap kartu (`elements.serviceCards`) dengan pengecualian link `<a>` menggunakan `e.target.closest('a')`, yang dipilih karena sederhana dan andal untuk jumlah kartu statis terbatas (4 kartu). Pada arsitektur React, pola ini secara alami digantikan oleh handler deklaratif `onClick` pada komponen `<ServiceCard />`.
4. **Indikator Jumlah Tab & Status Kosong**: Interaksi 4 belum memperbarui angka jumlah kartu pada label tab dan belum menampilkan komponen *empty state* jika hasil filter tidak menemukan layanan yang cocok. Di React, jumlah kartu dihitung langsung dari `services.filter(...)` dan *empty state* dirender secara kondisional jika array hasil filter kosong.
5. **Pembersihan Timer Form Submit**: Timer penundaan loading dan timer feedback sukses submit saat ini belum disimpan referensinya ke variabel untuk pembersihan dengan `clearTimeout`. Pada implementasi React, siklus timer ini akan dikelola dan dibersihkan secara aman di dalam *cleanup function* dari `useEffect`.
6. **Query Runtime untuk Elemen Dinamis**: Elemen floating toast (`.toast-summary`) dan feedback submit (`.btn-submit__success`) dibuat secara dinamis saat runtime (*DOM injection*) sehingga selektornya dicari langsung di dalam handler, bukan di `getElements()`. Hal ini merupakan keputusan desain yang terisolasi dan akan terselesaikan secara otomatis di React karena seluruh notifikasi dirender secara deklaratif berbasis state.
