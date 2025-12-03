<?php

namespace App\Models;

use App\Enums\ModuleName;
use App\Enums\TransactionStatusEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transactionable_type',
        'transactionable_id',
        'transaction_series_id',
        'or_number',
        'generation_id', // Multi-cashier: Link to OR generation record for BIR audit
        'is_manual_or_number',
        'or_date',
        'total_amount',
        'amount_paid',
        'credit_applied',
        'change_amount',
        'net_collection',
        'description',
        'user_id',
        'account_number',
        'account_name',
        'meter_number',
        'meter_status',
        'address',
        'ewt',
        'ewt_type',
        'ft',
        'quantity',
        'payment_mode',
        'payment_area',
        'status',
    ];

    protected $casts = [
        'or_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'credit_applied' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'net_collection' => 'decimal:2',
        'ewt' => 'decimal:2',
        'ft' => 'decimal:2',
        'quantity' => 'decimal:2',
        'is_manual_or_number' => 'boolean',
        'status' => TransactionStatusEnum::class,
    ];

    /**
     * Get the parent transactionable model (CustomerAccount, Ticket, etc.).
     */
    public function transactionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user (cashier) for this transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transaction series for this transaction.
     */
    public function transactionSeries(): BelongsTo
    {
        return $this->belongsTo(TransactionSeries::class);
    }

    /**
     * Get the OR number generation record for this transaction (multi-cashier audit trail).
     */
    public function orNumberGeneration(): BelongsTo
    {
        return $this->belongsTo(OrNumberGeneration::class, 'generation_id');
    }

    /**
     * Get the transaction details for this transaction.
     * By default, this excludes soft deleted transaction details.
     * Use transactionDetailsWithTrashed() to include soft deleted records.
     */
    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    /**
     * Get the transaction details including soft deleted ones.
     */
    public function transactionDetailsWithTrashed(): HasMany
    {
        return $this->hasMany(TransactionDetail::class)->withTrashed();
    }

    /**
     * Get the payment types for this transaction.
     * By default, this excludes soft deleted payment types.
     */
    public function paymentTypes(): HasMany
    {
        return $this->hasMany(PaymentType::class);
    }

    /**
     * Get the payment types including soft deleted ones.
     */
    public function paymentTypesWithTrashed(): HasMany
    {
        return $this->hasMany(PaymentType::class)->withTrashed();
    }

    public function scopeSearch(Builder $query, ?string $searchTerms): void
    {
        if (empty($searchTerms)) {
            return;
        }
        
        $searchTerms = trim($searchTerms);

        $query->where(function ($q) use ($searchTerms) {
            $q->where('account_number', 'ilike', "%{$searchTerms}%")
                ->orWhereRaw("LOWER(account_name) LIKE ?", ['%' . strtolower($searchTerms) . '%'])
                ->orWhereRaw("LOWER(meter_number) LIKE ?", ['%' . strtolower($searchTerms) . '%'])
                ->orWhereRaw("LOWER(meter_status) LIKE ?", ['%' . strtolower($searchTerms) . '%']);
        });
    }
}
