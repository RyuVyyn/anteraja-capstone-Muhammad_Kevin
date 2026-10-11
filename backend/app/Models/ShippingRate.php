<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingRate extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'rate_id';

    protected $fillable = [
        'kota_asal_id',
        'kota_tujuan_id',
        'service_id',
        'tarif_per_kg',
        'estimasi_sla_label',
        'estimasi_sla_hari',
    ];

    protected function casts(): array
    {
        return [
            'tarif_per_kg' => 'float',
            'estimasi_sla_hari' => 'float',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(ShippingService::class, 'service_id', 'service_id');
    }

    public function kotaAsal(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'kota_asal_id', 'location_id');
    }

    public function kotaTujuan(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'kota_tujuan_id', 'location_id');
    }
}
