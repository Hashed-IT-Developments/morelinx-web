<?php

use App\Enums\PermissionsEnum;
use App\Http\Controllers\Amendments\AmendmentRequestController;
use App\Http\Controllers\Api\CustomerApplicationInspectionController;
use App\Http\Controllers\Api\CustomerEnergizationController;
use App\Http\Controllers\ApplicationContractController;
use App\Http\Controllers\ApprovalFlowSystem\ApprovalController;
use App\Http\Controllers\CustomerAccountController;
use App\Http\Controllers\CustomerApplicationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {

    Route::resource('applications', CustomerApplicationController::class)->parameters(['applications' => 'customerApplication']);
    Route::get('/customer-applications', [CustomerApplicationController::class, 'index'])->name('customer-applications.index');
    Route::get('/customer-applications/statuses', [CustomerApplicationController::class, 'getStatuses'])->name('customer-applications.statuses');
    Route::get('/customer-applications/{application}/approval-status', [CustomerApplicationController::class, 'approvalStatus'])->middleware('can:' . PermissionsEnum::VIEW_INSPECTIONS)->name('customer-applications.approval-status');
    Route::get('/customer-applications/{application}/summary', [CustomerApplicationController::class, 'summary'])->name('customer-applications.summary');
    Route::get('/customer-applications/{application}/inspection/summary', [CustomerApplicationInspectionController::class, 'summaryByApplication'])->name('customer-applications.inspection.summary');
    Route::get('/customer-applications/installations/{status}', [CustomerApplicationController::class, 'getInstallationByStatus'])->name('applications.get-installation-by-status');
    Route::patch('/customer-applications/status-update', [CustomerApplicationController::class, 'statusUpdate'])->name('applications.status-update');
    Route::patch('/customer-applications/installation-decline', [CustomerApplicationController::class, 'declineInstallation'])->name('customer-applications.decline-installation');
    Route::patch('/customer-applications/installation-approve', [CustomerApplicationController::class, 'approveInstallation'])->name('customer-applications.approve-installation');
    Route::post('/customer-applications/{application}/cause-of-delays', [CustomerApplicationController::class, 'storeCauseOfDelay'])->name('applications.cause-of-delays.store');

    // Approval
    Route::get('/customer-applications/approvals', [ApprovalController::class, 'applicationsIndex'])->name('applications.approvals');

    // Contract
    Route::get('/customer-applications/contract/pdf/application/{application}', [ApplicationContractController::class, 'generatePdfFromApplication'])->name('contracts.stream');
    Route::get('/customer-applications/contract/pdf/{contract}', [ApplicationContractController::class, 'generatePdf'])->name('contracts.show');
    Route::put('/customer-applications/contract/{contract}', [ApplicationContractController::class, 'update'])->name('customer-applications.contract.update');
    Route::get('/customer-applications/contract-signing', [ApplicationContractController::class, 'showContractSigning'])->name('applications.contract-signing');
    Route::post('/customer-applications/contract-signing/save-signature', [ApplicationContractController::class, 'saveSignature'])->name('customer-applications.contract-signing.save-signature');
   

    // Ammendments
    Route::put('/customer-applications/amendments/{customerApplication}', [AmendmentRequestController::class, 'store'])->middleware('can:' . PermissionsEnum::REQUEST_CUSTOMER_INFO_AMENDMENTS)->name('amendment-request.store');
    Route::put('/customer-application/amendments/action/{amendmentRequest}/{action}', [AmendmentRequestController::class, 'takeAction'])->name('amendment-request.action');
    Route::get('/customer-applications/amendments/history/{customerApplication}', [AmendmentRequestController::class, 'getHistory'])->name('customer-applications.amendment-history');
    Route::get('/customer-applications/amendments/', [AmendmentRequestController::class, 'index'])->name('amendment-requests.index');
    

    // Energization
    Route::get('/customer-applications/{application}/energization/summary', [CustomerEnergizationController::class, 'summaryByApplication'])->name('customer-applications.energization.summary');
   

    // Account
    Route::get('/accounts', [CustomerAccountController::class, 'index'])->name('accounts.index');
    Route::get('/accounts/{account}', [CustomerAccountController::class, 'show'])->name('accounts.show');
    Route::get('/accounts/{account}/summary', [CustomerAccountController::class, 'summary'])->name('accounts.summary');
    Route::get('/accounts/status/activations', [CustomerAccountController::class, 'activations'])->name('accounts.activations');
    Route::patch('/account/status-update', [CustomerAccountController::class, 'statusUpdate'])->name('account.status-update');
    Route::get('/account/statuses', [CustomerAccountController::class, 'getStatuses'])->name('account.statuses');
    Route::patch('/account/{account}/approve', [CustomerAccountController::class, 'approve'])->name('account.approve');

});