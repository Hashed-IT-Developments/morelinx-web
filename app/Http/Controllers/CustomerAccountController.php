<?php

namespace App\Http\Controllers;

use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerAccountController extends Controller
{
    public function index(Request $request)
    {
    return inertia('accounts/index', [
        'accounts' => Inertia::defer(function () use ($request) {

            $accounts = CustomerAccount::with('application')
                ->when($request->search, fn($query) =>
                    $query->where('account_name', 'like', '%' . $request->search . '%')
                   

                )
                ->paginate(10);

            return $accounts;
        }),
        'search' => $request->search,
    ]);

    }

    public function show(CustomerAccount $account){
        return inertia('accounts/show', [
            'account' => $account->load('application'),
        ]);
    }

    public function forApproval(Request $request)
    {
        return inertia('cms/applications/for-approval/index', [
            'accounts' => Inertia::defer(function () use ($request) {
                $accounts = CustomerApplication::where('status' , 'verified')
                    ->whereHas('account', function($query) {
                        $query->where('account_status', 'pending');
                    })
                    ->when($request->input('search'), fn($query) =>
                        $query->where('applicant_name', 'like', '%' . $request->input('search') . '%')
                    )
                    ->paginate(10);

                return $accounts;
            }),
            'search' => $request->input('search'),
        ]);

    }

   public function statusUpdate( Request $request)
    {
        $accountId = $request->input('account_id');
        $newStatus = $request->input('status');

        $account = CustomerAccount::find($accountId);
        $account->account_status = $newStatus;
        $account->save();

       
       if(!$account) {
           return back()->withErrors(['Account not found.']);
       }

       return back()->with('success', 'Application status updated successfully.');
    }
}
