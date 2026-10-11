<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table): void {
            $table->id('location_id');
            $table->string('nama_kota', 100);
            $table->string('provinsi', 100);
            $table->string('kode_pos', 10)->nullable();
            $table->unique(['nama_kota', 'provinsi']);
        });

        Schema::create('shipping_services', function (Blueprint $table): void {
            $table->string('service_id', 20)->primary();
            $table->string('nama_layanan', 50);
            $table->string('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
        });

        Schema::create('shipping_rates', function (Blueprint $table): void {
            $table->id('rate_id');
            $table->foreignId('kota_asal_id')->constrained('locations', 'location_id');
            $table->foreignId('kota_tujuan_id')->constrained('locations', 'location_id');
            $table->string('service_id', 20);
            $table->foreign('service_id')->references('service_id')->on('shipping_services');
            $table->decimal('tarif_per_kg', 10, 2);
            $table->string('estimasi_sla_label', 30)->nullable();
            $table->decimal('estimasi_sla_hari', 4, 1)->nullable();
            $table->unique(['kota_asal_id', 'kota_tujuan_id', 'service_id']);
        });

        Schema::create('shipments', function (Blueprint $table): void {
            $table->string('shipment_id', 30)->primary();
            $table->foreignId('kota_asal_id')->constrained('locations', 'location_id');
            $table->foreignId('kota_tujuan_id')->constrained('locations', 'location_id');
            $table->decimal('berat_kg', 6, 2);
            $table->unsignedInteger('panjang_cm')->nullable();
            $table->unsignedInteger('lebar_cm')->nullable();
            $table->unsignedInteger('tinggi_cm')->nullable();
            $table->decimal('berat_volume_kg', 6, 2)->nullable();
            $table->decimal('berat_ditagih', 6, 2);
            $table->decimal('harga_jual_produk', 12, 2);
        });

        Schema::create('shipment_options', function (Blueprint $table): void {
            $table->id('option_id');
            $table->string('shipment_id', 30);
            $table->foreign('shipment_id')->references('shipment_id')->on('shipments');
            $table->string('service_id', 20);
            $table->foreign('service_id')->references('service_id')->on('shipping_services');
            $table->decimal('tarif_ongkir', 10, 2);
            $table->string('estimasi_sla', 30)->nullable();
            $table->string('status_ketersediaan_rute', 20)->default('Tersedia');
            $table->decimal('persentase_ongkir', 5, 2)->nullable();
            $table->string('kategori_risiko_margin', 20)->nullable();
            $table->decimal('selisih_harga_layanan', 10, 2)->nullable();
            $table->decimal('selisih_waktu_sla_hari', 4, 1)->nullable();
            $table->boolean('is_recommended')->default(false);
            $table->string('alasan_rekomendasi')->nullable();
            $table->string('rule_code_applied', 20)->nullable();
            $table->unique(['shipment_id', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_options');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('shipping_rates');
        Schema::dropIfExists('shipping_services');
        Schema::dropIfExists('locations');
    }
};
