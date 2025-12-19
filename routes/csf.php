<?php


use App\Http\Controllers\CSF\CSFDashboardController;
use App\Http\Controllers\CSF\CSFSummaryReportController;
use App\Http\Controllers\CSF\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/tickets/dashboard', [CSFDashboardController::class, 'index'])->name('tickets.dashboard');
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::get('/tickets/settings', [TicketController::class, 'settings'])->name('tickets.settings');
    Route::post('/tickets/settings/ticket/{type}/save', [TicketController::class, 'settingsSave'])->name('tickets.settings-ticket-save');
    Route::put('/tickets/settings/ticket/{type}/edit', [TicketController::class, 'settingsEdit'])->name('tickets.settings-ticket-type-edit');
    Route::delete('/tickets/settings/ticket/{type}/delete', [TicketController::class, 'settingsDelete'])->name('tickets.settings-ticket-type-delete');
    Route::post('/tickets/store', [TicketController::class, 'store'])->name('tickets.store');
    Route::get('/tickets/my-tickets', [TicketController::class, 'myTickets'])->name('tickets.my-tickets');
    Route::get('/tickets/view', [TicketController::class, 'view'])->name('tickets.view');
    Route::patch('/tickets/status-update', [TicketController::class, 'statusUpdate'])->name('tickets.status-update');
    Route::post('/tickets/assign', [TicketController::class, 'assign'])->name('tickets.assign');
    Route::get('/tickets/types', [TicketController::class, 'getTicketTypes'])->name('tickets-types.fetch');
    Route::put('/tickets/update', [TicketController::class, 'update'])->name('tickets.update');
    Route::match(['get', 'post'], '/tickets/reports/summary-report', [CSFSummaryReportController::class, 'index'])->name('csf-summary-reports.index');

});
