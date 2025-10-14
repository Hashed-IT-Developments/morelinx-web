<?php

namespace App\Models;

use App\Enums\ModuleName;
use App\Enums\TransactionStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;
    protected $fillable = [
        'transactionable_type',
        'transactionable_id',
        'or_number',
        'or_date',
        'total_amount',
        'description',
        'cashier',
        'account_number',
        'account_name',
        'meter_number',
        'meter_status',
        'address',
        'ewt',
        'ft',
        'quantity',
        'payment_mode',
        'payment_area',
        'status',
    ];

    protected $casts = [
        'or_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'ewt' => 'decimal:2',
        'ft' => 'decimal:2',
        'quantity' => 'decimal:2',
        'status' => TransactionStatusEnum::class,
    ];

    /**
     * Get the parent transactionable model (CustomerApplication, Ticket, etc.).
     */
    public function transactionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the transaction details for this transaction.
     */
    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    /**
     * Get the payment types for this transaction.
     */
    public function paymentTypes(): HasMany
    {
        return $this->hasMany(PaymentType::class);
    }
}
