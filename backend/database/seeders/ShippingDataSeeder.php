<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingDataSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['location_id' => 1, 'nama_kota' => 'KOTA JAKARTA PUSAT', 'provinsi' => 'DKI JAKARTA', 'kode_pos' => '10110'],
            ['location_id' => 2, 'nama_kota' => 'KOTA SURABAYA', 'provinsi' => 'JAWA TIMUR', 'kode_pos' => '60119'],
            ['location_id' => 3, 'nama_kota' => 'KOTA BANDUNG', 'provinsi' => 'JAWA BARAT', 'kode_pos' => '40111'],
            ['location_id' => 4, 'nama_kota' => 'KOTA MEDAN', 'provinsi' => 'SUMATERA UTARA', 'kode_pos' => '20111'],
            ['location_id' => 5, 'nama_kota' => 'KOTA SEMARANG', 'provinsi' => 'JAWA TENGAH', 'kode_pos' => '50131'],
            ['location_id' => 6, 'nama_kota' => 'KOTA MAKASSAR', 'provinsi' => 'SULAWESI SELATAN', 'kode_pos' => '90111'],
            ['location_id' => 7, 'nama_kota' => 'KOTA DENPASAR', 'provinsi' => 'BALI', 'kode_pos' => '80113'],
            ['location_id' => 8, 'nama_kota' => 'KOTA PALEMBANG', 'provinsi' => 'SUMATERA SELATAN', 'kode_pos' => '30111'],
            ['location_id' => 9, 'nama_kota' => 'KOTA BANJARMASIN', 'provinsi' => 'KALIMANTAN SELATAN', 'kode_pos' => '70111'],
            ['location_id' => 10, 'nama_kota' => 'KOTA SAMARINDA', 'provinsi' => 'KALIMANTAN TIMUR', 'kode_pos' => '75111'],
        ];

        $services = [
            ['service_id' => 'SRV_EKO', 'nama_layanan' => 'Ekonomi', 'deskripsi' => 'Layanan paling hemat, estimasi 3-4 hari', 'is_active' => true],
            ['service_id' => 'SRV_REG', 'nama_layanan' => 'Reguler', 'deskripsi' => 'Layanan standar, estimasi 1-2 hari', 'is_active' => true],
            ['service_id' => 'SRV_NXT', 'nama_layanan' => 'Next Day', 'deskripsi' => 'Sampai keesokan hari, estimasi 1 hari', 'is_active' => true],
            ['service_id' => 'SRV_SMD', 'nama_layanan' => 'Same Day', 'deskripsi' => 'Sampai di hari yang sama, estimasi beberapa jam', 'is_active' => true],
            ['service_id' => 'SRV_INT', 'nama_layanan' => 'Instant', 'deskripsi' => 'Diantar dalam hitungan jam via kurir motor', 'is_active' => true],
            ['service_id' => 'SRV_CGO', 'nama_layanan' => 'Kargo', 'deskripsi' => 'Untuk pengiriman berat/volume besar', 'is_active' => true],
            ['service_id' => 'SRV_TRK', 'nama_layanan' => 'Trucking', 'deskripsi' => 'Pengiriman via truk untuk kota besar', 'is_active' => false],
            ['service_id' => 'SRV_KAI', 'nama_layanan' => 'Kereta', 'deskripsi' => 'Pengiriman via kereta logistik', 'is_active' => true],
            ['service_id' => 'SRV_LAU', 'nama_layanan' => 'Laut', 'deskripsi' => 'Pengiriman via kapal laut, biaya rendah', 'is_active' => true],
            ['service_id' => 'SRV_UDR', 'nama_layanan' => 'Udara', 'deskripsi' => 'Pengiriman via pesawat, tercepat lintas pulau', 'is_active' => true],
        ];

        $locationIds = [];
        foreach ($locations as $index => $location) {
            unset($location['location_id']);
            $locationIds[$index] = DB::table('locations')->insertGetId($location, 'location_id');
        }
        DB::table('shipping_services')->insert($services);

        $factors = ['SRV_EKO' => 1.0, 'SRV_REG' => 1.35, 'SRV_NXT' => 1.9, 'SRV_SMD' => 2.5];
        $sla = [
            'SRV_EKO' => ['3-5 Hari', 4.0],
            'SRV_REG' => ['2-3 Hari', 2.5],
            'SRV_NXT' => ['1 Hari', 1.0],
            'SRV_SMD' => ['Beberapa Jam', 0.3],
        ];
        $rates = [];

        foreach ($locations as $originIndex => $origin) {
            foreach ($locations as $destinationIndex => $destination) {
                if ($originIndex === $destinationIndex) {
                    continue;
                }

                $originSequence = $originIndex + 1;
                $destinationSequence = $destinationIndex + 1;
                $base = 8000 + abs($originSequence - $destinationSequence) * 750
                    + ($originSequence + $destinationSequence) * 125;

                foreach ($factors as $serviceId => $factor) {
                    $rates[] = [
                        'kota_asal_id' => $locationIds[$originIndex],
                        'kota_tujuan_id' => $locationIds[$destinationIndex],
                        'service_id' => $serviceId,
                        'tarif_per_kg' => (int) (($base * $factor + 50) / 100) * 100,
                        'estimasi_sla_label' => $sla[$serviceId][0],
                        'estimasi_sla_hari' => $sla[$serviceId][1],
                    ];
                }
            }
        }

        DB::table('shipping_rates')->insert($rates);
    }
}
