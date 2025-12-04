<?php

use App\Enums\PermissionsEnum;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\CustomerApplicationController;
use App\Http\Controllers\CustomerTypeController;
use App\Http\Controllers\DistrictController;
use App\Http\Controllers\Reports\AgeingTimelineReportController;
use App\Http\Controllers\Reports\ApplicationReportController;
use App\Http\Controllers\Monitoring\InspectionController;
use App\Http\Controllers\Monitoring\DailyMonitoringController;
use App\Http\Controllers\Monitoring\VerifyApplicationController;
use App\Http\Controllers\RBAC\RbacController;
use App\Http\Controllers\Reports\IsnapApplicationReportController;
use App\Http\Controllers\System\ImageController;
use App\Http\Controllers\Reports\IsnapPaymentReportController;
use App\Http\Controllers\Reports\InspectionsDailyMonitorReportController;
use App\Http\Controllers\Reports\InspectionsApplicationTrackingReportController;
use App\Http\Controllers\TownController;
use App\Http\Controllers\Configurations\ApprovalFlowsController;
use App\Http\Controllers\ApprovalFlowSystem\ApprovalController;
use App\Http\Controllers\BroadcastingController;
use App\Http\Controllers\CRM\CRMDashboardController;
use App\Http\Controllers\IsnapController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RatesController;
use App\Http\Controllers\MRB\RouteController;
use App\Http\Controllers\MRB\ReadingScheduleController;
use App\Http\Controllers\Transactions\PaymentPreviewController;
use App\Http\Controllers\Transactions\TransactionsController;
use App\Http\Controllers\Settings\TransactionSeriesController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/images/optimized', [ImageController::class, 'optimize'])->name('image.optimize');

Route::get('/', function () {

    if(!!Auth::check()){
        return redirect()->route('dashboard');
    }else{
        return Inertia::render('auth/login');
    }

})->name('home');

