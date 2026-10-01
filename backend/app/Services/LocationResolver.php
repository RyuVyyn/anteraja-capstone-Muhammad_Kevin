<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LocationResolver
{
    public function resolve(string $label): ?object
    {
        return $this->resolveMany([$label])[0] ?? null;
    }

    /**
     * @param  list<string>  $labels
     * @return list<?object>
     */
    public function resolveMany(array $labels): array
    {
        if ($labels === []) {
            return [];
        }

        $searches = array_map(function (string $label): array {
            $provinceName = null;
            if (preg_match('/^(.+?)\s*\(([^()]*)\)$/u', trim($label), $matches)) {
                $cityName = $matches[1];
                $provinceName = Str::upper(trim($matches[2]));
            } else {
                $cityName = $label;
            }

            $normalizedCity = $this->normalizeCity($cityName);
            $prefixes = [
                '',
                'KOTA ADMINISTRASI ',
                'KOTA ADM ',
                'KOTA ADM. ',
                'KOTA ',
                'KABUPATEN ',
                'KAB ',
                'KAB. ',
            ];

            return [
                'normalized_city' => $normalizedCity,
                'province_name' => $provinceName,
                'city_names' => array_map(
                    static fn (string $prefix): string => $prefix.$normalizedCity,
                    $prefixes,
                ),
            ];
        }, $labels);

        /** @var \Illuminate\Support\Collection<int, object> $allLocations */
        $allLocations = collect(Cache::remember('locations:all', 86400, function (): array {
            return DB::table('locations')
                ->orderBy('location_id')
                ->get(['location_id', 'nama_kota', 'provinsi'])
                ->map(fn (object $row): array => (array) $row)
                ->all();
        }))->map(fn (array $row): object => (object) $row);

        return array_map(function (array $search) use ($allLocations): ?object {
            $candidates = $allLocations;

            if ($search['province_name'] !== null) {
                $candidates = $candidates->filter(
                    fn (object $location): bool => Str::upper(trim($location->provinsi)) === $search['province_name'],
                );
            }

            return $candidates->first(
                fn (object $location): bool => $this->normalizeCity($location->nama_kota) === $search['normalized_city'],
            );
        }, $searches);
    }

    private function normalizeCity(string $cityName): string
    {
        $cityName = Str::upper(trim($cityName));
        $cityName = preg_replace('/^(?:KOTA\s+ADMINISTRASI|KOTA\s+ADM\.?|KOTA|KABUPATEN|KAB\.?)[\s]+/u', '', $cityName);

        return preg_replace('/\s+/u', ' ', trim($cityName)) ?? '';
    }
}
