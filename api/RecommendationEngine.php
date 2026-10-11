<?php

class RecommendationEngine
{
    private $maxRegularRatio;
    private $maxRegularPriceDifference;
    private $economyWeightThreshold;
    private $nextDayPriceThreshold;
    private $maxNextDayRatio;

    public function __construct(
        $maxRegularRatio = 30,
        $maxRegularPriceDifference = 10000,
        $economyWeightThreshold = 5,
        $nextDayPriceThreshold = 1000000,
        $maxNextDayRatio = 10
    ) {
        $this->maxRegularRatio = $maxRegularRatio;
        $this->maxRegularPriceDifference = $maxRegularPriceDifference;
        $this->economyWeightThreshold = $economyWeightThreshold;
        $this->nextDayPriceThreshold = $nextDayPriceThreshold;
        $this->maxNextDayRatio = $maxNextDayRatio;
    }

    public function pilih($options, $beratDitagih, $hargaJual)
    {
        $byServiceId = [];
        $cheapest = null;
        $allServicesRed = count($options) > 0;

        foreach ($options as $option) {
            $byServiceId[$option['service_id']] = $option;

            if ($cheapest === null || $option['tarif_ongkir'] < $cheapest['tarif_ongkir']) {
                $cheapest = $option;
            }

            if ($option['kategori_risiko_margin'] === 'Merah') {
                continue;
            }

            $allServicesRed = false;
        }

        $regular = $byServiceId['SRV_REG'] ?? null;
        $economy = $byServiceId['SRV_EKO'] ?? null;
        $nextDay = $byServiceId['SRV_NXT'] ?? null;

        if (
            $regular
            && $regular['persentase_ongkir'] <= $this->maxRegularRatio
            && $regular['selisih_harga_layanan'] <= $this->maxRegularPriceDifference
        ) {
            $priceDifference = floatval($regular['selisih_harga_layanan']);
            $reason = $priceDifference > 0
                ? 'Reguler lebih cocok untuk pesanan ini. Ongkirnya hanya Rp ' . number_format($priceDifference, 0, ',', '.') . ' lebih mahal daripada ' . $cheapest['nama_layanan'] . ', dengan estimasi tiba ' . $regular['estimasi_sla'] . '.'
                : 'Reguler lebih cocok untuk pesanan ini karena menjadi layanan dengan ongkir termurah, dengan estimasi tiba ' . $regular['estimasi_sla'] . '.';

            return [
                'service_id' => 'SRV_REG',
                'rule_code' => 'BR09-R1',
                'reason' => $reason,
            ];
        }

        if ($economy && ($allServicesRed || $beratDitagih > $this->economyWeightThreshold)) {
            $reasons = [];
            if ($allServicesRed) {
                $reasons[] = 'ongkir pada semua layanan yang tersedia cukup besar dibanding harga barang';
            }
            if ($beratDitagih > $this->economyWeightThreshold) {
                $reasons[] = 'paket ini memiliki berat tertagih ' . $beratDitagih . ' kg';
            }

            return [
                'service_id' => 'SRV_EKO',
                'rule_code' => 'BR09-R2',
                'reason' => 'Ekonomi lebih cocok untuk pesanan ini karena ' . implode(' dan ', $reasons) . '.',
            ];
        }

        if (
            $nextDay
            && $hargaJual > $this->nextDayPriceThreshold
            && $nextDay['persentase_ongkir'] <= $this->maxNextDayRatio
        ) {
            return [
                'service_id' => 'SRV_NXT',
                'rule_code' => 'BR09-R3',
                'reason' => 'Next Day cocok untuk barang bernilai tinggi ini. Ongkirnya hanya ' . $nextDay['persentase_ongkir'] . '% dari harga barang, dengan estimasi tiba ' . $nextDay['estimasi_sla'] . '.',
            ];
        }

        if ($regular) {
            return [
                'service_id' => 'SRV_REG',
                'rule_code' => 'BR09-DEFAULT',
                'reason' => 'Reguler adalah pilihan standar untuk rute ini, dengan estimasi tiba ' . $regular['estimasi_sla'] . '.',
            ];
        }

        return null;
    }
}
