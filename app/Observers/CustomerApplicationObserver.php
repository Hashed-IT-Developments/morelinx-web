<?php

namespace App\Observers;

use App\Events\MakeLog;
use App\Models\CustomerApplication;
use Illuminate\Support\Facades\Auth;

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
        
        // Log application creation
        event(new MakeLog(
            'application',
            $customerApplication->id,
            'Application Created',
            'Customer application has been successfully created and submitted.',
            Auth::id(),
        ));
    }

    // Note: Other lifecycle events (updated, deleted, restored, forceDeleted) 
    // are intentionally left empty as they don't require special handling
}
