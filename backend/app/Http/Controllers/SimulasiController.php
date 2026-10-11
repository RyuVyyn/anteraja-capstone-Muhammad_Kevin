<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SimulasiController extends Controller
{
    public function agregat(): JsonResponse
    {
        $result = ShipmentOption::query()
            ->join('shipping_services', 'shipping_services.service_id', '=', 'shipment_options.service_id')
            ->selectRaw('shipment_options.service_id, shipping_services.nama_layanan, AVG(persentase_ongkir) as rata_rata_margin')
            ->groupBy('shipment_options.service_id', 'shipping_services.nama_layanan')
            ->orderBy('rata_rata_margin')
            ->get();

        return response()->json(['data' => $result]);
    }

    public function tabel(Request $request): JsonResponse
    {
        $query = Shipment::with([
                'options.service:service_id,nama_layanan',
                'kotaAsal:location_id,nama_kota',
                'kotaTujuan:location_id,nama_kota',
            ])
            ->orderByDesc('created_at');

        // Filter rentang tanggal
        if ($request->filled('dari') && $request->filled('sampai')) {
            $query->whereBetween('created_at', [
                $request->input('dari'),
                $request->input('sampai'),
            ]);
        }

        // Filter layanan (berdasarkan service_id pada opsi yang recommended)
        if ($request->filled('layanan')) {
            $layanan = $request->input('layanan');
            $query->whereHas('options', function ($q) use ($layanan) {
                $q->where('service_id', $layanan)
                  ->where('is_recommended', true);
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }
}
