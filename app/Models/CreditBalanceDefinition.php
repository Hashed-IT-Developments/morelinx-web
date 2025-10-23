<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CreditBalanceDefinition extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'credit_balance_id',
        'amount',
        'last_balance',
        'source',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'last_balance' => 'decimal:2',
    ];

    /**
     * Get the credit balance that owns this definition
     */
    public function creditBalance(): BelongsTo
    {
        return $this->belongsTo(CreditBalance::class);
    }
}
