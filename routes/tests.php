<?php

use App\Http\Controllers\Api\CustomerApplicationInspectionController;
use App\Http\Controllers\Api\CustomerEnergizationController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Tests\MobileTestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



// mobile-testings ni dapit
Route::get('/tests/mobile/create-inspection', [MobileTestController::class, 'createInspection'])->name('tests.mobile.create-inspection');
Route::post('/tests/mobile/update-inspection/{inspection}', [CustomerApplicationInspectionController::class, 'update'])->name('test-inspection.update');

Route::get('/tests/mobile/create-energization', [MobileTestController::class, 'createEnergization'])->name('tests.mobile.create-energization');
Route::put('/tests/mobile/update-energization/{customerEnergization}', [CustomerEnergizationController::class, 'update'])->name('test-energization.update');


// Receipts ni syot
Route::get('/receipts/billing', [\App\Http\Controllers\System\ReceiptController::class, 'billing'])->name('receipts.billing');