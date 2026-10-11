<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'location_id';

    protected $fillable = ['nama_kota', 'provinsi', 'kode_pos'];
}
