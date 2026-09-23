# Dokumentasi Database
## Kalkulator Ongkir & Margin Anteraja

Dokumen ini menjelaskan struktur database yang dipakai untuk fitur Form Input, Perbandingan Layanan, Kalkulator Margin, dan Engine Rekomendasi. Cakupannya mengikuti FRD 01-04.
---

## 1 · Gambaran Umum

Database ini terdiri dari **5 tabel** yang saling berhubungan:

1. `locations` — daftar kota yang bisa dipilih sebagai asal/tujuan
2. `shipping_services` — daftar jenis layanan pengiriman (Ekonomi, Reguler, dst.)
3. `shipping_rates` — daftar tarif dan estimasi waktu untuk tiap kombinasi rute dan layanan
4. `shipments` — catatan satu kali proses hitung ongkir yang dilakukan pengguna
5. `shipment_options` — hasil perbandingan tiap layanan untuk satu proses hitung, lengkap dengan margin dan rekomendasi

Cara paling mudah membayangkannya: `locations`, `shipping_services`, dan `shipping_rates` adalah **data referensi** yang sudah disiapkan lebih dulu oleh tim Admin Pricing/Ops Anteraja. Sementara `shipments` dan `shipment_options` adalah **hasil kalkulasi** yang baru terisi setiap kali seorang penjual UMKM menekan tombol "Hitung Ongkir & Margin".

Alur singkatnya: pengguna mengisi form → sistem membuat satu baris baru di `shipments` → sistem mengambil tarif dari `shipping_rates` untuk tiap layanan yang tersedia di `shipping_services` → hasil perbandingan dan rekomendasinya disimpan sebagai beberapa baris di `shipment_options`, satu baris per layanan.

---

## 2 · Penjelasan Tiap Tabel

### 2.1 `locations` — Daftar Kota

Tabel ini berisi kota-kota yang boleh dipilih pengguna di kolom kota asal dan kota tujuan saat mengisi form (BR-03). Fungsinya mirip daftar saran yang muncul saat mengetik nama kota — kalau kotanya tidak ada di sini, sistem akan menyarankan pengguna menghubungi CS.

| Kolom | Penjelasan |
| :--- | :--- |
| `location_id` | Nomor urut unik untuk tiap kota |
| `nama_kota` | Nama kota atau kecamatan |
| `provinsi` | Provinsi tempat kota itu berada |
| `kode_pos` | Kode pos kota tersebut |

---

### 2.2 `shipping_services` — Daftar Jenis Layanan

Tabel ini berisi jenis-jenis layanan pengiriman yang dipunyai Anteraja, misalnya Ekonomi, Reguler, Next Day, dan Same Day. Admin Pricing/Ops bisa mengaktifkan atau menonaktifkan layanan tertentu lewat kolom `is_active`, tanpa perlu menghapus datanya.

| Kolom | Penjelasan |
| :--- | :--- |
| `service_id` | Kode unik untuk tiap layanan |
| `nama_layanan` | Nama layanan yang tampil ke pengguna, misalnya "Ekonomi" |
| `deskripsi` | Penjelasan singkat tentang layanan tersebut |
| `is_active` | Menandakan apakah layanan ini sedang bisa dipakai atau tidak |

---

### 2.3 `shipping_rates` — Daftar Tarif per Rute

Tabel ini adalah "buku tarif" milik Anteraja. Setiap barisnya mewakili satu kombinasi rute (kota asal → kota tujuan) dan satu jenis layanan, lengkap dengan harga per kilogram dan estimasi lama pengirimannya. Saat pengguna menekan tombol hitung, sistem mencari baris yang cocok di sini untuk menentukan tarifnya (BR-04, BR-05).

| Kolom | Penjelasan |
| :--- | :--- |
| `rate_id` | Nomor urut unik untuk tiap baris tarif |
| `kota_asal` | Kota tempat paket dikirim |
| `kota_tujuan` | Kota tempat paket akan diterima |
| `service_id` | Menunjuk ke layanan mana tarif ini berlaku (lihat `shipping_services`) |
| `tarif_per_kg` | Harga pengiriman untuk setiap 1 kilogram berat |
| `estimasi_sla_label` | Perkiraan lama pengiriman dalam bentuk teks, misalnya "1-2 Hari" |
| `estimasi_sla_hari` | Perkiraan lama pengiriman dalam bentuk angka hari, dipakai untuk perhitungan selisih waktu |

---

### 2.4 `shipments` — Catatan Proses Hitung Ongkir

Setiap kali seorang penjual UMKM mengisi form dan menekan tombol hitung, satu baris baru tercatat di sini. Baris ini menyimpan semua data yang diketik pengguna, ditambah hasil hitungan berat volumetrik dan berat yang dipakai untuk menentukan tarif (BR-01, BR-02).

