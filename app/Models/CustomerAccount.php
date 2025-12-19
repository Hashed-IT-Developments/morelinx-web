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
                ->orWhereRaw("LOWER(account_name) LIKE ?", ['%' . strtolower($search) . '%'])
                ->orWhereHas('customerApplication', function ($q) use ($search) {
                    $q->search($search);
                });
        });
    }

    public function customerApplication(): BelongsTo {
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

    public function creditBalance(): HasOne
    {
        return $this->hasOne(CreditBalance::class);
    }


    public function areEnergizationPayablesPaid(): bool
    {
        $energizationPayables = $this->payables()
            ->where('payable_category', PayableCategoryEnum::ENERGIZATION)
            ->get();

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

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'account_number', 'account_number');
    }

    public function isHighVoltage(): bool
    {
        return $this->customerType && $this->customerType->customer_type=='high_voltage';
    }

    public function getPreviousReadingForMonth(string $billingMonth): ?Reading
    {
        return $this->readings()
            ->where('bill_month', '<', $billingMonth)
            ->orderBy('bill_month', 'desc')
            ->first();
    }

    public function getPreviousReadingValueForMonth(string $billingMonth): int
    {
        $previousReading = $this->getPreviousReadingForMonth($billingMonth);
        return $previousReading ? $previousReading->present_reading : $this->getInitialReadingValue();
    }

    public function getPreviousDemandReadingValueForMonth(string $billingMonth): int
    {
        $previousReading = $this->getPreviousReadingForMonth($billingMonth);
        return $previousReading ? $previousReading->demand_present_reading : 0;
    }

    public function getPreviousSolarReadingValueForMonth(string $billingMonth): int
    {
        $previousReading = $this->getPreviousReadingForMonth($billingMonth);
        return $previousReading ? $previousReading->solar_reading : 0;
    }

    public function getLatestReading(): ?Reading
    {
        return $this->readings()
            ->orderBy('bill_month', 'desc')
            ->first();
    }

    public function getInitialReadingValue(): int {
        $firstMeter = $this->customerApplication->meters->first();
        return $firstMeter ? $firstMeter->initial_reading_value: 0;
    }

}
