<?php

namespace Tests\Unit;

use App\Services\RecommendationEngine;
use PHPUnit\Framework\TestCase;

class RecommendationEngineTest extends TestCase
{
    public function test_regular_rule_preserves_cheapest_comparison_reason(): void
    {
        $result = (new RecommendationEngine)->pilih([
            $this->option('SRV_REG', 'Reguler', 24000, 20, 'Kuning', 6000, '1-2 Hari'),
            $this->option('SRV_EKO', 'Ekonomi', 18000, 15, 'Kuning', 0, '3-4 Hari'),
            $this->option('SRV_NXT', 'Next Day', 36000, 30, 'Merah', 18000, '1 Hari'),
        ], 2, 120000);

        $this->assertRecommendation($result, 'SRV_REG', 'BR09-R1');
        $this->assertStringContainsString('Rp 6.000 lebih mahal daripada Ekonomi', $result['reason']);
    }

    public function test_economy_is_selected_when_all_services_are_red(): void
    {
        $result = (new RecommendationEngine)->pilih([
            $this->option('SRV_REG', 'Reguler', 24000, 48, 'Merah', 6000, '1-2 Hari'),
            $this->option('SRV_EKO', 'Ekonomi', 18000, 36, 'Merah', 0, '3-4 Hari'),
            $this->option('SRV_NXT', 'Next Day', 36000, 72, 'Merah', 18000, '1 Hari'),
        ], 2, 50000);

        $this->assertRecommendation($result, 'SRV_EKO', 'BR09-R2');
    }

    public function test_economy_is_selected_for_heavy_packages(): void
    {
        $result = (new RecommendationEngine)->pilih([
            $this->option('SRV_REG', 'Reguler', 24000, 35, 'Merah', 6000, '1-2 Hari'),
            $this->option('SRV_EKO', 'Ekonomi', 18000, 25, 'Kuning', 0, '3-4 Hari'),
            $this->option('SRV_NXT', 'Next Day', 36000, 45, 'Merah', 18000, '1 Hari'),
        ], 6, 100000);

        $this->assertRecommendation($result, 'SRV_EKO', 'BR09-R2');
    }

    public function test_next_day_is_selected_for_high_value_products_with_low_ratio(): void
    {
        $result = (new RecommendationEngine)->pilih([
            $this->option('SRV_REG', 'Reguler', 24000, 35, 'Merah', 6000, '1-2 Hari'),
            $this->option('SRV_EKO', 'Ekonomi', 18000, 25, 'Kuning', 0, '3-4 Hari'),
            $this->option('SRV_NXT', 'Next Day', 36000, 9, 'Hijau', 18000, '1 Hari'),
        ], 2, 1200000);

        $this->assertRecommendation($result, 'SRV_NXT', 'BR09-R3');
    }

    public function test_regular_is_the_default_when_no_priority_rule_matches(): void
    {
        $result = (new RecommendationEngine)->pilih([
            $this->option('SRV_REG', 'Reguler', 24000, 35, 'Merah', 6000, '1-2 Hari'),
            $this->option('SRV_EKO', 'Ekonomi', 18000, 25, 'Kuning', 0, '3-4 Hari'),
            $this->option('SRV_NXT', 'Next Day', 36000, 30, 'Merah', 18000, '1 Hari'),
        ], 2, 120000);

        $this->assertRecommendation($result, 'SRV_REG', 'BR09-DEFAULT');
    }

    public function test_no_recommendation_is_returned_without_regular_service(): void
    {
        $result = (new RecommendationEngine)->pilih([
            $this->option('SRV_EKO', 'Ekonomi', 18000, 20, 'Kuning', 0, '3-4 Hari'),
        ], 2, 120000);

        $this->assertNull($result);
    }

    private function option(
        string $serviceId,
        string $name,
        float $price,
        float $ratio,
        string $category,
        float $difference,
        string $sla,
    ): array {
        return [
            'service_id' => $serviceId,
            'nama_layanan' => $name,
            'tarif_ongkir' => $price,
            'persentase_ongkir' => $ratio,
            'kategori_risiko_margin' => $category,
            'selisih_harga_layanan' => $difference,
            'estimasi_sla' => $sla,
        ];
    }

    private function assertRecommendation(?array $result, string $serviceId, string $ruleCode): void
    {
        $this->assertNotNull($result);
        $this->assertSame($serviceId, $result['service_id']);
        $this->assertSame($ruleCode, $result['rule_code']);
    }
}
