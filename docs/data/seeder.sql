-- PostgreSQL reference seed. Laravel's ShippingDataSeeder is authoritative.
-- Run schema.sql first. Shipment history is created by the API, not seeded.

INSERT INTO locations (location_id, nama_kota, provinsi, kode_pos) VALUES
(1, 'KOTA JAKARTA PUSAT', 'DKI JAKARTA', '10110'),
(2, 'KOTA SURABAYA', 'JAWA TIMUR', '60119'),
(3, 'KOTA BANDUNG', 'JAWA BARAT', '40111'),
(4, 'KOTA MEDAN', 'SUMATERA UTARA', '20111'),
(5, 'KOTA SEMARANG', 'JAWA TENGAH', '50131'),
(6, 'KOTA MAKASSAR', 'SULAWESI SELATAN', '90111'),
(7, 'KOTA DENPASAR', 'BALI', '80113'),
(8, 'KOTA PALEMBANG', 'SUMATERA SELATAN', '30111'),
(9, 'KOTA BANJARMASIN', 'KALIMANTAN SELATAN', '70111'),
(10, 'KOTA SAMARINDA', 'KALIMANTAN TIMUR', '75111');

SELECT setval(
    pg_get_serial_sequence('locations', 'location_id'),
    (SELECT MAX(location_id) FROM locations)
);

INSERT INTO shipping_services (service_id, nama_layanan, deskripsi, is_active) VALUES
('SRV_EKO', 'Ekonomi', 'Layanan paling hemat, estimasi 3-4 hari', TRUE),
('SRV_REG', 'Reguler', 'Layanan standar, estimasi 1-2 hari', TRUE),
('SRV_NXT', 'Next Day', 'Sampai keesokan hari, estimasi 1 hari', TRUE),
('SRV_SMD', 'Same Day', 'Sampai di hari yang sama, estimasi beberapa jam', TRUE),
('SRV_INT', 'Instant', 'Diantar dalam hitungan jam via kurir motor', TRUE),
('SRV_CGO', 'Kargo', 'Untuk pengiriman berat/volume besar', TRUE),
('SRV_TRK', 'Trucking', 'Pengiriman via truk untuk kota besar', FALSE),
('SRV_KAI', 'Kereta', 'Pengiriman via kereta logistik', TRUE),
('SRV_LAU', 'Laut', 'Pengiriman via kapal laut, biaya rendah', TRUE),
('SRV_UDR', 'Udara', 'Pengiriman via pesawat, tercepat lintas pulau', TRUE);

INSERT INTO shipping_rates (
    kota_asal_id,
    kota_tujuan_id,
    service_id,
    tarif_per_kg,
    estimasi_sla_label,
    estimasi_sla_hari
)
SELECT
    asal.location_id,
    tujuan.location_id,
    layanan.service_id,
    FLOOR((
        (8000 + ABS(asal.location_id - tujuan.location_id) * 750
            + (asal.location_id + tujuan.location_id) * 125)
        * CASE layanan.service_id
            WHEN 'SRV_EKO' THEN 1.0
            WHEN 'SRV_REG' THEN 1.35
            WHEN 'SRV_NXT' THEN 1.9
            ELSE 2.5
          END + 50
    ) / 100) * 100,
    CASE layanan.service_id
        WHEN 'SRV_EKO' THEN '3-5 Hari'
        WHEN 'SRV_REG' THEN '2-3 Hari'
        WHEN 'SRV_NXT' THEN '1 Hari'
        ELSE 'Beberapa Jam'
    END,
    CASE layanan.service_id
        WHEN 'SRV_EKO' THEN 4.0
        WHEN 'SRV_REG' THEN 2.5
        WHEN 'SRV_NXT' THEN 1.0
        ELSE 0.3
    END
FROM locations AS asal
CROSS JOIN locations AS tujuan
JOIN shipping_services AS layanan
    ON layanan.service_id IN ('SRV_EKO', 'SRV_REG', 'SRV_NXT', 'SRV_SMD')
WHERE asal.location_id <> tujuan.location_id
  AND layanan.is_active = TRUE;
