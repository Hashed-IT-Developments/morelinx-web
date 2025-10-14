<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $latestTransaction = Transaction::search($search)
            ->with('transactionDetails')
            ->latest()
            ->first();

        if ($latestTransaction) {
            $transactionDetails = $latestTransaction->transactionDetails;
            
            // Use database aggregations for better performance
            $aggregates = $latestTransaction->transactionDetails()
                ->selectRaw('COUNT(*) as qty, COALESCE(SUM(total_amount), 0) as subtotal')
                ->first();
            
            $subtotal = floatval($aggregates->subtotal ?? 0);
            $qty = intval($aggregates->qty ?? 0);
        } else {
            $transactionDetails = collect();
            $subtotal = 0;
            $qty = 0;
        }
        
        return inertia('transactions/index', [
            'search' => $search,
            'latestTransaction' => $latestTransaction,
            'transactionDetails' => $transactionDetails,
            'subtotal' => $subtotal,
            'qty' => $qty
        ]);
    }
}
