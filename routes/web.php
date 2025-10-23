<?php

use App\Enums\PermissionsEnum;
use App\Http\Controllers\AmendmentController;
use App\Http\Controllers\Amendments\AmendmentRequestController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\CustomerApplicationController;
use App\Http\Controllers\CustomerTypeController;
use App\Http\Controllers\DistrictController;
use App\Http\Controllers\Monitoring\InspectionController;
use App\Http\Controllers\Monitoring\VerifyApplicationController;
use App\Http\Controllers\RBAC\RbacController;
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

    Route::get('applications/contract-signing', [CustomerApplicationController::class, 'showContractSigning'])
    ->name('applications.contract-signing');

    Route::resource('applications', CustomerApplicationController::class)
        ->parameters(['applications' => 'customerApplication']);

    Route::get('/customer-applications/amendments/',[AmendmentRequestController::class, 'index'])
        // ->middleware(['can:view customer info amendments'])
        ->name('amendment-requests.index');
    Route::put('/customer-applications/amendments/{customerApplication}', [AmendmentRequestController::class, 'store'])
        ->middleware('can:' . PermissionsEnum::REQUEST_CUSTOMER_INFO_AMENDMENTS)
        ->name('amendment-request.store');
    Route::put('/customer-application/amendments/action/{amendmentRequest}/{action}',[
        AmendmentRequestController::class, 'takeAction'
    ])->name('amendment-request.action');
    Route::get('/customer-applications/amendments/history/{customerApplication}',[AmendmentRequestController::class, 'getHistory'])
        ->name('customer-applications.amendment-history');

    Route::get('inspections', [InspectionController::class, 'index'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.index');
    Route::get('inspections/calendar', [InspectionController::class, 'calendar'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.calendar');
    Route::post('inspections/assign', [InspectionController::class, 'assign'])->middleware(['can:' . PermissionsEnum::ASSIGN_INSPECTOR])->name('inspections.assign');
    Route::put('inspections/{inspection}/schedule', [InspectionController::class, 'updateSchedule'])->middleware('can:' . PermissionsEnum::ASSIGN_INSPECTOR)->name('inspections.update-schedule');
    Route::get('customer-applications/{application}/approval-status', [CustomerApplicationController::class, 'approvalStatus'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('customer-applications.approval-status');
    Route::get('customer-applications/{application}/summary', [CustomerApplicationController::class, 'summary'])->name('customer-applications.summary');

    Route::get('transactions', [TransactionsController::class, 'index'])->middleware('can:' . PermissionsEnum::VIEW_TRANSACTIONS)->name('transactions.index');
    Route::post('transactions/{customerApplication}/payment', [TransactionsController::class, 'processPayment'])->middleware('can:' . PermissionsEnum::MANAGE_PAYMENTS)->name('transactions.process-payment');
    Route::get('transactions/payable-definitions/{payable}', [TransactionsController::class, 'getPayableDefinitions'])->middleware('can:' . PermissionsEnum::VIEW_TRANSACTIONS)->name('transactions.payable-definitions');

    // Verify Applications Routes
    Route::get('verify-applications', [VerifyApplicationController::class, 'index'])->name('verify-applications.index');
    Route::get('verify-applications/{customerApplication}', [VerifyApplicationController::class, 'show'])->name('verify-applications.show');
    Route::post('verify-applications/verify', [VerifyApplicationController::class, 'verify'])->name('verify-applications.verify');
    Route::post('verify-applications/cancel', [VerifyApplicationController::class, 'cancel'])->name('verify-applications.cancel');

    // Approvals Routes
    Route::get('approvals', [ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('approvals/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('approvals/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');
    Route::post('approvals/reset', [ApprovalController::class, 'reset'])->name('approvals.reset');
    Route::get('approvals/history', [ApprovalController::class, 'history'])->name('approvals.history');

    Route::get('/cancelled-applications', [VerifyApplicationController::class, 'cancelled'])->name('cancelled-applications.index');

    Route::get('/addresses', [TownController::class, 'index'])->name('addresses.index');
    Route::post('/addresses/store-town', [TownController::class, 'store'])->name('addresses.store-town');
    Route::post('/addresses/store-barangay', [BarangayController::class, 'store'])->name('addresses.store-barangay');
    Route::put('/addresses/towns/{town}', [TownController::class, 'update'])->name('addresses.update-town');
    Route::put('/addresses/barangays/{barangay}', [BarangayController::class, 'update'])->name('addresses.update-barangay');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/towns', [TownController::class, 'apiGet'])->name('web-api.towns');
    Route::get('/barangays/{town}', [BarangayController::class, 'apiGet'])->name('web-api.barangays');


    Route::middleware(['can:' . PermissionsEnum::MANAGE_ROLES])->group(function () {
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
        Route::put('/rbac/roles/{role}/add-permission/{permission}', [RbacController::class, 'addPermissionToRole'])->name('rbac.add-permission-to-role');
        Route::delete('/rbac/roles/{role}/remove-permission/{permission}', [RbacController::class, 'removePermissionFromRole'])->name('rbac.remove-permission-from-role');
        Route::put('/rbac/roles/{role}/sync-permissions', [RbacController::class, 'syncRolePermissions'])->name('rbac.sync-role-permissions');
        Route::post('/rbac/assign-roles', [RbacController::class, 'assignRoles'])->name('rbac.assign-roles');
        Route::post('/rbac/assign-permissions', [RbacController::class, 'assignPermissions'])->name('rbac.assign-permissions');
        Route::get('/rbac/search-users', [RbacController::class, 'searchUsers'])->name('rbac.search-users');
        Route::post('/rbac/create-user', [RbacController::class, 'createUser'])->name('rbac.create-user');
        Route::post('/rbac/resend-password-setup/{user}', [RbacController::class, 'resendPasswordSetupEmail'])->name('rbac.resend-password-setup');
    });

    Route::prefix('configurations')->group(function () {
        Route::resource('approval-flows', ApprovalFlowsController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
