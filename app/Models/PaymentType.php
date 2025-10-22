<?php

namespace App\Models;

use App\Enums\PaymentTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentType extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'transaction_id',
        'payment_type',
        'amount',
        'bank',
        'check_number',
        'check_issue_date',
        'bank_transaction_number',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'check_issue_date' => 'date',
        'payment_type' => PaymentTypeEnum::class,
    ];

    /**
     * Get the transaction that owns this payment type.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
