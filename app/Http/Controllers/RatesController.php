<?php

namespace App\Http\Controllers;

use App\Imports\RatesImport;
use Exception;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class RatesController extends Controller
{
    public function index() {
        return inertia('cesra/allrates');
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
            'billing_month' => 'required|string|size:7', // YYYY-MM
        ]);

        try {
            Excel::import(
                new RatesImport($request->billing_month, $request->file('file')),
                $request->file('file')
            );

            return back()->with('success', 'Rates imported successfully!');
        } catch (ValidationException $e) {
            return back()->with('error', $e->getMessage());
        } catch (Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

}
