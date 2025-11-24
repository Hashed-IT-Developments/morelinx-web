<?php

namespace App\Observers;

use App\Models\BillDetail;
use App\Models\Reading;

class ReadingObserver
{
    /**
     * Handle the Reading "created" event.
     */
    public function created(Reading $reading): void
    {
        //
    }

    /**
     * Handle the Reading "updated" event.
     */
    public function updated(Reading $reading): void
    {
        //get billing or create if it doesn't exists
        $bill = $reading->billDetail;

        $rates = $reading->getUmsRate();

        if (! $bill) {
            $billNumber = (int)(str_replace('-', '', $reading->bill_month) . $reading->customer_account_id);
            $customerAccount = $reading->customerAccount;

            $bill = BillDetail::create([
                'customer_account_id' => $customerAccount->id,
                'bill_month' => $reading->bill_month,
                'bill_number' => $billNumber,
                'reading_id' => $reading->id,
                'customer_type_id' => $customerAccount->customer_type_id,
                'kwh_consumption' => $reading->kwh_consumption ?? 0,
                'status' => 'unpaid',
            ]);
        }
        }

        /**
         * Handle the Reading "deleted" event.
         */
        public function deleted(Reading $reading): void
        {
        //
        }

    /**
     * Handle the Reading "restored" event.
     */
    public function restored(Reading $reading): void
    {
        //
    }

    /**
     * Handle the Reading "force deleted" event.
     */
    public function forceDeleted(Reading $reading): void
    {
        //
    }
}
