<?php

namespace App\Providers;

use App\Enums\RolesEnum;
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
        // Allow SUPERADMIN to bypass all Gate checks (permissions) only in local environment
        Gate::before(function ($user, $ability) {
            if (app()->isLocal() && $user->hasRole(RolesEnum::SUPERADMIN)) {
                return true;
            }
        });
    }
}
