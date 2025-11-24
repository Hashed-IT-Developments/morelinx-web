<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Reading extends Model
{
    protected $guarded = [];

    public function readingPhotos() {
        return $this->hasMany(ReadingPhoto::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function customerAccount():BelongsTo {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function billDetail(): HasOne {
        return $this->hasOne(BillDetail::class);
    }

    public function getPrevious()
    {
        $previousBillMonth = self::getPreviousBillMonth($this->bill_month);
        $previous = self::where('customer_account_id', $this->customer_account_id)
            ->where('bill_month', $previousBillMonth)
            ->first();
        return $previous;
    }

    public static function initReading($billingMonth) {
        /**
         * Attempt to retrieve all the customer accounts with active status
         * and do not have a reading data for the $billingMonth
         * This is to ensure that even when the user calls initReading
         * multiple times on a bill month, previously-generated readings are not
         * duplicated nor overridden.
         */
        $activeAccounts = CustomerAccount::where('account_status', 'active')
                ->whereDoesntHave('readings', function($q) use ($billingMonth) {
                    $q->where('bill_month', $billingMonth);
                })->get();

        DB::transaction(function () use ($activeAccounts, $billingMonth) {
            foreach($activeAccounts as $account) {
                $previousReading = self::where('customer_account_id', $account->id)
                    ->where('bill_month', self::getPreviousBillMonth($billingMonth))
                    ->first();

                $existingReading = self::where('customer_account_id', $account->id)
                    ->where('bill_month', $billingMonth)
                    ->first();

                if (!$existingReading) {
                    $previousReadingValue = $previousReading ? $previousReading->present_reading : 0;

                    self::create([
                        'customer_account_id' => $account->id,
                        'bill_month' => $billingMonth,
                        'previous_reading' => $previousReadingValue,
                    ]);
                }
            }
        });
    }

    private static function getPreviousBillMonth($billingMonth) {
        $date = \DateTime::createFromFormat('Y-m', $billingMonth);
        $date->modify('-1 month');
        return $date->format('Y-m');
    }

    public function getUmsRate() {
        $rates = UMSRate::where('acct_label', $this->customerAccount->acct_label)
            ->where('du_tag', config('app.du_tag'))
            ->where('billing_month', $this->bill_month)
            ->where('town_id', $this->customerAccount->town_id)
            ->first();

        if(!$rates) {
            //attempt to get rate without town_id
            $rates = UMSRate::where('acct_label', $this->customerAccount->acct_label)
                ->where('du_tag', config('app.du_tag'))
                ->where('billing_month', $this->bill_month)
                ->first();
        }

        return $rates;
    }
}
