# Dokumentasi Kesesuaian Tampilan (UI) dengan Dokumen FRD
## Proyek: Optimasi Kalkulator Cek Tarif Anteraja Ramah UMKM

Dokumen ini menjelaskan bagaimana seluruh kebutuhan fitur yang ada pada dokumen **FRD (Functional Requirements Document)** telah berhasil diwujudkan ke dalam tampilan antarmuka (**UI Prototype**), yang terdiri dari:
1. **Halaman Utama**: [`src/prototype/anteraja-cek-ongkir-ramah-umkm-statis.html`](file:///d:/Homework/Job/maxy/Tugas/anteraja-capstone-Muhammad_Kevin/src/prototype/anteraja-cek-ongkir-ramah-umkm-statis.html)
2. **Halaman Popup/Modal Rekomendasi**: [`src/prototype/anteraja-recommendation-section-statis.html`](file:///d:/Homework/Job/maxy/Tugas/anteraja-capstone-Muhammad_Kevin/src/prototype/anteraja-recommendation-section-statis.html)
3. **Berkas Gaya Tampilan (CSS)**: [`src/prototype/anteraja-cek-ongkir-ramah-umkm-statis.css`](file:///d:/Homework/Job/maxy/Tugas/anteraja-capstone-Muhammad_Kevin/src/prototype/anteraja-cek-ongkir-ramah-umkm-statis.css)

---

### Ringkasan Cepat: Semua FRD Sudah Terimplementasi

| Dokumen FRD | Nama Fitur | Di Mana Letaknya di UI? | Status |
| :--- | :--- | :--- | :---: |
| **FRD-01** | Form Input Pengiriman & Volumetrik | Formulir bagian atas halaman utama + Ringkasan Berat Otomatis | ✅ Terpenuhi |
| **FRD-02** | Perbandingan Layanan Berdampingan | Bagian tengah (4 kartu jejer) + Tabel perbandingan lengkap | ✅ Terpenuhi |
| **FRD-03** | Kalkulator Margin Sederhana | Panel simulasi keuntungan toko + Badge porsi ongkir pada kartu | ✅ Terpenuhi |
| **FRD-04** | Engine Rekomendasi Berbasis Aturan | Sorotan kartu "Paling Hemat" + Halaman popup alasan rekomendasi | ✅ Terpenuhi |

---

### Penjelasan Detail Tiap Fitur dengan Bahasa Sederhana

#### 1. FRD-01: Form Input Pengiriman & Hitung Volume Otomatis
* **Tujuan Sederhana**: Memudahkan penjual memasukkan data paket (asal, tujuan, berat, ukuran kotak, dan harga barang), lalu sistem langsung otomatis menghitung apakah paket kena tarif berat fisik atau berat volume (kubikasi).
* **Penerapan pada UI Halaman Utama**:
  * **Input Rute**: Tersedia kolom **Kota Asal** (*Bandung - Coblong*) dan **Kota Tujuan** (*Surabaya - Gubeng*).
  * **Input Berat Fisik & Dimensi**: Kolom pengisian berat fisik (*0.5 kg*) dan kotak dimensi Panjang x Lebar x Tinggi (*30 x 20 x 20 cm*).
  * **Input Harga Barang**: Kolom harga produk (*Rp 50.000*) untuk keperluan perhitungan keuntungan toko.
  * **Penghitungan Volumetrik Otomatis**: Di bawah tombol, langsung muncul kotak info:
    > **Ukuran Volume: 2.0 kg • Berat Aktual: 0.5 kg • Berat Dihitung: 2.0 kg (mengikuti volume paket)**  
    *(Sesuai rumus baku logistik: $(30 \times 20 \times 20) / 6000 = 2.0\text{ kg}$)*.

---

#### 2. FRD-02: Perbandingan Layanan Berdampingan (Side-by-Side)
* **Tujuan Sederhana**: Penjual tidak perlu klik sana-sini untuk membandingkan opsi pengiriman. Semua pilihan paket Anteraja ditampilkan berjajar langsung di satu layar agar mudah dilihat perbedaannya (harga, durasi hari, dan keunggulannya).
* **Penerapan pada UI Halaman Utama**:
  * **4 Kartu Layanan Berjajar**:
    1. **Anteraja Ekonomi**: Ditandai opsi paling hemat (Rp 18.000 / 2.0 kg, estimasi 3-5 hari).
    2. **Anteraja Reguler**: Opsi populer (Rp 24.000 / 2.0 kg, estimasi 2-3 hari).
    3. **Anteraja Next Day**: Opsi kilat esok tiba (Rp 36.000 / 2.0 kg, estimasi 1 hari).
    4. **Anteraja Same Day**: Diberi penanda jelas **"Tidak Tersedia untuk Rute Ini"** dengan penjelasan transparan bahwa Same Day hanya berlaku untuk pengiriman dalam kota yang sama (radius maks. 40 km).
  * **Tabel Perbandingan Lengkap di Bawah**:
    Menampilkan rincian teknis yang dibutuhkan penjual seperti batas waktu jemput paket kurir (cut-off pickup) dan ketersediaan layanan Bayar di Tempat (COD hingga Rp 5 juta).

---

#### 3. FRD-03: Kalkulator Margin Sederhana (Pengaruh Ongkir ke Usaha)
* **Tujuan Sederhana**: Membantu penjual online mengetahui seberapa besar porsi ongkos kirim memakan harga jual produk mereka. Fitur ini memberi peringatan warna apakah ongkir aman untuk pembeli atau berisiko membuat pembeli membatalkan pesanan.
* **Penerapan pada UI Halaman Utama**:
  * **Panel Simulasi Keuangan Toko (Selalu Terbuka)**:
    * **Harga Jual Produk**: Rp 50.000
    * **Biaya Ongkir Termurah**: Rp 18.000 (Porsi ongkir: **36%** dari harga barang)
    * **Sisa Pendapatan**: Rp 32.000 (sebelum modal produk)
    * **Penghematan**: Lebih hemat Rp 6.000 dibanding layanan standar
  * **Badge Peringatan Risiko Warna**:
    * Pada kartu **Next Day (72%)** tampil lencana **Merah** (risiko tinggi pembeli batal karena ongkir lebih mahal dari barang).
    * Pada kartu **Ekonomi (36%)** dan **Reguler (48%)** tampil lencana peringatan transparan.
  * **Kotak Saran Toko (Actionable Insight)**:
    Memberikan solusi praktis langsung ke penjual, seperti saran bundling belanja ("beli 2 pcs Rp 100.000 ongkir tetap sama") atau strategi subsidi ongkir sebagian.

---

#### 4. FRD-04: Engine Rekomendasi Berbasis Aturan (Saran Pengiriman Terbaik)
* **Tujuan Sederhana**: Memberikan 1 pilihan paling bijak dan rasional secara otomatis tanpa membuat penjual bingung memilih.
* **Penerapan pada UI Halaman Utama & Popup**:
  * **Pada Halaman Utama**:
    * Kartu **Anteraja Ekonomi** otomatis dipasangi pita emas **"PILIHAN PALING HEMAT"**.
    * Terdapat tombol pintas **"Lihat Saran Rekomendasi"** dan **"Rekomendasi Hemat"**.
  * **Pada Halaman Popup (`anteraja-recommendation-section-statis.html`)**:
    * Menampilkan kartu rekomendasi terpilih: **Anteraja Ekonomi (Rp 18.000)**.
    * Menjelaskan alasan logis: *"Kenapa layanan ini pas untuk toko Anda? Layanan Anteraja Ekonomi direkomendasikan agar biaya kirim tidak terlalu membebani harga barang Anda. Anda menghemat Rp 6.000 (25%) dibanding layanan standar reguler, dengan waktu sampai yang tetap wajar untuk belanja online."*
    * Terdapat tombol aksi **"Pilih Layanan Ini ✓"** untuk langsung mengambil keputusan.

---

### Kriteria Teknis Tambahan yang Telah Terpenuhi

1. **Semantic HTML**:
   * Menggunakan tag HTML5 semantis (`<header>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<nav>`, `<footer>`, `<dl>`, `<dt>`, `<dd>`, `<table>`, `<form>`, `<fieldset>`, `<legend>`, `<label>`).
   * Aksesibilitas screen reader terjamin dengan atribut ARIA (`aria-label`, `aria-labelledby`, `role="status"`).
2. **Data Terstruktur JSON-LD (Schema.org)**:
   * Telah dipasang skrip `type="application/ld+json"` mengacu pada standar Schema.org tipe **`WebApplication`**, **`BreadcrumbList`**, dan **`ItemPage` / `Service`** pada halaman HTML.
3. **Responsif (Mobile & Desktop)**:
   * Menggunakan strategi *Mobile-First*.
   * Tampilan menyesuaikan secara rapi pada layar Handphone (<640px), Tablet (768px), maupun Layar Komputer / Desktop (≥1024px) sesuai komitmen dokumen `DESIGN.md` dan `PRD`.
