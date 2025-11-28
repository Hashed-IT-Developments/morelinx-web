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

    protected $fillable = [
        'customer_application_id',
        'account_number',
        'code',
        'series_number',
        'account_name',
        'barangay_id',
        'district_id',
        'route_id',
        'block',
        'customer_type_id',
        'account_status',
        'contact_number',
        'email_address',
        'customer_id',
        'pole_number',
        'sequence_code',
        'feeder',
        'compute_type',
        'organization',
        'org_parent_account',
        'meter_loc',
        'old_account_no',
        'user_id',
        'group_code',
        'multiplier',
        'core_loss',
        'evat_5_pct',
        'evat_2_pct',
        'connection_date',
        'latest_reading_date',
        'date_disconnected',
        'date_transfered',
        'acct_pmt_type',
        'contestable',
        'net_metered',
        'notes',
        'migrated',
        'life-liner',
        'life_liner_date_applied',
        'life_liner_date_expire',
        'is_sc',
        'sc_date_applied',
        'sc_date_expired',
        'house_number',
        'is_isnap',
    ];


    public static function getNextSeriesNumber(): int
    {
        return DB::transaction(function () {

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
           
              ->orWhereHas('application', function ($q) use ($search) {
                  $q->search($search);

              })->orWhereRaw("LOWER(account_name) LIKE ?", ['%' . strtolower($search) . '%']);
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


    public function areEnergizationPayablesPaid(): bool
    {
        $energizationPayables = $this->payables()
            ->where('payable_category', PayableCategoryEnum::ENERGIZATION)
            ->get();

        if ($energizationPayables->count() !== 3) {
            return false;
        }


        return $energizationPayables->every(function ($payable) {
            return $payable->status === PayableStatusEnum::PAID;
        });
    }


    public function getEnergizationPayables()
    {
        return $this->payables()
            ->where('payable_category', PayableCategoryEnum::ENERGIZATION)
            ->get();
    }


    public function getPaidEnergizationPayablesCount(): int
    {
        return $this->payables()
            ->where('payable_category', PayableCategoryEnum::ENERGIZATION)
            ->where('status', PayableStatusEnum::PAID)
            ->count();
    }



}
