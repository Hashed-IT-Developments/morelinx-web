<?php

use App\Http\Controllers\WizardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/applications/new', function () {
    return Inertia::render('cms/applications/create');
});
// routes/web.php
Route::post('applications/wizard/step/{step}', [WizardController::class, 'validateStep'])->name('applications.wizard.step');
Route::post('applications/wizard/complete', [WizardController::class, 'complete'])->name('applications.wizard.complete');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
