<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Models\CustomerAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountDashboardController extends Controller
{
    public function index(){


        return inertia('accounts/dashboard', [
            'pending' => Inertia::defer(
                function () {
                    $pending = CustomerAccount::where('account_status', 'pending')->count();

                    return $pending;
                }
            ),
            'activated' => Inertia::defer(
                function () {
                    $activated = CustomerAccount::where('account_status', 'active')->count();
                    return $activated;
                }
            ),
            'suspended' => Inertia::defer(
                function () {
                    $suspended = CustomerAccount::where('account_status','suspended')->count();

                    return $suspended;
                }
            ),


        ]);
    }
}
