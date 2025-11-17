<?php

namespace App\Models;

use App\Enums\PayableCategoryEnum;
use App\Enums\PayableStatusEnum;
use App\Models\Traits\HasTransactions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class CustomerAccount extends Model
{
    use HasFactory, HasTransactions;

    protected $guarded = [];

    /**
     * Generate the next available series number using gap-filling logic
     * Finds the smallest available number >= 10000
     *
     * @return int
     */
    public static function getNextSeriesNumber(): int
    {
        return DB::transaction(function () {
            // Find the smallest gap in the series, starting from 10000
            // Using a more efficient PostgreSQL-compatible query
            $result = DB::select("
                SELECT COALESCE(
                    (SELECT MIN(series_number) + 1
                     FROM customer_accounts
                     WHERE series_number >= 10000
                     AND NOT EXISTS (
                         SELECT 1 FROM customer_accounts ca2
                         WHERE ca2.series_number = customer_accounts.series_number + 1
                     )
                    ),
                    COALESCE(
                        (SELECT MAX(series_number) + 1 FROM customer_accounts WHERE series_number >= 10000),
                        10000
                    )
                ) AS next_number
            ");

            return (int) $result[0]->next_number;
        });
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('account_number', 'like', "%{$search}%")
              ->orWhere('account_name', 'like', "%{$search}%")
              ->orWhereHas('application', function ($q) use ($search) {
                  $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
              });
        });
    }

    public function application(): BelongsTo {
        return $this->belongsTo(CustomerApplication::class, 'customer_application_id');
    }

    public function barangay(): BelongsTo {
        return $this->belongsTo(Barangay::class);
    }

    public function district(): BelongsTo {
        return $this->belongsTo(District::class);
    }

    public function route(): BelongsTo {
        return $this->belongsTo(Route::class);
    }

    public function customerType(): BelongsTo {
        return $this->belongsTo(CustomerType::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function payables(): HasMany
    {
        return $this->hasMany(Payable::class);
    }

    public function readings(): HasMany {
        return $this->hasMany(Reading::class);
    }

    /**
     * Get the credit balance for this customer account
     */
    public function creditBalance(): HasOne
    {
        return $this->hasOne(CreditBalance::class);
    }

    /**
     * Check if all energization payables are fully paid
     *
     * @return bool
     */
    public function areEnergizationPayablesPaid(): bool
    {
        $energizationPayables = $this->payables()
            ->where('payable_category', PayableCategoryEnum::ENERGIZATION)
            ->get();

        // Must have exactly 3 energization payables
        if ($energizationPayables->count() !== 3) {
            return false;
        }

        // All must be paid
        return $energizationPayables->every(function ($payable) {
            return $payable->status === PayableStatusEnum::PAID;
        });
    }

    /**
     * Get energization payables for this account
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getEnergizationPayables()
    {
        return $this->payables()
            ->where('payable_category', PayableCategoryEnum::ENERGIZATION)
            ->get();
    }

    /**
     * Get count of paid energization payables
     *
     * @return int
     */
    public function getPaidEnergizationPayablesCount(): int
    {
        return $this->payables()
            ->where('payable_category', PayableCategoryEnum::ENERGIZATION)
            ->where('status', PayableStatusEnum::PAID)
            ->count();
    }
}
