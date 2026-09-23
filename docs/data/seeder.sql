-- =====================================================================
-- SEEDER DUMMY DATA — Kalkulator Ongkir Anteraja (versi trimmed)
-- Dipangkas sesuai cakupan frd_gabungan_anteraja.md:
--   dihapus: USERS, BISNISAJA_LEADS (di luar scope FRD ini)
--   SHIPMENTS: kolom user_id & timestamp_cek dihapus,
--              berat_chargeable_kg -> berat_ditagih (istilah Glossary Bag.5)
--   SHIPMENT_OPTIONS: tambah status_ketersediaan_rute (BR-04) &
--                      rule_code_applied (BR-10)
-- 10 baris per tabel
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. LOCATIONS  (master rute — BR-03)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    location_id  INT PRIMARY KEY,
    nama_kota    VARCHAR(50),
    provinsi     VARCHAR(50),
    kode_pos     VARCHAR(10)
);

INSERT INTO locations (location_id, nama_kota, provinsi, kode_pos) VALUES
(1, 'Jakarta Pusat', 'DKI Jakarta',       '10110'),
(2, 'Surabaya',      'Jawa Timur',        '60119'),
(3, 'Bandung',       'Jawa Barat',        '40111'),
(4, 'Medan',         'Sumatera Utara',    '20111'),
(5, 'Semarang',      'Jawa Tengah',       '50131'),
(6, 'Makassar',      'Sulawesi Selatan',  '90111'),
(7, 'Denpasar',      'Bali',              '80113'),
(8, 'Palembang',     'Sumatera Selatan',  '30111'),
(9, 'Banjarmasin',   'Kalimantan Selatan','70111'),
(10, 'Samarinda',    'Kalimantan Timur',  '75111');

-- ---------------------------------------------------------------------
-- 2. SHIPPING_SERVICES  (master layanan — BR-04, F-02.1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipping_services (
    service_id   VARCHAR(20) PRIMARY KEY,
    nama_layanan VARCHAR(50),
    deskripsi    VARCHAR(255),
    is_active    BOOLEAN
);

INSERT INTO shipping_services (service_id, nama_layanan, deskripsi, is_active) VALUES
('SRV_EKO', 'Ekonomi',  'Layanan paling hemat, estimasi 3-4 hari',         TRUE),
('SRV_REG', 'Reguler',  'Layanan standar, estimasi 1-2 hari',              TRUE),
('SRV_NXT', 'Next Day', 'Sampai keesokan hari, estimasi 1 hari',           TRUE),
('SRV_SMD', 'Same Day', 'Sampai di hari yang sama, estimasi beberapa jam', TRUE),
('SRV_INT', 'Instant',  'Diantar dalam hitungan jam via kurir motor',      TRUE),
('SRV_CGO', 'Kargo',    'Untuk pengiriman berat/volume besar',             TRUE),
('SRV_TRK', 'Trucking', 'Pengiriman via truk untuk kota besar',            FALSE),
('SRV_KAI', 'Kereta',   'Pengiriman via kereta logistik',                  TRUE),
('SRV_LAU', 'Laut',     'Pengiriman via kapal laut, biaya rendah',         TRUE),
('SRV_UDR', 'Udara',    'Pengiriman via pesawat, tercepat lintas pulau',   TRUE);

-- ---------------------------------------------------------------------
-- 3. SHIPPING_RATES  (master tarif & SLA per rute — BR-04, BR-05)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipping_rates (
    rate_id            INT PRIMARY KEY,
    kota_asal          VARCHAR(50),
    kota_tujuan        VARCHAR(50),
    service_id         VARCHAR(20) REFERENCES shipping_services(service_id),
    tarif_per_kg       DECIMAL(10,2),
    estimasi_sla_label VARCHAR(30),
    estimasi_sla_hari  DECIMAL(4,1)
);

INSERT INTO shipping_rates (rate_id, kota_asal, kota_tujuan, service_id, tarif_per_kg, estimasi_sla_label, estimasi_sla_hari) VALUES
(1, 'Bandung',       'Surabaya',    'SRV_REG', 12000.00, '1-2 Hari', 1.5),
(2, 'Bandung',       'Surabaya',    'SRV_NXT', 18000.00, '1 Hari',   1.0),
(3, 'Bandung',       'Surabaya',    'SRV_EKO', 9000.00,  '3-4 Hari', 3.5),
(4, 'Jakarta Pusat', 'Surabaya',    'SRV_EKO', 8000.00,  '3-5 Hari', 4.0),
(5, 'Jakarta Pusat', 'Surabaya',    'SRV_REG', 12000.00, '2-3 Hari', 2.5),
(6, 'Jakarta Pusat', 'Surabaya',    'SRV_SMD', 35000.00, 'Beberapa Jam', 0.3),
(7, 'Surabaya',      'Banjarmasin', 'SRV_EKO', 9500.00,  '3-5 Hari', 4.0),
(8, 'Surabaya',      'Banjarmasin', 'SRV_REG', 13500.00, '2-3 Hari', 2.5),
(9, 'Semarang',      'Makassar',    'SRV_EKO', 10500.00, '3-5 Hari', 4.5),
(10,'Denpasar',      'Palembang',   'SRV_REG', 14500.00, '2-3 Hari', 3.0);

-- ---------------------------------------------------------------------
-- 4. SHIPMENTS  (hasil form input & volumetrik — BR-01, BR-02)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id     VARCHAR(20) PRIMARY KEY,
    kota_asal       VARCHAR(50),
    kota_tujuan     VARCHAR(50),
    berat_kg        DECIMAL(6,2),
    panjang_cm      INT,
    lebar_cm        INT,
    tinggi_cm       INT,
    berat_volume_kg DECIMAL(6,2),
    berat_ditagih   DECIMAL(6,2),
    harga_jual_produk DECIMAL(12,2)
);

