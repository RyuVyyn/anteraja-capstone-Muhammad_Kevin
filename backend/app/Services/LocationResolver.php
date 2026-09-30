<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LocationResolver
{
    public function resolve(string $label): ?object
    {
        if (preg_match('/^(.+?)\s*\(([^()]*)\)$/u', trim($label), $matches)) {
            $cityName = $matches[1];
            $provinceName = Str::upper(trim($matches[2]));
            $locations = DB::table('locations')
                ->whereRaw('UPPER(TRIM(provinsi)) = ?', [$provinceName])
                ->get(['location_id', 'nama_kota', 'provinsi']);
        } else {
            $cityName = $label;
            $locations = DB::table('locations')->get(['location_id', 'nama_kota', 'provinsi']);
        }

        $normalizedCity = $this->normalizeCity($cityName);

        return $locations->first(
            fn (object $location): bool => $this->normalizeCity($location->nama_kota) === $normalizedCity,
        );
    }

    private function normalizeCity(string $cityName): string
    {
        $cityName = Str::upper(trim($cityName));
        $cityName = preg_replace('/^(?:KOTA\s+ADMINISTRASI|KOTA\s+ADM\.?|KOTA|KABUPATEN|KAB\.?)[\s]+/u', '', $cityName);

        return preg_replace('/\s+/u', ' ', trim($cityName)) ?? '';
    }
}
