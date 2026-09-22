# Product Requirements Document (PRD)
## Proyek: Anteraja Shipping Rate Calculator Optimization

---

### 1 · Masalah (Problem Statement)
* **Apa yang bermasalah sekarang?**: Fitur cek tarif Anteraja saat ini berfungsi baik untuk kebutuhan dasar (menampilkan kota asal, tujuan, berat, tarif, dan SLA), tetapi baru menjawab pertanyaan *"berapa ongkos kirimnya"* (*Data/Information*). Fitur tersebut belum menjawab pertanyaan utama penjual online sehari-hari: *"opsi pengiriman mana yang paling menguntungkan untuk order saya"* (*Knowledge/Wisdom*). Penjual harus menghitung porsi ongkir terhadap margin keuntungan secara manual.
* **Narasi Bisnis & Asumsi Teruji**:
  * Maraknya penggunaan platform pembanding tarif pihak ketiga mengindikasikan bahwa proses perbandingan harga dan SLA sering terjadi di luar aplikasi Anteraja. Asumsi logis ini menjadi dasar eksplorasi solusi untuk mencegah *churn* pengguna, dengan catatan perlu diuji lebih lanjut menggunakan data pengguna Anteraja yang lebih spesifik.
  * Peluang bisnis terbesar tidak selalu berasal dari membangun sistem baru dari nol, melainkan dari mengoptimalkan (*refining*) fitur yang sudah ada agar relevan dengan kebutuhan pengguna.
  * Terdapat segmen penjual UMKM skala mikro-menengah yang berada di antara pengguna aplikasi biasa dan klien korporat BisnisAja yang belum terlayani secara khusus (*underserved segment*).

---

### 2 · Pengguna (User Personas & Quantified Roles)
* **Penjual UMKM / Online Seller (Target Utama)**: **15.000 pengguna aktif bulanan** (Penjual *e-commerce* dan *social commerce* skala mikro-kecil yang mengirimkan 10–100 paket/hari, berada di segmen antara pengguna ritel biasa dan klien korporat BisnisAja, membutuhkan kepastian margin keuntungan dan efisiensi ongkir).
* **Account Executive / Sales BisnisAja**: **50 staf** (Membutuhkan pipa *qualified leads* dari penjual UMKM bervolume tinggi yang teridentifikasi secara otomatis melalui aktivitas pencarian tarif).
* **Tim Operations & Pricing Anteraja**: **5 staf/admin** (Mengelola master data tarif, pembaruan zona pengiriman, dan estimasi SLA).

---

### 3 · Tujuan (Success Metrics & KPIs)
* **Mengubah Alat Cek Harga Menjadi Decision Tool**: Mengubah peran kalkulator tarif dari sekadar pembanding harga dasar menjadi alat pengambilan keputusan margin di dalam ekosistem Anteraja.
* **Meningkatkan Retensi Pengguna UMKM**: Meningkatkan retensi bulan pertama (*Month-1 Retention Rate*) pengguna UMKM dari **32% menjadi 65%** (diukur dari persentase pengguna yang kembali menggunakan kalkulator dalam 30 hari).
* **Mempercepat Pengambilan Keputusan**: Memangkas waktu analisis dan pemilihan layanan dari **210 detik menjadi < 10 detik** per pengecekan (diukur via *time-on-task telemetry*).
* **Menciptakan Pipeline Lead BisnisAja**: Merekrut **500 qualified leads UMKM** per bulan untuk akun korporat BisnisAja (diukur dari *click-through-rate* banner BisnisAja dan pendaftaran form).

---

### 4 · Lingkup (Scope: Core MVP vs Optional & Out-of-Scope)

