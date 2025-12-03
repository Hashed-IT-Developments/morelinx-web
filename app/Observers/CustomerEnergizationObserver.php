<?php

namespace App\Observers;

use App\Models\AgeingTimeline;
use App\Models\CustomerEnergization;

class CustomerEnergizationObserver
{
    /**
     * Handle the CustomerEnergization "created" event.
     */
    public function created(CustomerEnergization $customerEnergization): void
    {
        //
    }

    /**
     * Handle the CustomerEnergization "updated" event.
     */
    public function updated(CustomerEnergization $customerEnergization)
    {
        if (!$customerEnergization->customerApplication) {
            return;
        }

        $timelineData = [];

        if ($customerEnergization->wasChanged('date_installed') && $customerEnergization->date_installed) {
            $timelineData['installed_date'] = $customerEnergization->date_installed;
        }

        if ($customerEnergization->wasChanged('status') && $customerEnergization->status === 'activated') {
            $timelineData['activated'] = now();
        }

        if (!empty($timelineData)) {
            AgeingTimeline::updateOrCreate(
                ['customer_application_id' => $customerEnergization->customer_application_id],
                $timelineData
            );
        }
    }

    /**
     * Handle the CustomerEnergization "deleted" event.
     */
    public function deleted(CustomerEnergization $customerEnergization): void
    {
        //
    }

    /**
     * Handle the CustomerEnergization "restored" event.
     */
    public function restored(CustomerEnergization $customerEnergization): void
    {
        //
    }

    /**
     * Handle the CustomerEnergization "force deleted" event.
     */
    public function forceDeleted(CustomerEnergization $customerEnergization): void
    {
        //
    }
}
