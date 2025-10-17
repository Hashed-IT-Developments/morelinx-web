<?php

namespace App\Models\Traits;

use App\Enums\TransactionStatusEnum;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasTransactions
{
    /**
     * Get all transactions for this model (polymorphic relationship).
     */
    public function transactions(): MorphMany
    {
        return $this->morphMany(Transaction::class, 'transactionable');
    }

    /**
     * Get completed transactions only.
     */
    public function completedTransactions(): MorphMany
    {
        return $this->transactions()->where('status', TransactionStatusEnum::COMPLETED);
    }

    /**
     * Get pending transactions only.
     */
    public function pendingTransactions(): MorphMany
    {
        return $this->transactions()->where('status', TransactionStatusEnum::PENDING);
    }

    /**
     * Get cancelled transactions only.
     */
    public function cancelledTransactions(): MorphMany
    {
        return $this->transactions()->where('status', TransactionStatusEnum::CANCELLED);
    }

    /**
     * Get processing transactions only.
     */
    public function processingTransactions(): MorphMany
    {
        return $this->transactions()->where('status', TransactionStatusEnum::PROCESSING);
    }

    /**
     * Get total amount of all completed transactions.
     */
    public function getTotalCompletedAmountAttribute(): float
    {
        return $this->completedTransactions()->sum('total_amount');
    }

    /**
     * Check if this model has any transactions.
     */
    public function hasTransactions(): bool
    {
        return $this->transactions()->exists();
    }

    /**
     * Check if this model has any completed transactions.
     */
    public function hasCompletedTransactions(): bool
    {
        return $this->completedTransactions()->exists();
    }
}