<?php

namespace App\Observers;

use App\Models\ShippingRate;
use Illuminate\Support\Facades\Cache;

class ShippingRateObserver
{
    public function saved(ShippingRate $rate): void
    {
        $this->forgetRateCache($rate);
    }

    public function deleted(ShippingRate $rate): void
    {
        $this->forgetRateCache($rate);
    }

    private function forgetRateCache(ShippingRate $rate): void
    {
        Cache::forget("rates:{$rate->kota_asal_id}:{$rate->kota_tujuan_id}");
    }
}
