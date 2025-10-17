<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerApplicationInspectionController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\TownController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/towns', [TownController::class, 'apiGet'])->name('api.towns');
    Route::get('/barangays/{town}', [BarangayController::class, 'apiGet'])->name('api.barangays');
});

//Login / logout api
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'me']);

    Route::get('/inspections/for-inspection', [CustomerApplicationInspectionController::class, 'getForInspection'])
        ->name('api.inspections.for-inspection');
    Route::get('/inspections/for-inspection-approval', [CustomerApplicationInspectionController::class, 'getForInspectionApproval'])
        ->name('api.inspections.for-inspection-approval');
    Route::get('/inspections/approved', [CustomerApplicationInspectionController::class, 'getApproved'])
        ->name('api.inspections.approved');
    Route::get('/inspections/disapproved', [CustomerApplicationInspectionController::class, 'getDisapproved'])
        ->name('api.inspections.disapproved');
    Route::get('/inspections/status/{status}', [CustomerApplicationInspectionController::class, 'getByStatus'])
        ->name('api.inspections.status');
    Route::patch('/inspections/{id}/status', [CustomerApplicationInspectionController::class, 'updateStatus'])
        ->name('api.inspections.update-status');
    Route::get('/inspections/pending', [CustomerApplicationInspectionController::class, 'getPending'])
        ->name('api.inspections.pending');

    // Route::apiResource('/inspections', CustomerApplicationInspectionController::class);
});


