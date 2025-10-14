<?php

use App\Http\Controllers\AmendmentRequestController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\CustomerApplicationController;
use App\Http\Controllers\CustomerTypeController;
use App\Http\Controllers\DistrictController;
use App\Http\Controllers\Monitoring\InspectionController;
use App\Http\Controllers\Monitoring\VerifyApplicationController;
use App\Http\Controllers\RbacController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TownController;
use App\Http\Controllers\Configurations\ApprovalFlowsController;
use App\Http\Controllers\ApprovalFlowSystem\ApprovalController;
use App\Http\Controllers\Transactions\TransactionsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {


    // tickets
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');

    Route::get('/customer-applications', [CustomerApplicationController::class, 'index'])->name('api.customer-applications');

    Route::get('/api/barangays-with-town', [BarangayController::class, 'getWithTownApi'])->name('api.barangays-with-town');
    Route::get('/api/districts', [DistrictController::class, 'getApi'])->name('api.districts');
    Route::get('/api/customer-types',[CustomerTypeController::class, 'getApi'])->name('api.customer-types');

    Route::resource('applications', CustomerApplicationController::class)
        ->parameters(['applications' => 'customerApplication']);

    Route::put('/customer-applications/amendment/{customerApplication}', [AmendmentRequestController::class, 'store'])
        ->middleware('can:request customer info amendments')
        ->name('amendment-request.store');

    Route::get('inspections', [InspectionController::class, 'index'])->middleware('can:view inspections')->name('inspections.index');
    Route::post('inspections/assign', [InspectionController::class, 'assign'])->middleware(['can:assign inspector'])->name('inspections.assign');

    Route::get('transactions', [TransactionsController::class, 'index'])->name('transactions.index');

    // Verify Applications Routes
    Route::get('verify-applications', [VerifyApplicationController::class, 'index'])->name('verify-applications.index');
    Route::get('verify-applications/{customerApplication}', [VerifyApplicationController::class, 'show'])->name('verify-applications.show');
    Route::post('verify-applications/verify', [VerifyApplicationController::class, 'verify'])->name('verify-applications.verify');
    Route::post('verify-applications/cancel', [VerifyApplicationController::class, 'cancel'])->name('verify-applications.cancel');    // Approvals Routes
    Route::get('approvals', [ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('approvals/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');
    Route::post('approvals/reset', [ApprovalController::class, 'reset'])->name('approvals.reset');
    Route::get('approvals/history', [ApprovalController::class, 'history'])->name('approvals.history');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/towns', [TownController::class, 'apiGet'])->name('web-api.towns');
    Route::get('/barangays/{town}', [BarangayController::class, 'apiGet'])->name('web-api.barangays');


    Route::middleware(['can:manage roles'])->group(function () {
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
        Route::post('/rbac/roles', [RbacController::class, 'storeRole'])->name('rbac.store-role');
        Route::put('/rbac/roles/{role}', [RbacController::class, 'updateRole'])->name('rbac.update-role');
        Route::delete('/rbac/roles/{role}', [RbacController::class, 'deleteRole'])->name('rbac.delete-role');
        Route::put('/rbac/roles/{role}/add-permission/{permission}', [RbacController::class, 'addPermissionToRole'])->name('rbac.add-permission-to-role');
    });

    Route::middleware(['can:manage permissions'])->group(function () {
        Route::post('/rbac/permissions', [RbacController::class, 'storePermission'])->name('rbac.store-permission');
        Route::put('/rbac/permissions/{permission}', [RbacController::class, 'updatePermission'])->name('rbac.update-permission');
        Route::delete('/rbac/permissions/{permission}', [RbacController::class, 'deletePermission'])->name('rbac.delete-permission');

    });

    Route::prefix('configurations')->group(function () {
        Route::resource('approval-flows', ApprovalFlowsController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
