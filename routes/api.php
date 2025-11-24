<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerApplicationInspectionController;
use App\Http\Controllers\Api\CustomerEnergizationController;
use App\Http\Controllers\Api\MaterialItemController;
use App\Http\Controllers\Api\MeterController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\TownController;
use App\Http\Controllers\RatesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/towns', [TownController::class, 'apiGet'])->name('api.towns');
    Route::get('/barangays/{town}', [BarangayController::class, 'apiGet'])->name('api.barangays');
});

Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->as('api.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'me']);

    Route::apiResource('/inspections', CustomerApplicationInspectionController::class);

    Route::apiResource('/materials', MaterialItemController::class);

    Route::apiResource('/tickets', TicketController::class)->except(['destroy', 'store']);

    Route::apiResource('/customer-energizations', CustomerEnergizationController::class);
    Route::post('/customer-energizations/{customerEnergization}/download', [CustomerEnergizationController::class, 'downloaded']);

    Route::apiResource('/meters', MeterController::class);

    Route::get('/rates', [RatesController::class, 'apiDownload'])->name('api.rates.download');
});


