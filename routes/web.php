<?php

use App\Http\Controllers\BarangayController;
use App\Http\Controllers\CustomerApplicationController;
use App\Http\Controllers\RbacController;
use App\Http\Controllers\TownController;
use App\Http\Controllers\WizardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// routes/web.php

Route::middleware(['auth', 'verified'])->group(function () {
    //Customer Application Routes
    Route::prefix('applications')->group(function () {
        Route::post('/wizard/step/{step}', [WizardController::class, 'validateStep'])->name('applications.wizard.step');
        Route::post('/wizard/complete', [WizardController::class, 'complete'])->name('applications.wizard.complete');
    });

    Route::resource('applications', CustomerApplicationController::class);

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/towns', [TownController::class, 'apiGet'])->name('web-api.towns');
    Route::get('/barangays/{town}', [BarangayController::class, 'apiGet'])->name('web-api.barangays');

    Route::middleware(['can:manage roles'])->group(function() {
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
        Route::post('/rbac/roles', [RbacController::class, 'storeRole'])->name('rbac.store-role');
        Route::put('/rbac/roles/{role}', [RbacController::class, 'updateRole'])->name('rbac.update-role');
        Route::delete('/rbac/roles/{role}', [RbacController::class, 'deleteRole'])->name('rbac.delete-role');
        Route::put('/rbac/roles/{role}/add-permission/{permission}',[RbacController::class, 'addPermissionToRole'])->name('rbac.add-permission-to-role');
    });

    Route::middleware(['can:manage permissions'])->group(function() {
        Route::post('/rbac/permissions', [RbacController::class, 'storePermission'])->name('rbac.store-permission');
        Route::put('/rbac/permissions/{permission}', [RbacController::class, 'updatePermission'])->name('rbac.update-permission');
        Route::delete('/rbac/permissions/{permission}', [RbacController::class, 'deletePermission'])->name('rbac.delete-permission');

    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
