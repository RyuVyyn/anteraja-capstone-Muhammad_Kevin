# Analisis Bottleneck Hub — Big Data Fundamentals (Day 18)

## 0. Konsep Singkat: 5 Vs of Big Data & Keterbatasan Pandas
| V | Arti | Contoh pada scan_events |
|---|---|---|
| Volume | Jumlah data sangat besar | Jutaan scan per hari dari banyak hub (dataset simulasi: 23,088 baris) |
| Velocity | Data datang terus-menerus dengan cepat | Scan paket terjadi setiap detik |
| Variety | Bentuk data beragam | Log scan, data hub, GPS, foto paket |
| Veracity | Kualitas/keandalan data | Missing scan, duplikat, timestamp terbalik |
| Value | Nilai bisnis yang digali | Menemukan hub bottleneck untuk perbaikan operasional |

Pandas memuat seluruh data ke memori satu komputer, sehingga lambat atau gagal pada data berukuran besar. PySpark/BigQuery membagi pekerjaan ke banyak mesin (terdistribusi) sehingga mampu menangani data yang jauh lebih besar.

## 1. Dataset & Schema
- File: `scan_events.csv` (23,088 baris, 4 kolom, 5,000 package unik, 30 hub)
- Kolom: `hub_id` (string), `package_id` (string), `event_type` (ARRIVAL/DEPARTURE), `timestamp` (YYYY-MM-DD HH:MM:SS)
- Dibaca di PySpark sebagai teks dahulu, lalu `timestamp` dikonversi dengan `to_timestamp` agar timestamp rusak dapat terdeteksi.

## 2. Data Quality Check
| Pemeriksaan | Hasil |
|---|---|
| Total event | 23,088 |
| Nilai kosong (semua kolom) | 0 |
| event_type tidak valid | 0 |
| Timestamp tidak valid | 0 |
| Baris duplikat | 672 |
| Total pasangan package x hub (setelah dedup) | 11,489 |
| Missing ARRIVAL (hanya ada DEPARTURE) | 282 |
| Missing DEPARTURE (hanya ada ARRIVAL) | 280 |
| DEPARTURE sebelum ARRIVAL | 609 |
| Pasangan VALID dipakai analisis | 10,318 |

Langkah pembersihan: duplikat dibuang, event/timestamp tidak valid dibuang, dan hanya pasangan berstatus `VALID` yang dipakai menghitung dwell time.

## 3. Query / Kode PySpark
Kode lengkap ada di `analysis/bottleneck_analysis.ipynb`. Inti perhitungannya:

```python
# Membuat pasangan ARRIVAL -> DEPARTURE per package x hub
pairs = (df_clean.groupBy("package_id", "hub_id")
    .agg(F.min(F.when(F.col("event_type") == "ARRIVAL", F.col("ts"))).alias("arrival_ts"),
         F.max(F.when(F.col("event_type") == "DEPARTURE", F.col("ts"))).alias("departure_ts"))
    .withColumn("dwell_hours", (F.unix_timestamp("departure_ts") - F.unix_timestamp("arrival_ts")) / 3600))

# Filter -> Group -> Aggregate -> Sort
hub_stats = (pairs.filter(F.col("arrival_ts").isNotNull() & F.col("departure_ts").isNotNull()
                          & (F.col("departure_ts") >= F.col("arrival_ts")))
    .groupBy("hub_id")
    .agg(F.count("*").alias("package_count"),
         F.round(F.avg("dwell_hours"), 2).alias("avg_dwell_hours"),
         F.round(F.median("dwell_hours"), 2).alias("median_dwell_hours"))
    .orderBy(F.desc("avg_dwell_hours")))
```

## 4. Hasil Perhitungan Dwell Time
Dwell Time (jam) = DEPARTURE - ARRIVAL, dihitung per kombinasi package_id x hub_id dari pasangan valid.
Rata-rata dwell time keseluruhan: **16.02 jam**.

## 5. Top 5 Bottleneck Hubs
| hub_id | package_count | avg_dwell_hours | median_dwell_hours | total_pairs | invalid_pairs | invalid_pct |
|---|---|---|---|---|---|---|
| HUB-007 | 373 | 39.41 | 39.44 | 410 | 37 | 9.02 |
| HUB-025 | 327 | 39.3 | 39.46 | 360 | 33 | 9.17 |
| HUB-012 | 341 | 39.21 | 39.62 | 387 | 46 | 11.89 |
| HUB-018 | 324 | 38.93 | 39.01 | 360 | 36 | 10.0 |
| HUB-020 | 348 | 13.4 | 13.71 | 395 | 47 | 11.9 |

Keterangan: `invalid_pct` = persentase pasangan scan bermasalah di hub tersebut.

## 6. Business Insight & Rekomendasi Investigasi
HUB-007 memiliki average dwell time tertinggi sebesar 39.4 jam (median 39.4 jam) dari 373 paket valid; median-nya hampir sama dengan average, sehingga keterlambatan bersifat konsisten dan bukan karena segelintir paket ekstrem. Sebagai pembanding, rata-rata dwell time hub di luar Top 5 hanya 12.5 jam. Hub yang menonjol jelas di atas hub lain (>= 1,5x rata-rata hub lainnya) adalah: HUB-007, HUB-025, HUB-012, HUB-018. Kualitas scan di HUB-007 tercatat 9.0% pasangan bermasalah (rata-rata keseluruhan 10.2%), sehingga hasilnya cukup dapat dipercaya. Investigasi selanjutnya sebaiknya difokuskan pada kapasitas sorting, jumlah tenaga kerja/shift, dan alur ARRIVAL-DEPARTURE di hub tersebut, serta memastikan scan DEPARTURE dilakukan tepat waktu.

**Rekomendasi investigasi:**
1. Periksa kapasitas dan antrean area sorting di hub teratas pada jam sibuk.
2. Periksa jumlah petugas/shift dan jadwal keberangkatan armada di hub tersebut.
3. Audit kepatuhan scan DEPARTURE dan perbaiki penyebab missing/duplicate scan.
4. Bandingkan alur ARRIVAL-DEPARTURE hub bottleneck dengan hub normal sebagai acuan.
