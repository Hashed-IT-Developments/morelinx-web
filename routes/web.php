<?php

use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Http\Controllers\AmendmentController;
use App\Http\Controllers\Amendments\AmendmentRequestController;
use App\Http\Controllers\ApplicationContractController;
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
use App\Http\Controllers\BroadcastingController;
use App\Http\Controllers\IsnapController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RatesController;
use App\Http\Controllers\Transactions\PaymentPreviewController;
use App\Http\Controllers\Transactions\TransactionsController;
use App\Http\Controllers\Settings\TransactionSeriesController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::post('/broadcasting/auth', [BroadcastingController::class, 'authenticate']);

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/users/search', [UserController::class, 'search'])->name('users.search');

    Route::get('/notifications', [NotificationController::class, 'fetch'])->name('notifications.fetch');


    Route::get('/tickets/dashboard', [TicketController::class, 'dashboard'])->name('tickets.dashboard');
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::get('/tickets/settings', [TicketController::class, 'settings'])->name('tickets.settings');
    Route::post('/tickets/settings/ticket/{type}/save', [TicketController::class, 'settingsSave'])->name('tickets.settings-ticket-save');
    Route::put('/tickets/settings/ticket/{type}/edit', [TicketController::class, 'settingsEdit'])->name('tickets.settings-ticket-type-edit');
    Route::delete('/tickets/settings/ticket/{type}/delete', [TicketController::class, 'settingsDelete'])->name('tickets.settings-ticket-type-delete');
    Route::post('/tickets/store', [TicketController::class, 'store'])->name('tickets.store');
    Route::get('/tickets/my-tickets', [TicketController::class, 'myTickets'])->name('tickets.my-tickets');
    Route::get('/tickets/view', [TicketController::class, 'view'])->name('tickets.view');
    Route::patch('/tickets/mark-as-done', [TicketController::class, 'markAsDone'])->name('tickets.mark-as-done');
    Route::post('/tickets/assign', [TicketController::class, 'assign'])->name('tickets.assign');
