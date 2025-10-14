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
            ->latest()
            ->first();

        $transactionDetails = $latestTransaction ? $latestTransaction->transactionDetails : collect();
        $subtotal = $transactionDetails->sum(function ($d) {
            return floatval($d->total_amount ?? 0);
        });
        $qty = $transactionDetails->count();
        
        return inertia('transactions/index', [
            'search' => $search,
            'latestTransaction' => $latestTransaction,
            'transactionDetails' => $transactionDetails,
            'subtotal' => $subtotal,
            'qty' => $qty
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
