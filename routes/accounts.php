<?php

use App\Http\Controllers\Accounts\AccountDashboardController;
use App\Http\Controllers\CustomerAccountController;
use Illuminate\Support\Facades\Route;

   
    // Account
    Route::get('/accounts/dashboard', [AccountDashboardController::class,'index'])->name('accounts.dashboard');
    Route::get('/accounts', [CustomerAccountController::class, 'index'])->name('accounts.index');
    Route::get('/accounts/status/activations', [CustomerAccountController::class, 'activations'])->name('accounts.activations');

    Route::get('/account/{account}', [CustomerAccountController::class, 'show'])->name('account.show');
    Route::get('/account/{account}/summary', [CustomerAccountController::class, 'summary'])->name('account.summary');
    Route::patch('/account/status-update', [CustomerAccountController::class, 'statusUpdate'])->name('account.status-update');
    Route::get('/account/statuses', [CustomerAccountController::class, 'getStatuses'])->name('account.statuses');
    Route::patch('/account/{account}/approve', [CustomerAccountController::class, 'approve'])->name('account.approve');