Route::get('/tickets/types' , [TicketController::class, 'getTicketTypes'])->name('tickets-types.fetch');
Route::put('/tickets/update', [TicketController::class, 'update'])->name('tickets.update');

    Route::get('/customer-applications', [CustomerApplicationController::class, 'index'])->name('api.customer-applications');

    Route::get('/api/barangays-with-town', [BarangayController::class, 'getWithTownApi'])->name('api.barangays-with-town');
    Route::get('/api/districts', [DistrictController::class, 'getApi'])->name('api.districts');
    Route::get('/api/customer-types', [CustomerTypeController::class, 'getApi'])->name('api.customer-types');

    Route::get('applications/contract-signing', [ApplicationContractController::class, 'showContractSigning'])
        ->name('applications.contract-signing');

    Route::resource('applications', CustomerApplicationController::class)
        ->parameters(['applications' => 'customerApplication']);

    Route::get('/customer-applications/amendments/', [AmendmentRequestController::class, 'index'])
        // ->middleware(['can:view customer info amendments'])
        ->name('amendment-requests.index');
    Route::put('/customer-applications/amendments/{customerApplication}', [AmendmentRequestController::class, 'store'])
        ->middleware('can:' . PermissionsEnum::REQUEST_CUSTOMER_INFO_AMENDMENTS)
        ->name('amendment-request.store');
    Route::put('/customer-application/amendments/action/{amendmentRequest}/{action}', [
        AmendmentRequestController::class,
        'takeAction'
    ])->name('amendment-request.action');
    Route::get('/customer-applications/amendments/history/{customerApplication}', [AmendmentRequestController::class, 'getHistory'])
        ->name('customer-applications.amendment-history');

    Route::get('/customer-applications/contract/pdf/application/{application}', [ApplicationContractController::class, 'generatePdfFromApplication'])->name('contracts.stream');
    Route::get('/customer-applications/contract/pdf/{contract}', [ApplicationContractController::class, 'generatePdf'])->name('contracts.show');
    Route::put('/customer-applications/contract/{contract}', [ApplicationContractController::class, 'update'])
        ->name('customer-applications.contract.update');

    Route::get('/inspections', [InspectionController::class, 'index'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.index');
    Route::get('/inspections/calendar', [InspectionController::class, 'calendar'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.calendar');
    Route::post('/inspections/assign', [InspectionController::class, 'assign'])->middleware(['can:' . PermissionsEnum::ASSIGN_INSPECTOR])->name('inspections.assign');
    Route::put('/inspections/{inspection}/schedule', [InspectionController::class, 'updateSchedule'])->middleware('can:' . PermissionsEnum::ASSIGN_INSPECTOR)->name('inspections.update-schedule');
    Route::get('/customer-applications/{application}/approval-status', [CustomerApplicationController::class, 'approvalStatus'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('customer-applications.approval-status');
    Route::get('/customer-applications/{application}/summary', [CustomerApplicationController::class, 'summary'])->name('customer-applications.summary');


    // ISNAP Routes
    Route::get('isnap', [IsnapController::class, 'index'])->name('isnap.index');
    Route::get('isnap/{customerApplication}/documents', [IsnapController::class, 'uploadDocuments'])->name('isnap.documents');
    Route::post('isnap/{customerApplication}/documents', [IsnapController::class, 'storeDocuments'])->name('isnap.store-documents');
    Route::post('isnap/{customerApplication}/approve', [IsnapController::class, 'approve'])->name('isnap.approve');

    // Transactions Routes - Require TREASURY_STAFF role
    Route::get('transactions', [TransactionsController::class, 'index'])->middleware('can:' . PermissionsEnum::VIEW_TRANSACTIONS)->name('transactions.index');
    Route::get('transactions/queue', [TransactionsController::class, 'getPaymentQueue'])->middleware('can:' . PermissionsEnum::VIEW_TRANSACTIONS)->name('transactions.queue');

    // Multi-Cashier OR Number Management (Self-Service)
    Route::get('transactions/preview-or', [TransactionsController::class, 'previewOrNumber'])->middleware('can:' . PermissionsEnum::VIEW_TRANSACTIONS)->name('transactions.preview-or');
    Route::get('transactions/my-counter-info', [TransactionsController::class, 'getMyCounterInfo'])->middleware('can:' . PermissionsEnum::VIEW_TRANSACTIONS)->name('transactions.my-counter-info');
    Route::post('transactions/check-offset', [TransactionsController::class, 'checkOffset'])->middleware('can:' . PermissionsEnum::MANAGE_PAYMENTS)->name('transactions.check-offset');
    Route::post('transactions/set-my-offset', [TransactionsController::class, 'setMyOffset'])->middleware('can:' . PermissionsEnum::MANAGE_PAYMENTS)->name('transactions.set-my-offset');

    Route::post('transactions/{customerAccount}/payment/preview', [PaymentPreviewController::class, 'preview'])->middleware('can:' . PermissionsEnum::MANAGE_PAYMENTS)->name('transactions.payment-preview');
    Route::post('transactions/{customerAccount}/payment', [TransactionsController::class, 'processPayment'])->middleware('can:' . PermissionsEnum::MANAGE_PAYMENTS)->name('transactions.process-payment');
    Route::get('transactions/payable-definitions/{payable}', [TransactionsController::class, 'getPayableDefinitions'])->middleware('can:' . PermissionsEnum::VIEW_TRANSACTIONS)->name('transactions.payable-definitions');

    // Transaction Series Management Routes
    Route::prefix('transaction-series')->name('transaction-series.')->group(function () {
        Route::get('/', [TransactionSeriesController::class, 'index'])->name('index');
        Route::post('/', [TransactionSeriesController::class, 'store'])->name('store');
        Route::get('/preview-or', [TransactionSeriesController::class, 'previewOrNumber'])->name('preview-or'); // Preview next OR
        Route::get('/suggest-range', [TransactionSeriesController::class, 'suggestRange'])->name('suggest-range'); // Suggest next range
        Route::get('/{transactionSeries}', [TransactionSeriesController::class, 'show'])->name('show');
        Route::put('/{transactionSeries}', [TransactionSeriesController::class, 'update'])->name('update');
        Route::delete('/{transactionSeries}', [TransactionSeriesController::class, 'destroy'])->name('destroy');
        Route::post('/{transactionSeries}/activate', [TransactionSeriesController::class, 'activate'])->name('activate');
        Route::post('/{transactionSeries}/deactivate', [TransactionSeriesController::class, 'deactivate'])->name('deactivate');
        Route::post('/{transactionSeries}/update-start-number', [TransactionSeriesController::class, 'updateStartNumber'])->name('update-start-number');
        Route::get('/{transactionSeries}/statistics', [TransactionSeriesController::class, 'statistics'])->name('statistics');
    });

    // Verify Applications Routes
    Route::get('verify-applications', [VerifyApplicationController::class, 'index'])->name('verify-applications.index');
    Route::get('verify-applications/{customerApplication}', [VerifyApplicationController::class, 'show'])->name('verify-applications.show');
    Route::post('verify-applications/verify', [VerifyApplicationController::class, 'verify'])->name('verify-applications.verify');
    Route::post('verify-applications/cancel', [VerifyApplicationController::class, 'cancel'])->name('verify-applications.cancel');

    // Approvals Routes
    Route::get('/approvals', [ApprovalController::class, 'index'])->name('approvals.index');
    Route::post('/approvals/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('/approvals/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');
    Route::post('/approvals/reset', [ApprovalController::class, 'reset'])->name('approvals.reset');
    Route::get('/approvals/history', [ApprovalController::class, 'history'])->name('approvals.history');

    Route::get('/cancelled-applications', [VerifyApplicationController::class, 'cancelled'])->name('cancelled-applications.index');

    //Towns Routes
    Route::get('/addresses/towns', [TownController::class, 'index'])->name('addresses.towns.index');
    Route::post('/addresses/towns', [TownController::class, 'store'])->name('addresses.store-town');
    Route::put('/addresses/towns/{town}', [TownController::class, 'update'])->name('addresses.update-town');
    Route::get('/addresses/towns/export', [TownController::class, 'export'])->name('addresses.towns.export');
    Route::post('/addresses/towns/import', [TownController::class, 'import'])->name('addresses.towns.import');
    Route::get('/addresses/check-town-alias', [TownController::class, 'checkTownAlias'])->name('addresses.check-town-alias');

    //Barangay Routes
    Route::get('/addresses/barangays', [BarangayController::class, 'index'])->name('addresses.barangays.index');
    Route::post('/addresses/barangays', [BarangayController::class, 'store'])->name('addresses.store-barangay');
    Route::put('/addresses/barangays/{barangay}', [BarangayController::class, 'update'])->name('addresses.update-barangay');
    Route::get('/addresses/check-barangay-alias', [BarangayController::class, 'checkBarangayAlias'])->name('addresses.check-barangay-alias');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/towns', [TownController::class, 'apiGet'])->name('web-api.towns');
    Route::get('/barangays/{town}', [BarangayController::class, 'apiGet'])->name('web-api.barangays');

    //Rates Route
    Route::get('/rates', [RatesController::class, 'index'])->name('rates.index');
    Route::get('/rates/upload', [RatesController::class, 'upload'])->name('rates.upload');
    Route::get('/rates/approvals', [RatesController::class, 'approvals'])->name('rates.approvals');
    Route::post('/rates/import', [RatesController::class, 'import'])->name('rates.import');

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


    Route::get('/rbac/roles/search', [RbacController::class, 'searchRoles'])->name('roles.search');

    Route::prefix('configurations')->group(function () {
        Route::resource('approval-flows', ApprovalFlowsController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
