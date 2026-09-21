-- =============================================================================
-- DATABASE SCHEMA: Anteraja Shipping Rate Calculator Optimization (MVP)
-- Sistem Decision Support System & Margin Calculator Pengiriman UMKM
-- Dialek SQL: MySQL 8.0+ / PostgreSQL (ANSI SQL Compatible)
-- =============================================================================

DROP TABLE IF EXISTS bisnisaja_leads;
DROP TABLE IF EXISTS shipment_options;
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS shipping_rates;
DROP TABLE IF EXISTS shipping_services;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;

-- -----------------------------------------------------------------------------
-- 1. TABEL USERS (Master Data Pengguna / Penjual UMKM)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    user_id VARCHAR(50) NOT NULL PRIMARY KEY,
    nama_toko VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    no_telepon VARCHAR(20),
    kategori_bisnis VARCHAR(50) DEFAULT 'General Retail',
    tipe_akun VARCHAR(20) DEFAULT 'UMKM' CHECK (tipe_akun IN ('UMKM', 'BisnisAja')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. TABEL LOCATIONS (Master Data Wilayah / Kota)
-- -----------------------------------------------------------------------------
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kota VARCHAR(100) NOT NULL UNIQUE,
    provinsi VARCHAR(100) NOT NULL,
    kode_pos VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. TABEL SHIPPING_SERVICES (Master Opsi Layanan Anteraja)
-- -----------------------------------------------------------------------------
CREATE TABLE shipping_services (
    service_id VARCHAR(20) NOT NULL PRIMARY KEY,
    nama_layanan VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. TABEL SHIPPING_RATES (Master Tarif dasar Pengiriman)
-- -----------------------------------------------------------------------------
CREATE TABLE shipping_rates (
    rate_id INT AUTO_INCREMENT PRIMARY KEY,
    kota_asal VARCHAR(100) NOT NULL,
    kota_tujuan VARCHAR(100) NOT NULL,
    service_id VARCHAR(20) NOT NULL,
    tarif_per_kg DECIMAL(12, 2) NOT NULL,
    estimasi_sla_label VARCHAR(50) NOT NULL,
    estimasi_sla_hari DECIMAL(4, 1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES shipping_services(service_id) ON DELETE CASCADE,
    CONSTRAINT unique_route_service UNIQUE (kota_asal, kota_tujuan, service_id)
);

-- -----------------------------------------------------------------------------
-- 5. TABEL SHIPMENTS (Header Log Pengecekan Pengiriman oleh User)
-- -----------------------------------------------------------------------------
CREATE TABLE shipments (
    shipment_id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    kota_asal VARCHAR(100) NOT NULL,
    kota_tujuan VARCHAR(100) NOT NULL,
    berat_kg DECIMAL(8, 2) NOT NULL,
    panjang_cm INT NOT NULL DEFAULT 0,
    lebar_cm INT NOT NULL DEFAULT 0,
    tinggi_cm INT NOT NULL DEFAULT 0,
    berat_volume_kg DECIMAL(8, 2) NOT NULL,
    berat_chargeable_kg DECIMAL(8, 2) GENERATED ALWAYS AS (GREATEST(berat_kg, berat_volume_kg)) STORED,
    harga_jual_produk DECIMAL(12, 2) NOT NULL,
    timestamp_cek TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 6. TABEL SHIPMENT_OPTIONS (Detail Hasil Kalkulasi Opsi Layanan & Margin)
-- -----------------------------------------------------------------------------
CREATE TABLE shipment_options (
    option_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL,
    service_id VARCHAR(20) NOT NULL,
    tarif_ongkir DECIMAL(12, 2) NOT NULL,
    estimasi_sla VARCHAR(50) NOT NULL,
    persentase_ongkir DECIMAL(5, 2) NOT NULL,
    kategori_risiko_margin VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN persentase_ongkir <= 15.0 THEN 'Hijau'
            WHEN persentase_ongkir <= 30.0 THEN 'Kuning'
            ELSE 'Merah'
        END
    ) STORED,
    selisih_harga_layanan DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selisih_waktu_sla_hari DECIMAL(4, 1) NOT NULL DEFAULT 0.0,
    is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    alasan_rekomendasi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES shipping_services(service_id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 7. TABEL BISNISAJA_LEADS (Pelacakan Volume User & Lead Trigger BisnisAja)
-- -----------------------------------------------------------------------------
CREATE TABLE bisnisaja_leads (
    lead_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    bulan_tahun VARCHAR(7) NOT NULL, -- Format YYYY-MM
    frekuensi_cek_bulanan INT NOT NULL DEFAULT 0,
    flag_upsell_bisnisaja BOOLEAN GENERATED ALWAYS AS (frekuensi_cek_bulanan >= 20) STORED,
    status_lead VARCHAR(30) DEFAULT 'Identified' CHECK (status_lead IN ('Identified', 'Contacted', 'Converted', 'Closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_month UNIQUE (user_id, bulan_tahun)
);

-- =============================================================================
-- INDEXES UNTUK OPTIMASI PERFORMA QUERY
-- =============================================================================
CREATE INDEX idx_shipments_user ON shipments(user_id);
CREATE INDEX idx_shipments_timestamp ON shipments(timestamp_cek);
CREATE INDEX idx_shipment_options_shipment ON shipment_options(shipment_id);
CREATE INDEX idx_shipment_options_recommended ON shipment_options(shipment_id, is_recommended);
CREATE INDEX idx_leads_flag ON bisnisaja_leads(flag_upsell_bisnisaja, status_lead);

-- =============================================================================
-- DATA SEEDING (MASTER DATA AWAL)
-- =============================================================================
INSERT INTO shipping_services (service_id, nama_layanan, deskripsi) VALUES
('ECO', 'Ekonomi', 'Layanan hemat biaya untuk paket tidak mendesak'),
('REG', 'Reguler', 'Layanan pengiriman standar ke seluruh Indonesia'),
('ND', 'Next Day', 'Layanan jaminan sampai keesokan hari'),
('SD', 'Same Day', 'Layanan pengiriman cepat tiba di hari yang sama');

INSERT INTO locations (nama_kota, provinsi) VALUES
('Jakarta Selatan', 'DKI Jakarta'),
('Surabaya', 'Jawa Timur'),
('Bandung', 'Jawa Barat'),
('Banjarmasin', 'Kalimantan Selatan'),
('Medan', 'Sumatera Utara');

-- =============================================================================
-- SAMPLE VIEW: REKAPUTULASI SUMMARY SHIPMENT DENGAN OPTIMAL RECOMMENDED SERVICE
-- =============================================================================
CREATE VIEW v_shipment_recommendation_summary AS
SELECT 
    s.shipment_id,
    s.user_id,
    s.kota_asal,
    s.kota_tujuan,
    s.berat_chargeable_kg,
    s.harga_jual_produk,
    so.service_id,
    ss.nama_layanan AS layanan_direkomendasikan,
    so.tarif_ongkir,
    so.estimasi_sla,
    so.persentase_ongkir,
    so.kategori_risiko_margin,
    so.alasan_rekomendasi,
    s.timestamp_cek
FROM shipments s
JOIN shipment_options so ON s.shipment_id = so.shipment_id
JOIN shipping_services ss ON so.service_id = ss.service_id
WHERE so.is_recommended = TRUE;
