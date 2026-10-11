<?php
require_once __DIR__ . '/RecommendationEngine.php';

function makeOption($serviceId, $name, $price, $ratio, $category, $difference, $sla)
{
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

function checkRecommendation($label, $actual, $serviceId, $ruleCode)
{
    if ($actual === null || $actual['service_id'] !== $serviceId || $actual['rule_code'] !== $ruleCode) {
        throw new RuntimeException($label . ' failed');
    }

    echo 'PASS ' . $label . PHP_EOL;
}

$engine = new RecommendationEngine();

$regular = makeOption('SRV_REG', 'Reguler', 24000, 20, 'Kuning', 6000, '1-2 Hari');
$economy = makeOption('SRV_EKO', 'Ekonomi', 18000, 15, 'Kuning', 0, '3-4 Hari');
$nextDay = makeOption('SRV_NXT', 'Next Day', 36000, 30, 'Merah', 18000, '1 Hari');

$result = $engine->pilih([$regular, $economy, $nextDay], 2, 120000);
checkRecommendation('BR09-R1 Regular', $result, 'SRV_REG', 'BR09-R1');
if (strpos($result['reason'], 'Rp 6.000 lebih mahal daripada Ekonomi') === false) {
    throw new RuntimeException('Cheapest service loop failed');
}

$allRedOptions = [
    makeOption('SRV_REG', 'Reguler', 24000, 48, 'Merah', 6000, '1-2 Hari'),
    makeOption('SRV_EKO', 'Ekonomi', 18000, 36, 'Merah', 0, '3-4 Hari'),
    makeOption('SRV_NXT', 'Next Day', 36000, 72, 'Merah', 18000, '1 Hari'),
];
checkRecommendation('BR09-R2 All red', $engine->pilih($allRedOptions, 2, 50000), 'SRV_EKO', 'BR09-R2');

$heavyOptions = [
    makeOption('SRV_REG', 'Reguler', 24000, 35, 'Merah', 6000, '1-2 Hari'),
    makeOption('SRV_EKO', 'Ekonomi', 18000, 25, 'Kuning', 0, '3-4 Hari'),
    makeOption('SRV_NXT', 'Next Day', 36000, 45, 'Merah', 18000, '1 Hari'),
];
checkRecommendation('BR09-R2 Heavy package', $engine->pilih($heavyOptions, 6, 100000), 'SRV_EKO', 'BR09-R2');

$nextDayOptions = [
    makeOption('SRV_REG', 'Reguler', 24000, 35, 'Merah', 6000, '1-2 Hari'),
    makeOption('SRV_EKO', 'Ekonomi', 18000, 25, 'Kuning', 0, '3-4 Hari'),
    makeOption('SRV_NXT', 'Next Day', 36000, 9, 'Hijau', 18000, '1 Hari'),
];
checkRecommendation('BR09-R3 Next Day', $engine->pilih($nextDayOptions, 2, 1200000), 'SRV_NXT', 'BR09-R3');

$fallbackOptions = [
    makeOption('SRV_REG', 'Reguler', 24000, 35, 'Merah', 6000, '1-2 Hari'),
    makeOption('SRV_EKO', 'Ekonomi', 18000, 25, 'Kuning', 0, '3-4 Hari'),
    makeOption('SRV_NXT', 'Next Day', 36000, 30, 'Merah', 18000, '1 Hari'),
];
checkRecommendation('BR09 Default Regular', $engine->pilih($fallbackOptions, 2, 120000), 'SRV_REG', 'BR09-DEFAULT');

$noRegular = [makeOption('SRV_EKO', 'Ekonomi', 18000, 20, 'Kuning', 0, '3-4 Hari')];
if ($engine->pilih($noRegular, 2, 120000) !== null) {
    throw new RuntimeException('No recommendation case failed');
}
echo 'PASS No recommendation' . PHP_EOL;
