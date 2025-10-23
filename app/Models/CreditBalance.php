<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditBalance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_application_id',
        'account_number',
        'credit_balance',
    ];

    protected $casts = [
        'credit_balance' => 'decimal:2',
    ];

    /**
     * Get the customer application that owns this credit balance
     */
    public function customerApplication(): BelongsTo
    {
        return $this->belongsTo(CustomerApplication::class);
    }

    /**
     * Get all credit balance definitions (transactions) for this credit balance
     */
    public function definitions(): HasMany
    {
        return $this->hasMany(CreditBalanceDefinition::class);
    }

    /**
     * Add credit to the balance (e.g., overpayment, refund)
     */
    public function addCredit(float $amount, ?string $source = null): CreditBalanceDefinition
    {
        $lastBalance = $this->credit_balance;
        $this->credit_balance += $amount;
        $this->save();

        return $this->definitions()->create([
            'amount' => $amount,
            'last_balance' => $lastBalance,
            'source' => $source,
        ]);
    }

    /**
     * Deduct credit from the balance (e.g., apply to bill)
     */
    public function deductCredit(float $amount, ?string $source = null): CreditBalanceDefinition
    {
        $lastBalance = $this->credit_balance;
        $this->credit_balance -= $amount;
        $this->save();

        return $this->definitions()->create([
            'amount' => -$amount, // Negative for deduction
            'last_balance' => $lastBalance,
            'source' => $source,
        ]);
    }
}