| Kolom | Penjelasan |
| :--- | :--- |
| `shipment_id` | Nomor unik untuk satu proses hitung |
| `kota_asal` | Kota asal yang dipilih pengguna |
| `kota_tujuan` | Kota tujuan yang dipilih pengguna |
| `berat_kg` | Berat fisik paket yang diketik pengguna, dalam kilogram |
| `panjang_cm`, `lebar_cm`, `tinggi_cm` | Ukuran dimensi paket, dalam sentimeter |
| `berat_volume_kg` | Berat hasil hitungan otomatis dari dimensi paket, memakai rumus (panjang × lebar × tinggi) ÷ 6000 |
| `berat_ditagih` | Berat yang sebenarnya dipakai untuk menghitung tarif — diambil dari yang lebih besar antara berat fisik dan berat volumetrik |
| `harga_jual_produk` | Harga jual produk yang diketik pengguna, dipakai untuk menghitung persentase ongkir |

---

### 2.5 `shipment_options` — Hasil Perbandingan & Rekomendasi

Ini adalah tabel intinya. Untuk satu proses hitung (`shipments`), tabel ini menyimpan satu baris untuk tiap layanan yang dibandingkan — jadi kalau ada 3 layanan tersedia, akan ada 3 baris di sini dengan `shipment_id` yang sama. Di sinilah tersimpan tarif akhir, badge margin, selisih harga/waktu, dan layanan mana yang direkomendasikan sistem (BR-05 sampai BR-10).

| Kolom | Penjelasan |
| :--- | :--- |
| `option_id` | Nomor unik untuk satu baris opsi layanan |
| `shipment_id` | Menunjuk ke proses hitung mana opsi ini berasal (lihat `shipments`) |
| `service_id` | Menunjuk ke layanan yang sedang dibandingkan (lihat `shipping_services`) |
| `tarif_ongkir` | Harga ongkir akhir untuk layanan ini, sudah dikalikan dengan berat ditagih |
| `estimasi_sla` | Perkiraan lama pengiriman yang ditampilkan di kartu, misalnya "1-2 Hari" |
| `status_ketersediaan_rute` | Menandakan apakah layanan ini tersedia untuk rute yang dipilih, atau berlabel "Tidak Tersedia" |
| `persentase_ongkir` | Persentase ongkir dibanding harga jual produk, dipakai untuk menentukan warna badge margin |
| `kategori_risiko_margin` | Kategori warna margin: Hijau (aman), Kuning (sedang), atau Merah (berisiko) |
| `selisih_harga_layanan` | Selisih harga dibanding layanan termurah pada proses hitung yang sama |
| `selisih_waktu_sla_hari` | Selisih waktu pengiriman dibanding layanan tercepat pada proses hitung yang sama |
| `is_recommended` | Menandakan apakah layanan ini yang dipilih sistem sebagai rekomendasi utama |
| `alasan_rekomendasi` | Kalimat penjelasan kenapa layanan ini direkomendasikan, hanya terisi untuk baris yang `is_recommended`-nya benar |
| `rule_code_applied` | Kode aturan decision tree yang menyebabkan layanan ini terpilih sebagai rekomendasi, misalnya "BR09-R1" |

---

## 3 · Bagaimana Tabel-Tabel Ini Saling Berhubungan

Bayangkan seperti ini:

- **`shipping_services`** adalah daftar menu layanan yang ada.
- **`shipping_rates`** adalah daftar harga menu tersebut untuk tiap rute — satu layanan bisa punya banyak baris tarif karena rutenya berbeda-beda.
- **`shipments`** adalah satu kali "pesanan" hitung ongkir dari pengguna.
- **`shipment_options`** adalah daftar pilihan menu yang ditawarkan untuk satu "pesanan" itu — satu proses hitung wajib punya minimal satu opsi layanan, dan bisa lebih dari satu supaya pengguna punya bahan perbandingan.

Sementara itu, **`locations`** berdiri sendiri sebagai daftar kota rujukan untuk autocomplete. Ia tidak terhubung langsung ke tabel lain karena `kota_asal` dan `kota_tujuan` di tabel lain saat ini masih disimpan sebagai teks biasa, bukan sebagai rujukan ke `locations`.

---

## 4 · Cara Pakai File yang Disediakan

- **`schema.sql`** — berisi perintah untuk membuat kelima tabel di atas dari nol (tanpa isi data). Jalankan file ini lebih dulu di database yang masih kosong.
- **`seeder.sql`** — berisi perintah untuk membuat kelima tabel sekaligus mengisinya dengan data contoh. Cocok dipakai langsung untuk mencoba-coba atau keperluan demo, tanpa perlu menjalankan `schema.sql` lebih dulu.

Urutan menjalankan yang disarankan:
1. Jika database masih kosong dan ingin diisi data contoh langsung, cukup jalankan `seeder.sql` saja.
2. Jika hanya ingin struktur tabelnya tanpa data contoh (misalnya untuk lingkungan produksi), jalankan `schema.sql` saja.