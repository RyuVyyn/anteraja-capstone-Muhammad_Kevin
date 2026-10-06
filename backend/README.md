# Backend Anteraja Shipping Rate Calculator

Backend ini menyediakan API untuk menghitung ongkos kirim, memilih rekomendasi layanan, serta menyimpan dan membaca riwayat simulasi. Aplikasi menggunakan Laravel dan PostgreSQL. Endpoint kalkulasi mempertahankan path `/api/calculate.php` agar kompatibel dengan frontend.

## Teknologi

- PHP 8.3 atau lebih baru
- Laravel 13
- PostgreSQL
- Laravel Cache, dengan Predis untuk koneksi Redis
- PHPUnit

## Struktur Backend

```text
app/Http/Controllers/   Endpoint kalkulasi dan riwayat simulasi
app/Models/             Model Eloquent
app/Services/           Resolusi lokasi dan rekomendasi BR-09
database/migrations/    Definisi skema database
database/seeders/       Data demo lokasi, layanan, dan tarif
routes/api.php          Route API
tests/                  Unit test dan feature test
```

## Menjalankan Secara Lokal

Prasyarat: PHP 8.3+, Composer, ekstensi PHP `pdo_pgsql`, dan instance PostgreSQL. Jalankan perintah berikut dari folder `backend/`:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
composer install
php artisan key:generate
```

Atur koneksi database pada `.env` sebelum menjalankan migrasi. `.env.example` berisi konfigurasi contoh PostgreSQL/Supabase dengan password kosong. Sesuaikan host, database, username, password, dan SSL mode dengan lingkungan Anda. Jangan commit kredensial atau file `.env`.

Buat tabel dan isi data demo:

```powershell
php artisan migrate --seed
```

Seeder `ShippingDataSeeder` menambahkan 10 lokasi, katalog layanan, serta tarif demo untuk empat layanan. Jalankan server API:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Base URL lokal adalah `http://127.0.0.1:8000`; endpoint health Laravel tersedia di `/up`.

## Menggunakan Supabase

Supabase dapat digunakan sebagai PostgreSQL remote, jadi Anda tidak perlu menjalankan PostgreSQL lokal. Backend Laravel tetap berjalan di komputer sendiri; hanya database yang berada di cloud.

1. Buka **Project Settings → Database → Connect** pada dashboard Supabase dan salin detail koneksi PostgreSQL untuk **Session pooler**. Gunakan detail dari project Anda; nilai host dan username di `.env.example` adalah contoh spesifik project dan belum tentu cocok dengan project lain.
2. Isi konfigurasi database berikut di `backend/.env` menggunakan nilai dari dashboard. Jangan mengganti password dengan nilai placeholder dan jangan membagikan file `.env`.

```dotenv
DB_CONNECTION=pgsql
DB_HOST=host-session-pooler-dari-supabase
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=username-dari-supabase
DB_PASSWORD=password-database-supabase
DB_SSLMODE=require
```

3. Dari folder `backend/`, bersihkan konfigurasi cache dan periksa status koneksi/migrasi:

```powershell
php artisan config:clear
php artisan migrate:status
```

4. Untuk database Supabase yang masih kosong, jalankan migration dan data demo satu kali:

```powershell
php artisan migrate --seed
```

Perintah tersebut membuat tabel aplikasi dan memasukkan data demo ke database remote yang dipilih. Pastikan project dan database yang dipilih memang untuk aplikasi ini. Seeder tidak dirancang untuk dijalankan berulang kali; pada database yang sudah berisi data, cukup jalankan `php artisan migrate` jika ada migration baru.

Setelah database siap, jalankan API lokal dengan `php artisan serve --host=127.0.0.1 --port=8000`. Frontend lokal dapat menggunakan API ini seperti biasa, sementara Laravel membaca dan menulis data ke Supabase.

## Konfigurasi Cache

Semua cache memakai Laravel Cache. `.env.example` menggunakan `CACHE_STORE=database`. Resolver menyimpan daftar lokasi selama 24 jam, sedangkan tarif rute disimpan selama 1 jam. Untuk memakai Redis, siapkan server Redis, set `REDIS_CLIENT=predis` dan `CACHE_STORE=redis` di `.env`, lalu konfigurasi koneksinya. Paket `predis/predis` sudah terpasang.

Setelah mengubah data lokasi atau tarif secara manual, bersihkan cache:

```powershell
php artisan cache:clear
```

## API

