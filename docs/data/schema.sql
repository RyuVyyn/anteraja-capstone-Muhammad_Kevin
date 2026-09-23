-- =====================================================================
-- SCHEMA — Kalkulator Ongkir Anteraja (versi trimmed)
-- Mengacu pada frd_gabungan_anteraja.md
-- 5 tabel: locations, shipping_services, shipping_rates,
--          shipments, shipment_options
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. LOCATIONS
-- Master kota/kecamatan untuk autocomplete kota asal & tujuan (BR-03)
-- ---------------------------------------------------------------------
CREATE TABLE locations (
    location_id  INT PRIMARY KEY,
    nama_kota    VARCHAR(50)  NOT NULL,
    provinsi     VARCHAR(50)  NOT NULL,
    kode_pos     VARCHAR(10)
);

-- ---------------------------------------------------------------------
-- 2. SHIPPING_SERVICES
-- Master jenis layanan pengiriman Anteraja (Ekonomi, Reguler, dst.)
-- ---------------------------------------------------------------------
CREATE TABLE shipping_services (
    service_id   VARCHAR(20) PRIMARY KEY,
    nama_layanan VARCHAR(50)  NOT NULL,
    deskripsi    VARCHAR(255),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- 3. SHIPPING_RATES
-- Master tarif per kg & SLA untuk tiap kombinasi rute + layanan (BR-04, BR-05)
-- ---------------------------------------------------------------------
CREATE TABLE shipping_rates (
    rate_id            INT PRIMARY KEY,
    kota_asal          VARCHAR(50) NOT NULL,
    kota_tujuan        VARCHAR(50) NOT NULL,
    service_id         VARCHAR(20) NOT NULL REFERENCES shipping_services(service_id),
    tarif_per_kg       DECIMAL(10,2) NOT NULL,
    estimasi_sla_label VARCHAR(30),
    estimasi_sla_hari  DECIMAL(4,1)
);

-- ---------------------------------------------------------------------
-- 4. SHIPMENTS
-- Satu baris = satu kali proses hitung ongkir (hasil Form Input & Volumetrik, BR-01, BR-02)
-- ---------------------------------------------------------------------
CREATE TABLE shipments (
    shipment_id       VARCHAR(20) PRIMARY KEY,
    kota_asal         VARCHAR(50) NOT NULL,
    kota_tujuan       VARCHAR(50) NOT NULL,
    berat_kg          DECIMAL(6,2) NOT NULL,
    panjang_cm        INT,
    lebar_cm          INT,
    tinggi_cm         INT,
    berat_volume_kg   DECIMAL(6,2),
    berat_ditagih     DECIMAL(6,2) NOT NULL,
    harga_jual_produk DECIMAL(12,2) NOT NULL
);

-- ---------------------------------------------------------------------
-- 5. SHIPMENT_OPTIONS
-- Satu baris = satu kartu opsi layanan dalam perbandingan (Perbandingan
-- Layanan, Kalkulator Margin, Engine Rekomendasi -- BR-05 s.d. BR-10)
-- ---------------------------------------------------------------------
CREATE TABLE shipment_options (
    option_id                BIGINT PRIMARY KEY,
    shipment_id               VARCHAR(20) NOT NULL REFERENCES shipments(shipment_id),
    service_id                VARCHAR(20) NOT NULL REFERENCES shipping_services(service_id),
    tarif_ongkir               DECIMAL(10,2) NOT NULL,
    estimasi_sla               VARCHAR(30),
    status_ketersediaan_rute  VARCHAR(20) NOT NULL DEFAULT 'Tersedia',
    persentase_ongkir          DECIMAL(5,2),
    kategori_risiko_margin     VARCHAR(20),
    selisih_harga_layanan      DECIMAL(10,2),
    selisih_waktu_sla_hari     DECIMAL(4,1),
    is_recommended             BOOLEAN NOT NULL DEFAULT FALSE,
    alasan_rekomendasi         VARCHAR(255),
    rule_code_applied          VARCHAR(20)
);
