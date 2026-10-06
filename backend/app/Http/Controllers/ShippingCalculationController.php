<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentOption;
use App\Models\ShippingRate;
use App\Services\LocationResolver;
use App\Services\RecommendationEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ShippingCalculationController extends Controller
{
    public function __construct(
        private readonly LocationResolver $locationResolver,
        private readonly RecommendationEngine $recommendationEngine,
    ) {}

    public function calculate(Request $request): JsonResponse
    {
        $input = json_decode($request->getContent(), true);
        if (! is_array($input) || $input === []) {
            return response()->json(['error' => 'Data input tidak valid atau kosong.'], 400);
        }

        $kotaAsal = is_string($input['kota_asal'] ?? null) ? trim($input['kota_asal']) : '';
        $kotaTujuan = is_string($input['kota_tujuan'] ?? null) ? trim($input['kota_tujuan']) : '';
        $beratKg = $input['berat_kg'] ?? null;
        $hargaJual = $input['harga_jual'] ?? null;

        if ($kotaAsal === '' || $kotaTujuan === '') {
            return response()->json(['error' => 'Kota asal dan kota tujuan wajib diisi.'], 422);
        }
        if (! is_numeric($beratKg) || ! is_finite((float) $beratKg) || (float) $beratKg <= 0) {
            return response()->json(['error' => 'Berat fisik harus lebih dari 0.'], 422);
        }
        if (! is_numeric($hargaJual) || ! is_finite((float) $hargaJual) || (float) $hargaJual <= 0) {
            return response()->json(['error' => 'Harga jual produk harus lebih dari 0.'], 422);
        }

        [$origin, $destination] = $this->locationResolver->resolveMany([$kotaAsal, $kotaTujuan]);
        if (! $origin || ! $destination) {
            return response()->json(['error' => 'Kota asal atau kota tujuan belum tersedia.'], 422);
        }

        $beratKg = (float) $beratKg;
        $hargaJual = (float) $hargaJual;
        $panjangCm = is_numeric($input['panjang_cm'] ?? null) ? (int) $input['panjang_cm'] : 0;
        $lebarCm = is_numeric($input['lebar_cm'] ?? null) ? (int) $input['lebar_cm'] : 0;
        $tinggiCm = is_numeric($input['tinggi_cm'] ?? null) ? (int) $input['tinggi_cm'] : 0;

        $beratVolume = $panjangCm > 0 && $lebarCm > 0 && $tinggiCm > 0
            ? round(($panjangCm * $lebarCm * $tinggiCm) / 6000, 2)
            : 0;
        $beratDitagih = (int) ceil(max($beratKg, $beratVolume));

        $cacheKey = "rates:{$origin->location_id}:{$destination->location_id}";
        $rates = collect(Cache::remember($cacheKey, 3600, function () use ($origin, $destination): array {
            return ShippingRate::with('service:service_id,nama_layanan,deskripsi')
                ->whereHas('service', fn ($q) => $q->where('is_active', true))
                ->where('kota_asal_id', $origin->location_id)
                ->where('kota_tujuan_id', $destination->location_id)
                ->orderBy('tarif_per_kg')
                ->get()
                ->map(fn (ShippingRate $rate): array => [
                    'service_id' => $rate->service_id,
                    'tarif_per_kg' => $rate->tarif_per_kg,
                    'estimasi_sla_label' => $rate->estimasi_sla_label,
                    'estimasi_sla_hari' => $rate->estimasi_sla_hari,
                    'nama_layanan' => $rate->service->nama_layanan,
                    'deskripsi' => $rate->service->deskripsi,
                ])
                ->all();
        }))->map(fn (array $row): object => (object) $row);

        $options = [];
        $tarifTermurah = null;
        foreach ($rates as $rate) {
            $totalOngkir = $rate->tarif_per_kg * $beratDitagih;
            $persentaseOngkir = round(($totalOngkir / $hargaJual) * 100, 1);
            $kategori = $persentaseOngkir > 30 ? 'Merah' : ($persentaseOngkir > 15 ? 'Kuning' : 'Hijau');
            $tarifTermurah = $tarifTermurah === null ? $totalOngkir : min($tarifTermurah, $totalOngkir);

            $options[] = [
                'service_id' => $rate->service_id,
                'nama_layanan' => $rate->nama_layanan,
                'deskripsi' => $rate->deskripsi,
                'tarif_per_kg' => $rate->tarif_per_kg,
                'tarif_ongkir' => $totalOngkir,
                'estimasi_sla' => $rate->estimasi_sla_label,
                'estimasi_sla_hari' => $rate->estimasi_sla_hari,
                'persentase_ongkir' => $persentaseOngkir,
                'kategori_risiko_margin' => $kategori,
                'status_ketersediaan_rute' => 'Tersedia',
            ];
        }

        foreach ($options as &$option) {
            $option['selisih_harga_layanan'] = $option['tarif_ongkir'] - $tarifTermurah;
        }
        unset($option);

        $recommendation = $this->recommendationEngine->pilih($options, $beratDitagih, $hargaJual);
        foreach ($options as &$option) {
            $isRecommended = $recommendation && $option['service_id'] === $recommendation['service_id'];
            $option['is_recommended'] = (bool) $isRecommended;
            $option['alasan_rekomendasi'] = $isRecommended ? $recommendation['reason'] : null;
            $option['rule_code_applied'] = $isRecommended ? $recommendation['rule_code'] : null;
        }
        unset($option);

        $shipmentId = 'SHP'.Str::ulid();
        $shipmentOptions = array_map(static fn (array $option): array => [
            'shipment_id' => $shipmentId,
            'service_id' => $option['service_id'],
            'tarif_ongkir' => $option['tarif_ongkir'],
            'estimasi_sla' => $option['estimasi_sla'],
            'status_ketersediaan_rute' => $option['status_ketersediaan_rute'],
            'persentase_ongkir' => $option['persentase_ongkir'],
            'kategori_risiko_margin' => $option['kategori_risiko_margin'],
            'selisih_harga_layanan' => $option['selisih_harga_layanan'],
            'is_recommended' => $option['is_recommended'],
            'alasan_rekomendasi' => $option['alasan_rekomendasi'],
            'rule_code_applied' => $option['rule_code_applied'],
        ], $options);

        $catat = [
            'shipment_id' => $shipmentId,
            'kota_asal_id' => $origin->location_id,
            'kota_tujuan_id' => $destination->location_id,
            'berat_kg' => $beratKg,
            'panjang_cm' => $panjangCm ?: null,
            'lebar_cm' => $lebarCm ?: null,
            'tinggi_cm' => $tinggiCm ?: null,
            'berat_volume_kg' => $beratVolume,
            'berat_ditagih' => $beratDitagih,
            'harga_jual_produk' => $hargaJual,
        ];

        // Dikerjakan SETELAH JSON terkirim ke React; penjual tidak menunggu INSERT.
        dispatch(function () use ($catat, $shipmentOptions): void {
            try {
                DB::transaction(function () use ($catat, $shipmentOptions): void {
                    Shipment::create($catat);

                    if ($shipmentOptions !== []) {
                        ShipmentOption::insert($shipmentOptions);
                    }
                });
            } catch (\Throwable $e) {
                Log::error('Gagal mencatat simulasi.', [
                    'shipment_id' => $catat['shipment_id'] ?? null,
                    'exception' => $e->getMessage(),
                ]);
            }
        })->afterResponse();

        return response()->json([
            'success' => true,
            'shipment_id' => $shipmentId,
            'kota_asal' => $kotaAsal,
            'kota_tujuan' => $kotaTujuan,
            'berat_kg' => $beratKg,
            'berat_volume_kg' => $beratVolume,
            'berat_ditagih' => $beratDitagih,
            'harga_jual' => $hargaJual,
            'recommendation' => $recommendation,
            'options' => $options,
        ]);
    }
}
