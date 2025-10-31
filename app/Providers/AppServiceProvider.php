<?php

namespace App\Providers;

use App\Enums\RolesEnum;
use App\Events\MakeNotification;
use App\Listeners\StoreNotification;
use App\Models\CustomerApplication;
use App\Models\Transaction;
use App\Observers\CustomerApplicationObserver;
use App\Observers\TransactionObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers
        CustomerApplication::observe(CustomerApplicationObserver::class);
        Transaction::observe(TransactionObserver::class);

        // Allow SUPERADMIN to bypass all Gate checks (permissions) only in local environment
        Gate::before(function ($user, $ability) {
            if (app()->isLocal() && $user->hasRole(RolesEnum::SUPERADMIN)) {
                return true;
            }
        });

        // Register event listeners
        Event::listen(
            MakeNotification::class,
            StoreNotification::class,
        );
    }
}
