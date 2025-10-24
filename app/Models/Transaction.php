<?php

namespace App\Models;

use App\Enums\ModuleName;
use App\Enums\TransactionStatusEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transactionable_type',
        'transactionable_id',
        'or_number',
        'or_date',
        'total_amount',
        'amount_paid',
        'credit_applied',
        'change_amount',
        'net_collection',
        'description',
        'cashier',
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
