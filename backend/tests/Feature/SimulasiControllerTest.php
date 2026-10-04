<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SimulasiControllerTest extends TestCase
{
    use RefreshDatabase;

    private function calculate(array $overrides = []): \Illuminate\Testing\TestResponse
    {
        $payload = array_merge([
            'kota_asal' => 'Bandung (Jawa Barat)',
            'kota_tujuan' => 'Surabaya (Jawa Timur)',
            'berat_kg' => 2,
            'harga_jual' => 100000,
        ], $overrides);

        return $this->postJson('/api/calculate.php', $payload);
    }

    public function test_agregat_returns_average_margin_per_service(): void
    {
        $this->seed();
        $this->calculate()->assertOk();
        $this->calculate(['berat_kg' => 5])->assertOk();

        $response = $this->getJson('/api/simulasi/agregat');

        $response
            ->assertOk()
            ->assertJsonStructure(['data' => [['service_id', 'nama_layanan', 'rata_rata_margin']]]);

        $serviceIds = collect($response->json('data'))->pluck('service_id')->all();
        $this->assertContains('SRV_EKO', $serviceIds);
    }

    public function test_tabel_returns_paginated_shipment_history(): void
    {
        $this->seed();
        $this->calculate()->assertOk();

        $response = $this->getJson('/api/simulasi/tabel');

        $response
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'per_page'])
            ->assertJsonPath('current_page', 1);

        $firstItem = $response->json('data.0');
        $this->assertArrayHasKey('kota_asal', $firstItem);
        $this->assertArrayHasKey('kota_tujuan', $firstItem);
        $this->assertArrayHasKey('options', $firstItem);
    }

    public function test_tabel_filters_by_date_range(): void
    {
        $this->seed();
        $this->calculate()->assertOk();

        // Filter masa depan → tidak ada data
        $response = $this->getJson('/api/simulasi/tabel?dari=2099-01-01&sampai=2099-12-31');

        $response
            ->assertOk()
            ->assertJsonPath('total', 0);
    }

    public function test_tabel_filters_by_service(): void
    {
        $this->seed();
        $this->calculate()->assertOk();

        $response = $this->getJson('/api/simulasi/tabel?layanan=SRV_EKO');

        $response->assertOk();

        // Pastikan setiap shipment punya opsi SRV_EKO yang recommended
        foreach ($response->json('data') as $shipment) {
            $ekoOptions = collect($shipment['options'])
                ->where('service_id', 'SRV_EKO')
                ->where('is_recommended', true);
            $this->assertNotEmpty($ekoOptions);
        }
    }

    public function test_tabel_eager_loads_relations(): void
    {
        $this->seed();
        $this->calculate()->assertOk();

        $response = $this->getJson('/api/simulasi/tabel');

        $response->assertOk();

        $firstItem = $response->json('data.0');

        // Eager loaded: kotaAsal dan kotaTujuan
        $this->assertNotNull($firstItem['kota_asal']['nama_kota'] ?? null);
        $this->assertNotNull($firstItem['kota_tujuan']['nama_kota'] ?? null);

        // Eager loaded: options.service
        $firstOption = $firstItem['options'][0] ?? null;
        $this->assertNotNull($firstOption);
        $this->assertNotNull($firstOption['service']['nama_layanan'] ?? null);
    }
}