INSERT INTO shipments (shipment_id, kota_asal, kota_tujuan, berat_kg, panjang_cm, lebar_cm, tinggi_cm, berat_volume_kg, berat_ditagih, harga_jual_produk) VALUES
('SHP0001', 'Bandung',       'Surabaya',    0.50, 30, 20, 20, 2.00, 2.00, 50000),
('SHP0002', 'Jakarta Pusat', 'Surabaya',    1.20, 20, 15, 10, 0.50, 1.20, 150000),
('SHP0003', 'Surabaya',      'Banjarmasin', 2.28, 14, 29, 15, 1.01, 2.28, 300000),
('SHP0004', 'Jakarta Pusat', 'Surabaya',    0.85, 25, 20, 12, 1.00, 1.00, 220000),
('SHP0005', 'Semarang',      'Makassar',    1.10, 18, 18, 10, 0.60, 1.10, 90000),
('SHP0006', 'Jakarta Pusat', 'Surabaya',    4.80, 35, 30, 20, 3.50, 4.80, 1200000),
('SHP0007', 'Denpasar',      'Palembang',   0.60, 15, 12, 8,  0.24, 0.60, 75000),
('SHP0008', 'Surabaya',      'Banjarmasin', 1.95, 22, 18, 14, 0.92, 1.95, 130000),
('SHP0009', 'Bandung',       'Surabaya',    1.30, 24, 20, 15, 1.20, 1.30, 65000),
('SHP0010', 'Jakarta Pusat', 'Surabaya',    1.50, 24, 20, 15, 1.20, 1.50, 260000);

-- ---------------------------------------------------------------------
-- 5. SHIPMENT_OPTIONS  (komparasi + margin + rekomendasi — BR-05..BR-10)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipment_options (
    option_id              BIGINT PRIMARY KEY,
    shipment_id            VARCHAR(20) REFERENCES shipments(shipment_id),
    service_id             VARCHAR(20) REFERENCES shipping_services(service_id),
    tarif_ongkir            DECIMAL(10,2),
    estimasi_sla            VARCHAR(30),
    status_ketersediaan_rute VARCHAR(20),
    persentase_ongkir       DECIMAL(5,2),
    kategori_risiko_margin  VARCHAR(20),
    selisih_harga_layanan   DECIMAL(10,2),
    selisih_waktu_sla_hari  DECIMAL(4,1),
    is_recommended          BOOLEAN,
    alasan_rekomendasi      VARCHAR(255),
    rule_code_applied       VARCHAR(20)
);

