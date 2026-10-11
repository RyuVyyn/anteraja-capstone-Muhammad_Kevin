<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shipment extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'shipment_id';

    protected $keyType = 'string';

    const UPDATED_AT = null;

    protected $fillable = [
        'shipment_id',
        'kota_asal_id',
        'kota_tujuan_id',
        'berat_kg',
        'panjang_cm',
        'lebar_cm',
        'tinggi_cm',
        'berat_volume_kg',
        'berat_ditagih',
        'harga_jual_produk',
    ];

    protected function casts(): array
    {
        return [
            'berat_kg' => 'float',
            'berat_volume_kg' => 'float',
            'berat_ditagih' => 'float',
            'harga_jual_produk' => 'float',
        ];
    }

    public function kotaAsal(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'kota_asal_id', 'location_id');
    }

    public function kotaTujuan(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'kota_tujuan_id', 'location_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(ShipmentOption::class, 'shipment_id', 'shipment_id');
    }
}