Semua route berikut menggunakan prefix `/api`. Saat ini route API belum memasang middleware autentikasi.

### `POST /api/calculate.php`

Menghitung berat tertagih, tarif layanan, rasio ongkir terhadap harga produk, dan rekomendasi BR-09. Kirim body JSON:

```json
{
  "kota_asal": "Bandung (Jawa Barat)",
  "kota_tujuan": "Surabaya (Jawa Timur)",
  "berat_kg": 0.5,
  "panjang_cm": 30,
  "lebar_cm": 20,
  "tinggi_cm": 20,
  "harga_jual": 50000
}
```

`kota_asal`, `kota_tujuan`, `berat_kg`, dan `harga_jual` wajib diisi. Dimensi bersifat opsional. Nama kota harus dapat dicocokkan dengan tabel lokasi; sertakan provinsi untuk menghindari nama kota ambigu. Resolver menerima variasi awalan seperti `KOTA` dan `KABUPATEN`.

Respons sukses mencakup `shipment_id`, ringkasan berat, `recommendation`, dan array `options`. Setiap opsi memuat layanan, tarif per kg dan total, estimasi SLA, persentase dan kategori risiko margin, selisih dari tarif termurah, serta informasi rekomendasi. Jika rute tidak memiliki tarif, API tetap mengembalikan sukses dengan `options: []` dan `recommendation: null`.

Input JSON kosong mengembalikan HTTP `400`. Nilai input tidak valid atau lokasi yang tidak ditemukan mengembalikan HTTP `422`, dengan pesan pada properti `error`.

### `GET /api/simulasi/tabel`

Mengambil riwayat simulasi terbaru beserta data kota dan opsi layanan. Respons menggunakan format pagination Laravel.

| Parameter | Keterangan |
|-----------|------------|
| `dari` dan `sampai` | Filter rentang `created_at`; filter aktif jika keduanya diberikan |
| `layanan` | Filter shipment yang memiliki rekomendasi dengan `service_id` tersebut |
| `per_page` | Jumlah record per halaman; default 15, maksimum 100 |

Contoh: `/api/simulasi/tabel?dari=2026-10-01&sampai=2026-10-31&layanan=SRV_EKO&per_page=20`.

### `GET /api/simulasi/agregat`

Mengembalikan rata-rata persentase ongkir per layanan dalam properti `data`, diurutkan dari nilai terendah.

## Perhitungan dan Penyimpanan

- Berat volumetrik dihitung dengan rumus `(panjang × lebar × tinggi) / 6000` dalam cm dan kg.
- Berat tertagih adalah nilai terbesar antara berat fisik dan volumetrik, dibulatkan ke atas ke kilogram penuh.
- Ongkir adalah tarif per kg dikali berat tertagih. Rasio ongkir dibanding harga jual dikategorikan Hijau sampai 15%, Kuning di atas 15% sampai 30%, dan Merah di atas 30%.
- `RecommendationEngine` menerapkan aturan BR-09 pada layanan yang tersedia. Kode aturan yang dapat dikembalikan mencakup `BR09-R1`, `BR09-R2`, `BR09-R3`, dan `BR09-DEFAULT`.
- Response kalkulasi dikirim sebelum pencatatan shipment dan opsi dilakukan setelah response. Riwayat dapat terlambat sesaat sebelum muncul pada endpoint tabel.

Migration Laravel adalah sumber kebenaran skema. Tabel domain utama: `locations`, `shipping_services`, `shipping_rates`, `shipments`, dan `shipment_options`.

## Pengujian

PHPUnit dikonfigurasi menggunakan SQLite in-memory, sehingga test tidak memerlukan PostgreSQL development. Dari folder `backend/` jalankan:

```powershell
php artisan test
```

Untuk menjalankan satu file feature test:

```powershell
php artisan test tests/Feature/ShippingCalculationTest.php
```

Feature test mencakup kalkulasi, validasi, dan API simulasi; unit test mencakup aturan rekomendasi. Panduan menjalankan frontend bersama backend dan skenario UAT tersedia di [`../TESTING.md`](../TESTING.md).

## Catatan Pengembangan

- Tambahkan route API di `routes/api.php`, logika HTTP di controller, dan aturan domain yang dapat digunakan ulang di `app/Services/`.
- Buat perubahan skema melalui migration dan perbarui seeder serta test yang terkait.
- Endpoint belum menerapkan autentikasi atau otorisasi. Jangan mengekspos API ke publik tanpa kebijakan akses yang sesuai.