#### A. Fokus Utama: Core MVP (Wajib / Must-Have - FRD 01 s/d FRD 04)
Empat fitur inti yang menjadi **fokus utama pengembangan 2 bulan** untuk membangun *Decision Support System* bagi penjual UMKM:
1. **Form Input Pengiriman & Volumetrik (FRD-01)**: Input kota asal, kota tujuan, berat fisik (kg), dimensi paket (P x L x T cm), dan harga jual produk. Menghitung berat volumetrik $(P \times L \times T) / 6000$ dan menentukan berat *chargeable* secara otomatis.
2. **Perbandingan Layanan Berdampingan (FRD-02)**: Menampilkan seluruh opsi layanan Anteraja (Reguler, Next Day, Same Day, Ekonomi) secara sejajar (*side-by-side*) beserta tarif, estimasi SLA, dan kalkulasi selisih harga/waktu.
3. **Kalkulator Margin Sederhana (FRD-03)**: Penghitungan otomatis rasio ongkir terhadap harga barang `(Tarif Ongkir / Harga Jual) * 100%` dengan indikator warna risiko margin (Hijau $\le 15\%$, Kuning $15.1-30\%$, Merah $>30\%$).
4. **Engine Rekomendasi Berbasis Aturan (FRD-04)**: Evaluasi *decision tree* sederhana untuk menandai 1 rekomendasi layanan terbaik (`is_recommended = TRUE`) dilengkapi 1 kalimat penjelasan logis (*trade-off* harga vs kecepatan SLA).

#### B. Fitur Tambahan (Optional / Nice-to-Have - FRD 05 & FRD 06)
Fitur pelengkap yang bersifat **opsional / *secondary priority***. Pengembangannya dilakukan hanya jika alur utama (FRD 01-04) telah stabil dan memiliki sisa kapasitas *sprint*:
1. **Riwayat Pengecekan Lokal (FRD-05 - Optional)**: Menyimpan 5 pencarian rute terakhir di *browser* (`LocalStorage`) agar penjual tidak perlu mengulang input data.
2. **Trigger & Lead Generator BisnisAja (FRD-06 - Optional)**: Deteksi otomatis frekuensi pencarian bulanan ($\ge 20$ kali) untuk menampilkan pemicu pendaftaran akun korporat BisnisAja.

#### C. Tidak Termasuk dalam MVP (Out-of-Scope / Dibuang untuk Fokus 2 Bulan)
1. Integrasi API otomatis ke *marketplace* pihak ketiga (Shopee, Tokopedia, TikTok Shop, WooCommerce).
2. Prediksi harga & SLA berbasis *Machine Learning* / AI Dinamis.
3. Pemrosesan pembayaran ongkir langsung & pemesanan penjemputan instan (*In-App Payment & Instant Pickup Booking*).
4. Fitur pencetakan label resi otomatis (*Shipping Label Generator*).
5. Kalkulator pengiriman *multi-origin* atau *multi-drop*.
6. Pelacakan kurir secara langsung (*Live GPS Tracking*).

---

### 5 · Batasan (Constraints & Compliance)
* **Kerangka Kerja Metodologis**: Wajib menggunakan pendekatan **DIKW Pyramid Framework** (Data -> Information -> Knowledge -> Wisdom) untuk mentransformasi data mentah menjadi keputusan bisnis.
* **Fokus Eksekusi**: Memprioritaskan penyelesaian alur **FRD 01 hingga FRD 04** sebagai *Core MVP* utama sebelum menyentuh fitur *nice-to-have* (FRD 05 & 06).
* **Nilai Layanan SATRIA**: Menekankan transparansi harga dan keandalan estimasi waktu sebagai perwujudan nilai SATRIA (Sigap, Aman, Terpercaya, Ramah, Integritas, Amanah).
* **Pengelolaan Risiko Rendah**: Memanfaatkan data dan sistem tarif Anteraja yang sudah berjalan untuk meminimalkan kompleksitas teknis dan risiko keterlambatan pengerjaan.
* **Standar Kalkulasi Logistik**: Menggunakan rumus berat volumetrik standar logistik Indonesia: $	ext{Berat Volumetrik (kg)} = (P \times L \times T) / 6000$.
* **Jadwal Pengembangan**: Wajib diselesaikan dan siap rilis dalam **2 Bulan (8 Minggu / 4 Sprints)**.
* **Privasi & Keamanan Data**: Tidak menyimpan data keuangan toko secara permanen; seluruh input bersifat *session-based* dan mematuhi Regulasi Perlindungan Data Pribadi (UU PDP).
* **Kompatibilitas Tampilan**: Wajib *responsive web design* yang optimal untuk *mobile web view* (mweb) dan desktop.
* **SLA Performa Sistem**: Menggunakan master data tarif lokal yang ter-cache untuk menjamin waktu respons pencarian $< 300	ext{ ms}$.

---

