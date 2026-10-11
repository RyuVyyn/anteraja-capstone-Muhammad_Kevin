<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingService extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    protected $primaryKey = 'service_id';

    protected $keyType = 'string';

    protected $fillable = ['service_id', 'nama_layanan', 'deskripsi', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'service_id', 'service_id');
    }
}
