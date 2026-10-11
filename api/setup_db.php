<?php
/**
 * Script untuk inisialisasi database SQLite dari seeder.sql
 * Jalankan sekali: php api/setup_db.php
 */

$dbPath = __DIR__ . '/anteraja.db';

// Hapus DB lama jika ada (fresh start)
if (file_exists($dbPath)) {
    unlink($dbPath);
    echo "[INFO] Database lama dihapus.\n";
}

try {
    $db = new PDO("sqlite:$dbPath");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "[INFO] Database SQLite dibuat di: $dbPath\n";
} catch (PDOException $e) {
    die("[ERROR] Gagal membuat database: " . $e->getMessage() . "\n");
}

// =====================================================================
// Jalankan schema & seed dari seeder.sql
// SQLite tidak mendukung BOOLEAN secara native, tapi menerimanya sebagai INTEGER
// =====================================================================

$sqlFile = realpath(__DIR__ . '/../docs/data/seeder.sql');

if (!file_exists($sqlFile)) {
    die("[ERROR] File seeder.sql tidak ditemukan di: $sqlFile\n");
}

$sql = file_get_contents($sqlFile);

// Bersihkan komentar SQL agar tidak mengganggu parsing
$sql = preg_replace('/--.*$/m', '', $sql);

// Pisahkan per statement berdasarkan semicolon
$statements = array_filter(
    array_map('trim', explode(';', $sql)),
    fn($s) => !empty($s)
);

$successCount = 0;
$errorCount   = 0;

foreach ($statements as $statement) {
    try {
        $db->exec($statement);
        $successCount++;
    } catch (PDOException $e) {
        echo "[WARN] Statement gagal: " . substr($statement, 0, 80) . "...\n";
        echo "       Error: " . $e->getMessage() . "\n";
        $errorCount++;
    }
}

echo "[INFO] Selesai. $successCount statement berhasil, $errorCount gagal.\n";

// Verifikasi data
$tables = ['locations', 'shipping_services', 'shipping_rates', 'shipments', 'shipment_options'];
echo "\n[VERIFIKASI] Jumlah data per tabel:\n";
foreach ($tables as $table) {
    try {
        $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        echo "  - $table: $count baris\n";
    } catch (PDOException $e) {
        echo "  - $table: ERROR - " . $e->getMessage() . "\n";
    }
}

echo "\n[DONE] Database siap digunakan oleh calculate.php\n";
