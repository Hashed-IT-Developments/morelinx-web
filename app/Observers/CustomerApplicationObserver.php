<?php

namespace App\Observers;

use App\Models\CustomerApplication;

class CustomerApplicationObserver
{
    /**
     * Handle the CustomerApplication "created" event.
     * 
     * Automatically creates a CustomerAccount when a CustomerApplication is created.
     */
    public function created(CustomerApplication $customerApplication): void
    {
        $customerApplication->createAccount();
    }

    // Note: Other lifecycle events (updated, deleted, restored, forceDeleted) 
    // are intentionally left empty as they don't require special handling
}
