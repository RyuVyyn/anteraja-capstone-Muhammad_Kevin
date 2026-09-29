<?php
/**
 * API Endpoint: Kalkulator Ongkir Anteraja
 *
 * Menerima data pengiriman dari React frontend,
 * menghitung berat volumetrik & berat ditagih,
 * query tarif dari database, hitung margin,
 * simpan ke tabel shipments & shipment_options,
 * dan kembalikan hasilnya sebagai JSON.
 *
 * Alur: React (form submit) -> POST /api/calculate.php -> JSON response -> React (render cards)
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight CORS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Hanya terima POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Gunakan POST."]);
    exit();
}

// =====================================================================
// 1. AMBIL INPUT DARI REACT
// =====================================================================
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Data input tidak valid atau kosong."]);
    exit();
}

$kotaAsal   = trim($input['kota_asal']   ?? '');
$kotaTujuan = trim($input['kota_tujuan'] ?? '');
$beratKg    = floatval($input['berat_kg']     ?? 0);
$panjangCm  = intval($input['panjang_cm']   ?? 0);
$lebarCm    = intval($input['lebar_cm']     ?? 0);
$tinggiCm   = intval($input['tinggi_cm']    ?? 0);
$hargaJual  = floatval($input['harga_jual']   ?? 0);

// Validasi minimum
if (empty($kotaAsal) || empty($kotaTujuan)) {
    http_response_code(422);
    echo json_encode(["error" => "Kota asal dan kota tujuan wajib diisi."]);
    exit();
}
if ($beratKg <= 0) {
    http_response_code(422);
    echo json_encode(["error" => "Berat fisik harus lebih dari 0."]);
    exit();
}
if ($hargaJual <= 0) {
    http_response_code(422);
    echo json_encode(["error" => "Harga jual produk harus lebih dari 0."]);
    exit();
}

// =====================================================================
// 2. KALKULASI VOLUMETRIK (BR-01)
// =====================================================================
function hitungBeratVolume($p, $l, $t) {
    if ($p <= 0 || $l <= 0 || $t <= 0) return 0;
    return round(($p * $l * $t) / 6000, 2);
}

function hitungBeratDitagih($beratKg, $beratVolume) {
    // Berat ditagih = angka terbesar, dibulatkan ke atas per 1 kg
    return ceil(max($beratKg, $beratVolume));
}

$beratVolume  = hitungBeratVolume($panjangCm, $lebarCm, $tinggiCm);
$beratDitagih = hitungBeratDitagih($beratKg, $beratVolume);

// =====================================================================
// 3. KONEKSI DATABASE (SQLite)
// =====================================================================
$dbPath = __DIR__ . '/anteraja.db';

try {
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Koneksi database gagal: " . $e->getMessage()]);
    exit();
}

// =====================================================================
// 4. QUERY TARIF DARI shipping_rates
// =====================================================================
$stmt = $db->prepare("
    SELECT
        sr.rate_id,
        sr.service_id,
        ss.nama_layanan,
        ss.deskripsi,
        sr.tarif_per_kg,
        sr.estimasi_sla_label,
        sr.estimasi_sla_hari
    FROM shipping_rates sr
    JOIN shipping_services ss ON sr.service_id = ss.service_id
    WHERE sr.kota_asal = :asal
      AND sr.kota_tujuan = :tujuan
      AND ss.is_active = 1
    ORDER BY sr.tarif_per_kg ASC
");
$stmt->execute([':asal' => $kotaAsal, ':tujuan' => $kotaTujuan]);
$rates = $stmt->fetchAll(PDO::FETCH_ASSOC);

// =====================================================================
// 5. HITUNG ONGKIR & MARGIN PER LAYANAN
// =====================================================================
$options = [];
$tarifTermurah = null;

foreach ($rates as $rate) {
    $totalOngkir    = $rate['tarif_per_kg'] * $beratDitagih;
    $persentaseOngkir = round(($totalOngkir / $hargaJual) * 100, 1);

    // Kategori risiko margin sesuai FRD-03 (Hijau ≤15%, Kuning 15-30%, Merah >30%)
    if ($persentaseOngkir > 30) {
        $kategori = 'Merah';
    } elseif ($persentaseOngkir > 15) {
        $kategori = 'Kuning';
    } else {
        $kategori = 'Hijau';
    }

    if ($tarifTermurah === null) {
        $tarifTermurah = $totalOngkir;
    }

    $options[] = [
        'service_id'              => $rate['service_id'],
        'nama_layanan'            => $rate['nama_layanan'],
        'deskripsi'               => $rate['deskripsi'],
        'tarif_per_kg'            => floatval($rate['tarif_per_kg']),
        'tarif_ongkir'            => $totalOngkir,
        'estimasi_sla'            => $rate['estimasi_sla_label'],
        'estimasi_sla_hari'       => floatval($rate['estimasi_sla_hari']),
        'persentase_ongkir'       => $persentaseOngkir,
        'kategori_risiko_margin'  => $kategori,
        'status_ketersediaan_rute'=> 'Tersedia',
    ];
}

// Hitung selisih harga terhadap layanan termurah
foreach ($options as &$opt) {
    $opt['selisih_harga_layanan'] = $opt['tarif_ongkir'] - $tarifTermurah;
}
unset($opt);

// BR-09: evaluate only services available for the requested route.
function selectRecommendation($options, $beratDitagih, $hargaJual) {
    $byServiceId = [];
    foreach ($options as $option) {
        $byServiceId[$option['service_id']] = $option;
    }

    $regular = $byServiceId['SRV_REG'] ?? null;
    $economy = $byServiceId['SRV_EKO'] ?? null;
    $nextDay = $byServiceId['SRV_NXT'] ?? null;
    $cheapest = $options[0] ?? null;

    if ($regular && $regular['persentase_ongkir'] <= 30 && $regular['selisih_harga_layanan'] <= 10000) {
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

    $allServicesRed = count($options) > 0;
    foreach ($options as $option) {
        if ($option['kategori_risiko_margin'] !== 'Merah') {
            $allServicesRed = false;
            break;
        }
    }

    if ($economy && ($allServicesRed || $beratDitagih > 5)) {
        $reasons = [];
        if ($allServicesRed) $reasons[] = 'ongkir pada semua layanan yang tersedia cukup besar dibanding harga barang';
        if ($beratDitagih > 5) $reasons[] = 'paket ini memiliki berat tertagih ' . $beratDitagih . ' kg';

        return [
            'service_id' => 'SRV_EKO',
            'rule_code' => 'BR09-R2',
            'reason' => 'Ekonomi lebih cocok untuk pesanan ini karena ' . implode(' dan ', $reasons) . '.',
        ];
    }

    if ($nextDay && $hargaJual > 1000000 && $nextDay['persentase_ongkir'] <= 10) {
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

$recommendation = selectRecommendation($options, $beratDitagih, $hargaJual);
foreach ($options as &$opt) {
    $isRecommended = $recommendation && $opt['service_id'] === $recommendation['service_id'];
    $opt['is_recommended'] = $isRecommended;
    $opt['alasan_rekomendasi'] = $isRecommended ? $recommendation['reason'] : null;
    $opt['rule_code_applied'] = $isRecommended ? $recommendation['rule_code'] : null;
}
unset($opt);

// =====================================================================
// 6. SIMPAN KE TABEL shipments & shipment_options
// =====================================================================
$shipmentId = 'SHP' . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);

try {
    $db->beginTransaction();

    // Insert shipment
    $stmtShipment = $db->prepare("
        INSERT INTO shipments (shipment_id, kota_asal, kota_tujuan, berat_kg, panjang_cm, lebar_cm, tinggi_cm, berat_volume_kg, berat_ditagih, harga_jual_produk)
        VALUES (:id, :asal, :tujuan, :berat, :p, :l, :t, :vol, :ditagih, :harga)
    ");
    $stmtShipment->execute([
        ':id'      => $shipmentId,
        ':asal'    => $kotaAsal,
        ':tujuan'  => $kotaTujuan,
        ':berat'   => $beratKg,
        ':p'       => $panjangCm,
        ':l'       => $lebarCm,
        ':t'       => $tinggiCm,
        ':vol'     => $beratVolume,
        ':ditagih' => $beratDitagih,
        ':harga'   => $hargaJual,
    ]);

    // Insert shipment_options
    $stmtOption = $db->prepare("
        INSERT INTO shipment_options (option_id, shipment_id, service_id, tarif_ongkir, estimasi_sla, status_ketersediaan_rute, persentase_ongkir, kategori_risiko_margin, selisih_harga_layanan, is_recommended, alasan_rekomendasi, rule_code_applied)
        VALUES (:oid, :sid, :svc, :tarif, :sla, :status, :persen, :kategori, :selisih, :reco, :reason, :rule)
    ");

    foreach ($options as $index => $opt) {
        $optionId = intval($shipmentId . $index);
        $stmtOption->execute([
            ':oid'      => mt_rand(100000, 999999),
            ':sid'      => $shipmentId,
            ':svc'      => $opt['service_id'],
            ':tarif'    => $opt['tarif_ongkir'],
            ':sla'      => $opt['estimasi_sla'],
            ':status'   => $opt['status_ketersediaan_rute'],
            ':persen'   => $opt['persentase_ongkir'],
            ':kategori' => $opt['kategori_risiko_margin'],
            ':selisih'  => $opt['selisih_harga_layanan'],
            ':reco'     => $opt['is_recommended'] ? 1 : 0,
            ':reason'   => $opt['alasan_rekomendasi'],
            ':rule'     => $opt['rule_code_applied'],
        ]);
    }

    $db->commit();
} catch (PDOException $e) {
    $db->rollBack();
    // Jangan gagalkan response — data tetap dikembalikan meski gagal simpan
    error_log("Gagal menyimpan shipment: " . $e->getMessage());
}

// =====================================================================
// 7. KEMBALIKAN RESPONSE JSON KE REACT
// =====================================================================
echo json_encode([
    "success"        => true,
    "shipment_id"    => $shipmentId,
    "kota_asal"      => $kotaAsal,
    "kota_tujuan"    => $kotaTujuan,
    "berat_kg"       => $beratKg,
    "berat_volume_kg"=> $beratVolume,
    "berat_ditagih"  => $beratDitagih,
    "harga_jual"     => $hargaJual,
    "recommendation" => $recommendation,
    "options"        => $options,
], JSON_UNESCAPED_UNICODE);
