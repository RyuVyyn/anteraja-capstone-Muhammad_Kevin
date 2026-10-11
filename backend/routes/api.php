<?php

use App\Http\Controllers\ShippingCalculationController;
use App\Http\Controllers\SimulasiController;
use Illuminate\Support\Facades\Route;

Route::post('/calculate.php', [ShippingCalculationController::class, 'calculate']);
Route::get('/simulasi/tabel', [SimulasiController::class, 'tabel']);
Route::get('/simulasi/agregat', [SimulasiController::class, 'agregat']);
