<?php

namespace App\Http\Controllers;

use App\Imports\RatesImport;
use App\Models\Town;
use App\Models\UmsRate;
use Exception;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class RatesController extends Controller
{
    public function index(Request $request) {
        $towns = Town::whereHas('umsRates')->orderBy('name')->get();

        $billingMonths = UmsRate::select('billing_month')
            ->distinct()
            ->orderBy('billing_month', 'desc')
            ->pluck('billing_month')
            ->toArray();

        $selectedBillingMonth = $request->input('billing_month', $billingMonths[0] ?? null);

        $ratesData = [];
        if ($selectedBillingMonth) {
            foreach ($towns as $town) {
                $ratesData[$town->id] = UmsRate::where('town_id', $town->id)
                    ->where('billing_month', $selectedBillingMonth)
                    ->get();
            }
        }

        return inertia('cesra/allrates', [
            'towns' => $towns,
            'billingMonths' => $billingMonths,
            'selectedBillingMonth' => $selectedBillingMonth,
            'ratesData' => $ratesData,
        ]);
    }

    public function upload() {
        return inertia('cesra/rates-upload');
    }

    public function approvals() {
        return 'approvals.page';
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
            'billing_month' => 'required|string|size:7',
        ]);

        try {
            Excel::import(
                new RatesImport($request->billing_month, $request->file('file')),
                $request->file('file')
            );

            return back()->with('success', 'Rates imported successfully!');
        } catch (Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    public function apiDownload()
    {
        $billingMonthNow = date('Y-m');
        $billingMonthPrev1 = date('Y-m', strtotime('-1 month'));
        $billingMonthPrev2 = date('Y-m', strtotime('-2 months'));

        $rates = UmsRate::whereIn('billing_month', [
            $billingMonthNow,
            $billingMonthPrev1,
            $billingMonthPrev2
        ])->orderBy('billing_month', 'ASC')
        ->orderBy('acct_label','ASC')
        ->get();

        return response()->json([
            'rates' => $rates
        ]);
    }

}