Route::post('/broadcasting/auth', [BroadcastingController::class, 'authenticate']);

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/users/search', [UserController::class, 'search'])->name('users.search');

    Route::get('/notifications', [NotificationController::class, 'fetch'])->name('notifications.fetch');

    Route::get('/api/barangays-with-town', [BarangayController::class, 'getWithTownApi'])->name('api.barangays-with-town');
    Route::get('/api/districts', [DistrictController::class, 'getApi'])->name('api.districts');
    Route::get('/api/customer-types', [CustomerTypeController::class, 'getApi'])->name('api.customer-types');

    // Inspections
    Route::get('/inspections/approvals', [ApprovalController::class, 'inspectionsIndex'])->name('inspections.approvals');
    Route::get('/inspections', [InspectionController::class, 'index'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.index');
    Route::get('/inspections/calendar', [InspectionController::class, 'calendar'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.calendar');
    Route::get('/inspections/inspectors', [InspectionController::class, 'getInspectors'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.inspectors');
    Route::get('/inspections/{inspection}/summary', [InspectionController::class, 'summary'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('inspections.summary');
    Route::post('/inspections/assign', [InspectionController::class, 'assign'])->middleware(['can:' . PermissionsEnum::ASSIGN_INSPECTOR])->name('inspections.assign');
    Route::put('/inspections/{inspection}/schedule', [InspectionController::class, 'updateSchedule'])->middleware('can:' . PermissionsEnum::ASSIGN_INSPECTOR)->name('inspections.update-schedule');

    // Daily Monitoring Routes
    Route::match(['get', 'post'], '/daily-monitoring', [DailyMonitoringController::class, 'index'])->name('daily-monitoring.index');

    //Reports Routes
    Route::match(['get', 'post'], '/reports/application-reports', [ApplicationReportController::class, 'index'])->name('application-reports.index');
    Route::match(['get', 'post'], '/reports/isnap-application-reports', [IsnapApplicationReportController::class, 'index'])->name('isnap-application-reports.index');
    Route::match(['get', 'post'], '/reports/isnap-payment-reports', [IsnapPaymentReportController::class, 'index'])->name('isnap-payment-reports.index');
    Route::match(['get', 'post'], '/reports/inspections-daily-monitor', [InspectionsDailyMonitorReportController::class, 'index'])->name('inspections-daily-monitor-reports.index');
    Route::match(['get', 'post'], '/reports/inspections-application-tracking', [InspectionsApplicationTrackingReportController::class, 'index'])->name('inspections-application-tracking-reports.index');
    Route::get('/reports/ageing-timeline', [AgeingTimelineReportController::class, 'index'])->name('ageing-timeline.index');
    Route::get('/reports/ageing-timeline/applications', [AgeingTimelineReportController::class, 'applications'])->name('ageing-timeline.applications');

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
    Route::get('/transactions/show-receipt', [TransactionsController::class, 'showReceipt'])->name('transactions.show-receipt');

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
    Route::get('/cancelled-applications', [VerifyApplicationController::class, 'cancelled'])->name('cancelled-applications.index');

    // Approvals Routes
    Route::post('/approvals/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('/approvals/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');
    Route::post('/approvals/reset', [ApprovalController::class, 'reset'])->name('approvals.reset');
    Route::get('/approvals/history', [ApprovalController::class, 'history'])->name('approvals.history');



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

    Route::get('/dashboard', [CRMDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/application-by-status', [CRMDashboardController::class, 'applicationsByStatus'])->name('dashboard.application-by-status');
    Route::get('/dashboard/application-by-rate-class', [CRMDashboardController::class, 'applicationsByRateClass'])->name('dashboard.application-by-rate-class');


    Route::get('/rbac/roles/search', [RbacController::class, 'searchRoles'])->name('roles.search');

    Route::prefix('configurations')->group(function () {
        Route::resource('approval-flows', ApprovalFlowsController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    });



    Route::get('/logs', [LogController::class, 'index'])->name('logs.index');


    Route::post('/lineman/assign', [CustomerApplicationController::class, 'assignLineman'])->name('lineman.assign');

    //Routes
    Route::get('/mrb/routes', [RouteController::class, 'routesIndex'])->name('mrb.routes');
    Route::put('/mrb/routes/update-meter-reader-api', [RouteController::class, 'updateMeterReaderApi'])->name('mrb.routes.update-meter-reader-api');
    Route::get('/mrb/get-routes-api', [RouteController::class, 'getRoutesApi'])->name('mrb.get-routes-api');
    Route::get('/mrb/routes/get-single-route-api/{route}', [RouteController::class, 'getSingleRouteApi'])->name('mrb.routes.get-single-route-api');
    Route::get('/mrb/reading-monitoring', [RouteController::class, 'readingMonitoring'])->name('mrb.reading-monitoring');
    Route::get('/mrb/meter-readers', [RouteController::class, 'meterReadersIndex'])->name('mrb.meter-readers');
    Route::get('/mrb/reading-scheduler', [RouteController::class, 'readingScheduler'])->name('mrb.reading-scheduler');
    Route::get('/mrb/routes/get-next-route-name-api/{initial}', [RouteController::class, 'getNextRouteNameApi'])->name('mrb.routes.get-next-route-name-api');
    Route::post('/mrb/routes/create-route-api', [RouteController::class, 'createRouteApi'])->name('mrb.routes.create-route-api');
    Route::put('/mrb/routes/update-route-api/{route}', [RouteController::class, 'updateRouteApi'])->name('mrb.routes.update-route-api');
    Route::get('/mrb/routes/{route}',[RouteController::class, 'showRoute'])->name('mrb.routes.show');
    Route::get('/mrb/routes/get-customers-in-route-api/{route}', [RouteController::class, 'getCustomerAccountsApi']);
    Route::get('/mrb/routes/get-customers-out-route-api/{route}/{barangay}/{searchText}', [RouteController::class, 'getCustomerAccountsOutsideRoute']);
    Route::get('/mrb/routes/get-customers-out-route-api/{route}/{barangay}', [RouteController::class, 'getCustomerAccountsOutsideRoute']);
    Route::put('/mrb/routes/remove-account-from-route/{account}', [RouteController::class, 'removeAccountFromRoute']);
    Route::patch('/mrb/routes/add-accounts-to-route-api', [RouteController::class, 'addAccountsToRouteApi']);

    //Meter Reading
    Route::get('/mrb/reading/schedule', [ReadingScheduleController::class, 'index'])->name('mrb.reading.schedule');
    Route::patch('/mrb/reading/schedule/generate-or-fetch/{billing_month}', [ReadingScheduleController::class, 'generateOrFetchReadingSchedules'])->name('mrb.reading.schedule.generate-or-fetch');
    Route::get('/mrb/reading/accounts-in-route/{route}', [ReadingScheduleController::class, 'customerAccountsInRoute'])->name('mrb.reading.accounts-in-route');
    Route::patch('/mrb/reading/update-meter-reader-api/{readingSchedule}', [ReadingScheduleController::class, 'updateMeterReaderApi'])->name('mrb.reading.update-meter-reader-api');
    Route::delete('/mrb/reading/schedule/clear-api/{billing_month}', [ReadingScheduleController::class, 'clearSchedule'])->name('mrb.reading.schedule.clear-api');
    Route::patch('/mrb/reading/schedule/{readingSchedule}/update-reading-schedule-api', [ReadingScheduleController::class, 'updateReadingScheduleApi'])->name('mrb.reading.schedule.update-reading-schedule-api');
});



require __DIR__ . '/crm.php';
require __DIR__ . '/csf.php';
require __DIR__ . '/tests.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
