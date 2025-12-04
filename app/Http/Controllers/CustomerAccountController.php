<?php

namespace App\Http\Controllers;

use App\Enums\AccountStatusEnum;
use App\Events\MakeLog;
use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerAccountController extends Controller
{
    public function index(Request $request)
    {
    return inertia('accounts/index', [
        'accounts' => Inertia::defer(function () use ($request) {

            $search = $request->search;

            $query = CustomerAccount::with('application')
                ->orderBy('created_at', 'desc');

            if ($search) {
                $query->search($search);
                if ($query->count() === 0) {
                    return null;
                }
            }

            return $query->paginate(10);

   
        }),
        'search' => $request->search,
    ]);

    }

    public function show(CustomerAccount $account){
        return inertia('accounts/show', [
            'account' => $account->load('application.meters'),
        ]);
    }

    public function activations(Request $request)
    {
        return inertia('cms/applications/activations/index', [
            'accounts' => Inertia::defer(function () use ($request) {
                $accounts = CustomerAccount::whereHas('application.energization', function($query) {
                        $query->where('status', 'completed');
                    })
                   ->where(
                'account_status', 'pending'
                   )
                    ->when($request->input('search'), fn($query) =>
                        $query->where('applicant_name', 'like', '%' . $request->input('search') . '%')
                    )
                    ->with(['application'])
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

        event(new MakeLog(
            'account',
            $accountId,
            'Changed account status to ' . $newStatus,
            Auth::user()->name . ' updated the account status to ' . $newStatus . '.',
            Auth::user()->id,
        ));

       
       if(!$account) {
           return back()->withErrors(['Account not found.']);
       }

       return back()->with('success', 'Application status updated successfully.');
    }


    public function getStatuses()
    {
        $statuses = AccountStatusEnum::getValues();

        return response()->json($statuses);
    }

    public function approve(CustomerAccount $account)
    {
         if(!$account) {
            return back()->withErrors(['Account not found.']);
        }
    
        $account->update([
            'account_status' => AccountStatusEnum::ACTIVE,
        ]);
     
        if($account) {
        
            event(new MakeLog(
                'account',
                $account->id,
                'Verified account',
                Auth::user()->name . ' verified the account.',
                Auth::user()->id,
            ));
        }


        return back()->with('success', 'Account verified successfully.');
    }

    public function summary(CustomerAccount $account)
    {
        $account->load([
            'application' => function($query) {
                $query->select([
                    'id',
                    'account_number',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'suffix',
                    'birth_date',
                    'gender',
                    'marital_status',
                    'nationality',
                    'email_address',
                    'mobile_1',
                    'mobile_2',
                    'tel_no_1',
                    'tel_no_2',
                    'barangay_id',
                    'district_id',
                    'unit_no',
                    'building',
                    'street',
                    'subdivision',
                    'sitio',
                    'landmark'
                ]);
            },
            'application.barangay.town',
            'barangay.town',
            'district',
            'customerType',
            'application.meters'
        ]);

        return response()->json($account);
    }
}
