<?php

use App\Http\Controllers\ShippingCalculationController;
use Illuminate\Support\Facades\Route;

Route::post('/calculate.php', [ShippingCalculationController::class, 'calculate']);