-- Skenario Budi (Bagian 8 AC) dipakai persis pada SHP0001
INSERT INTO shipment_options (option_id, shipment_id, service_id, tarif_ongkir, estimasi_sla, status_ketersediaan_rute, persentase_ongkir, kategori_risiko_margin, selisih_harga_layanan, selisih_waktu_sla_hari, is_recommended, alasan_rekomendasi, rule_code_applied) VALUES
(1, 'SHP0001', 'SRV_EKO', 18000.00, '3-4 Hari',     'Tersedia', 36.0, 'Merah',  0.00,    2.5, TRUE,  'Layanan Ekonomi direkomendasikan untuk menekan rasio ongkir yang tinggi, menghemat Rp 6.000 (25%) dibanding Reguler', 'BR09-R2'),
(2, 'SHP0001', 'SRV_REG', 24000.00, '1-2 Hari',     'Tersedia', 48.0, 'Merah',  6000.00, 0.0, FALSE, NULL, NULL),
(3, 'SHP0001', 'SRV_NXT', 36000.00, '1 Hari',       'Tersedia', 72.0, 'Merah',  18000.00,1.5, FALSE, NULL, NULL),
(4, 'SHP0002', 'SRV_EKO', 9600.00,  '3-5 Hari',     'Tersedia', 6.4,  'Hijau',  0.00,    0.0, TRUE,  'Tarif paling hemat dengan rasio ongkir aman di bawah 15%', 'BR09-R1'),
(5, 'SHP0003', 'SRV_EKO', 11000.00, '3-5 Hari',     'Tersedia', 3.7,  'Hijau',  0.00,    3.7, TRUE,  'Tarif paling hemat, hemat sekitar 69% dibanding opsi lain', 'BR09-R1'),
(6, 'SHP0003', 'SRV_REG', 13500.00, '2-3 Hari',     'Tersedia', 4.5,  'Hijau',  2500.00, 1.2, FALSE, NULL, NULL),
(7, 'SHP0004', 'SRV_REG', 12000.00, '2-3 Hari',     'Tersedia', 5.5,  'Hijau',  0.00,    0.0, TRUE,  'Tarif seimbang antara biaya dan waktu tempuh, delta terhadap baseline <= Rp 10.000', 'BR09-R1'),
(8, 'SHP0005', 'SRV_EKO', 11550.00, '3-5 Hari',     'Tersedia', 12.8, 'Hijau',  0.00,    0.0, TRUE,  'Tarif paling hemat dengan rasio ongkir masih dalam kategori aman', 'BR09-R1'),
(9, 'SHP0006', 'SRV_SMD', 45000.00, 'Beberapa Jam', 'Tersedia', 3.8,  'Hijau',  0.00,    0.0, TRUE,  'Harga jual tinggi dengan rasio ongkir Next Day <= 10%, kecepatan kirim diprioritaskan', 'BR09-R3'),
(10,'SHP0007', 'SRV_REG', 8700.00,  '2-3 Hari',     'Tidak Tersedia', 11.6, 'Hijau', 0.00, 0.0, TRUE, 'Same Day/Next Day tidak tersedia untuk rute ini, Reguler jadi opsi default', 'BR09-DEFAULT'),
(11,'SHP0008', 'SRV_REG', 26325.00, '2-3 Hari',     'Tersedia', 20.2, 'Kuning', 0.00,    0.0, TRUE,  'Tarif seimbang antara biaya dan waktu tempuh, delta terhadap baseline <= Rp 10.000', 'BR09-R1'),
(12,'SHP0009', 'SRV_EKO', 11700.00, '3-4 Hari',     'Tersedia', 18.0, 'Kuning', 0.00,    2.5, TRUE,  'Rasio ongkir masuk kategori kuning, Ekonomi tetap opsi paling hemat', 'BR09-R1'),
(13,'SHP0010', 'SRV_REG', 18000.00, '2-3 Hari',     'Tersedia', 6.9,  'Hijau',  0.00,    0.0, TRUE,  'Tarif seimbang antara biaya dan waktu tempuh, delta terhadap baseline <= Rp 10.000', 'BR09-R1');
