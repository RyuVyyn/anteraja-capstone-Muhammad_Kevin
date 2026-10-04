<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentOption extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'option_id';

    protected $fillable = [
        'shipment_id',
        'service_id',
        'tarif_ongkir',
        'estimasi_sla',
        'status_ketersediaan_rute',
        'persentase_ongkir',
        'kategori_risiko_margin',
        'selisih_harga_layanan',
        'is_recommended',
        'alasan_rekomendasi',
        'rule_code_applied',
    ];

    protected function casts(): array
    {
        return [
            'tarif_ongkir' => 'float',
            'persentase_ongkir' => 'float',
            'selisih_harga_layanan' => 'float',
            'is_recommended' => 'boolean',
        ];
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class, 'shipment_id', 'shipment_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(ShippingService::class, 'service_id', 'service_id');
    }
}
