<?php

use App\Http\Controllers\RbacController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::middleware(['can:manage roles'])->group(function() {
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
        Route::post('/rbac/roles', [RbacController::class, 'storeRole'])->name('rbac.store-role');
        Route::put('/rbac/roles/{role}', [RbacController::class, 'updateRole'])->name('rbac.update-role');
        Route::delete('/rbac/roles/{role}', [RbacController::class, 'deleteRole'])->name('rbac.delete-role');
    });

    Route::middleware(['can:manage permissions'])->group(function() {
        Route::post('/rbac/permissions', [RbacController::class, 'storePermission'])->name('rbac.store-permission');
        Route::put('/rbac/permissions/{permission}', [RbacController::class, 'updatePermission'])->name('rbac.update-permission');
        Route::delete('/rbac/permissions/{permission}', [RbacController::class, 'deletePermission'])->name('rbac.delete-permission');

    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
