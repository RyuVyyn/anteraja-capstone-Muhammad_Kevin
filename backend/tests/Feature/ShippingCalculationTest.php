<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ShippingCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_calculates_shipping_for_frontend_location_labels(): void
    {
        $this->seed();

        $response = $this->postJson('/api/calculate.php', [
            'kota_asal' => 'Bandung (Jawa Barat)',
            'kota_tujuan' => 'Surabaya (Jawa Timur)',
            'berat_kg' => 0.5,
            'panjang_cm' => 30,
            'lebar_cm' => 20,
            'tinggi_cm' => 20,
            'harga_jual' => 50000,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('kota_asal', 'Bandung (Jawa Barat)')
            ->assertJsonPath('kota_tujuan', 'Surabaya (Jawa Timur)')
            ->assertJsonPath('berat_volume_kg', 2)
            ->assertJsonPath('berat_ditagih', 2)
            ->assertJsonPath('recommendation.service_id', 'SRV_EKO')
            ->assertJsonCount(4, 'options');

        $this->assertDatabaseHas('shipments', [
            'kota_asal_id' => 3,
            'kota_tujuan_id' => 2,
            'berat_ditagih' => 2,
        ]);
        $this->assertDatabaseCount('shipment_options', 4);
    }

    public function test_it_resolves_city_aliases_without_province_labels(): void
    {
        $this->seed();

        $this->postJson('/api/calculate.php', [
            'kota_asal' => 'Jakarta Pusat',
            'kota_tujuan' => 'KOTA Surabaya',
            'berat_kg' => 1,
            'harga_jual' => 100000,
        ])
            ->assertOk()
            ->assertJsonPath('kota_asal', 'Jakarta Pusat')
            ->assertJsonPath('kota_tujuan', 'KOTA Surabaya');

        $this->assertDatabaseHas('shipments', [
            'kota_asal_id' => 1,
            'kota_tujuan_id' => 2,
        ]);
    }

    public function test_it_rejects_empty_json_with_the_legacy_error_shape(): void
    {
        $this->postJson('/api/calculate.php', [])
            ->assertStatus(400)
            ->assertJsonPath('error', 'Data input tidak valid atau kosong.');
    }

    public function test_it_rejects_unknown_locations_without_persisting_a_shipment(): void
    {
        $this->seed();

        $this->postJson('/api/calculate.php', [
            'kota_asal' => 'Kota Fiktif (Provinsi Fiktif)',
            'kota_tujuan' => 'Surabaya (Jawa Timur)',
            'berat_kg' => 1,
            'harga_jual' => 100000,
        ])
            ->assertUnprocessable()
            ->assertJsonPath('error', 'Kota asal atau kota tujuan belum tersedia.');

        $this->assertDatabaseCount('shipments', 0);
    }

    public function test_it_returns_an_empty_options_list_for_a_route_without_rates(): void
    {
        $this->seed();

        $this->postJson('/api/calculate.php', [
            'kota_asal' => 'Bandung (Jawa Barat)',
            'kota_tujuan' => 'Bandung (Jawa Barat)',
            'berat_kg' => 1,
            'harga_jual' => 100000,
        ])
            ->assertOk()
            ->assertJsonPath('recommendation', null)
            ->assertJsonCount(0, 'options');

        $this->assertDatabaseCount('shipments', 1);
        $this->assertDatabaseCount('shipment_options', 0);
    }

    public function test_it_rolls_back_the_shipment_when_an_option_cannot_be_saved(): void
    {
        $this->seed();
        DB::statement("CREATE TRIGGER reject_options BEFORE INSERT ON shipment_options BEGIN SELECT RAISE(ABORT, 'forced failure'); END");

        $this->postJson('/api/calculate.php', [
            'kota_asal' => 'Bandung (Jawa Barat)',
            'kota_tujuan' => 'Surabaya (Jawa Timur)',
            'berat_kg' => 1,
            'harga_jual' => 100000,
        ])
            ->assertStatus(500)
            ->assertJsonPath('error', 'Gagal menyimpan data kalkulasi.');

        $this->assertDatabaseCount('shipments', 0);
        $this->assertDatabaseCount('shipment_options', 0);
    }
}