### 6 · Skala (Scale Metrics)
1. **20.000 MAU**: Target *Monthly Active Users* dari segmen penjual UMKM pada fase awal peluncuran.
2. **50.000 Kalkulasi/Hari**: Kapasitas *throughput* pengecekan tarif harian yang wajib ditangani oleh *backend infrastructure*.
3. **< 300 ms SLA Latensi**: Batas maksimum waktu respons sistem dari penekanan tombol 'Hitung' hingga hasil rekomendasi muncul di layar.
4. **65% Target Retensi**: Target persentase penjual UMKM yang menggunakan kembali alat kalkulator dalam kurun waktu 30 hari.
5. **500 Qualified Leads/Bulan**: Target pencapaian calon nasabah korporat BisnisAja yang berhasil ditangkap melalui pemicu otomatis (*jika FRD-06 diaktifkan*).
6. **8 Minggu Timeline Sprint**: Durasi total siklus pengerjaan *development* (4 siklus sprint @ 2 minggu) hingga tahap produksi (*go-live*).

---

### 7 · Daftar Fitur & Skala Prioritas (Feature Roadmap)

| No | Nama Fitur | Kategori / Prioritas | Target Sprint | Dokumen FRD Referensi | Deskripsi Singkat Fitur |
| :-: | :--- | :-: | :-: | :--- | :--- |
| 1 | **Form Input Pengiriman & Volumetrik** | **Core MVP (P1 - Must Have)** | Sprint 1 (Minggu 1-2) | `frd-01-form-input-volumetrik-v2.md` | Input kota asal, tujuan, berat fisik/volumetrik, dan harga jual produk. |
| 2 | **Perbandingan Layanan Berdampingan** | **Core MVP (P1 - Must Have)** | Sprint 1-2 (Minggu 2-3) | `frd-02-perbandingan-layanan-v2.md` | Matriks komparatif tarif, SLA, dan selisih harga antar-layanan Anteraja. |
| 3 | **Kalkulator Margin Sederhana** | **Core MVP (P1 - Must Have)** | Sprint 2 (Minggu 3-4) | `frd-03-kalkulator-margin-v2.md` | Penghitungan % ongkir vs harga jual beserta indikator visual risiko margin. |
| 4 | **Engine Rekomendasi Berbasis Aturan** | **Core MVP (P1 - Must Have)** | Sprint 3 (Minggu 5-6) | `frd-04-engine-rekomendasi-v2.md` | Pohon keputusan (*decision tree*) penentu 1 layanan terbaik & alasannya. |
| 5 | **Riwayat Pengecekan Lokal** | **Nice-to-Have (P2 - Optional)** | Sprint 4 (Minggu 7) | `frd-05-riwayat-pengecekan.md` | Penyimpanan 5 rute pencarian terakhir menggunakan LocalStorage browser (Opsional). |
| 6 | **Trigger & Lead Generator BisnisAja** | **Nice-to-Have (P2 - Optional)** | Sprint 4 (Minggu 8) | `frd-06-trigger-upsell-bisnisaja.md` | Pemicu otomatis penawaran BisnisAja jika frekuensi cek $\ge 20	imes$/bulan (Opsional). |

---

### 8 · Keputusan Terbuka (Open Decisions)

| No | Pertanyaan / Masalah Terbuka | Pembuat Keputusan | Batas Waktu | Opsi / Status Keputusan |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Apakah fitur FRD-05 (Riwayat Lokal) dan FRD-06 (Lead BisnisAja) dimasukkan ke Rilis v1.0 atau ditunda ke v1.1? | Product Owner & Development Lead | Akhir Minggu ke-4 | Ditinjau setelah evaluasi penyelesaian alur FRD 01-04 pada Sprint 3. |
| 2 | Apakah *threshold* warna risiko margin (Merah $>30\%$) perlu disesuaikan khusus untuk kategori barang berat (>10 kg)? | Product Lead & Pricing Manager | Akhir Minggu ke-2 | Disepakati menggunakan *threshold* tunggal ($15\%$ & $30\%$) pada MVP v1 untuk menjaga kesederhanaan. |
| 3 | Arsitektur *caching* apa yang akan digunakan untuk master data tarif agar latensi tetap $<300	ext{ ms}$? | Tech Lead / System Architect | Akhir Minggu ke-1 | Evaluasi antara Redis In-Memory Cache vs SQLite Local Memory. |
