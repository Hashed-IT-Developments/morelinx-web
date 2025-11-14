<?php

namespace App\Observers;

use App\Events\MakeLog;
use App\Events\TransactionOrCreated;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     * 
     * Broadcasts the OR number creation for real-time updates to TREASURY users.
     */
    public function created(Transaction $transaction): void
    {
        // Extract numeric OR from the full OR number (e.g., "CR0000000123" -> 123)
        if ($transaction->or_number && preg_match('/(\d+)$/', $transaction->or_number, $matches)) {
            $numericOr = (int) $matches[1];

            TransactionOrCreated::dispatch(
                $transaction->or_number,
                $numericOr,
                $transaction->user->name ?? 'Unknown'
            );
        }
        
        // Log payment transaction for customer applications
        if ($transaction->transactionable_type === 'App\\Models\\CustomerApplication') {
            event(new MakeLog(
                'application',
                $transaction->transactionable_id,
                'Payment Received',
                'Payment has been verified and recorded. OR Number: ' . $transaction->or_number,
                Auth::id(),
            ));
        }
    }

    // Note: Other lifecycle events (updated, deleted, restored, forceDeleted) 
    // are intentionally left empty as they don't require special handling
}
