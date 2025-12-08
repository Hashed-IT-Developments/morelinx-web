<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ReportScheduleController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // System Settings (ISNAP fee, etc.)
    Route::get('settings/system', [SettingsController::class, 'index'])->name('settings.system');
    Route::put('settings/system/{key}', [SettingsController::class, 'update'])->name('settings.update');

    // Report Schedules (Admin Only)
    Route::middleware(['role:superadmin|admin'])->group(function () {
        Route::get('settings/report-schedules', [ReportScheduleController::class, 'index'])->name('settings.report-schedules.index');
        Route::post('settings/report-schedules', [ReportScheduleController::class, 'update'])->name('settings.report-schedules.update');
        Route::post('settings/report-schedules/test-send', [ReportScheduleController::class, 'testSend'])->name('settings.report-schedules.test-send');
    });
});
