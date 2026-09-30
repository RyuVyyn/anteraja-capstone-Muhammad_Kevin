# Shipping Rate Calculator ERD

```mermaid
erDiagram
    LOCATIONS ||--o{ SHIPPING_RATES : origin
    LOCATIONS ||--o{ SHIPPING_RATES : destination
    SHIPPING_SERVICES ||--o{ SHIPPING_RATES : prices
    LOCATIONS ||--o{ SHIPMENTS : origin
    LOCATIONS ||--o{ SHIPMENTS : destination
    SHIPMENTS ||--o{ SHIPMENT_OPTIONS : has
    SHIPPING_SERVICES ||--o{ SHIPMENT_OPTIONS : selected

    LOCATIONS {
        bigint location_id PK
        string nama_kota
        string provinsi
        string kode_pos
    }
    SHIPPING_SERVICES {
        string service_id PK
        string nama_layanan
        string deskripsi
        boolean is_active
    }
    SHIPPING_RATES {
        bigint rate_id PK
        bigint kota_asal_id FK
        bigint kota_tujuan_id FK
        string service_id FK
        decimal tarif_per_kg
        string estimasi_sla_label
        decimal estimasi_sla_hari
    }
    SHIPMENTS {
        string shipment_id PK
        bigint kota_asal_id FK
        bigint kota_tujuan_id FK
        decimal berat_kg
        decimal berat_volume_kg
        decimal berat_ditagih
        decimal harga_jual_produk
    }
    SHIPMENT_OPTIONS {
        bigint option_id PK
        string shipment_id FK
        string service_id FK
        decimal tarif_ongkir
        decimal persentase_ongkir
        decimal selisih_waktu_sla_hari
        string kategori_risiko_margin
        boolean is_recommended
        string rule_code_applied
    }
```

The API continues to accept city/province labels from the React form. Laravel resolves those labels to `locations.location_id`, then uses foreign keys for rate lookup and shipment history. PostgreSQL migrations under `backend/database/migrations` are authoritative for this diagram.