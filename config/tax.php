<?php

return [

    /*
    |--------------------------------------------------------------------------
    | EWT (Expanded Withholding Tax) Rates
    |--------------------------------------------------------------------------
    |
    | Philippine tax rates for expanded withholding tax on utility services.
    | These rates are applied to taxable payables (excluding deposits).
    |
    | - Government/LGU: 2.5% (as per BIR regulations)
    | - Commercial/Corporate: 5% (as per BIR regulations)
    |
    */

    'ewt_rates' => [
        'government' => env('EWT_RATE_GOVERNMENT', 0.02),  // 2.5% - for government entities and LGUs
        'commercial' => env('EWT_RATE_COMMERCIAL', 0.05),   // 5% - for commercial/corporate customers
    ],

    /*
    |--------------------------------------------------------------------------
    | EWT Rate Labels
    |--------------------------------------------------------------------------
    |
    | Human-readable labels for EWT rates used in UI and reports.
    |
    */

    'ewt_rate_labels' => [
        'government' => '2.0% (BIR Form 2307)',
        'commercial' => '5% (BIR Form 2307)',
    ],

    /*
    |--------------------------------------------------------------------------
    | EWT Configuration
    |--------------------------------------------------------------------------
    |
    | Additional EWT settings
    |
    */

    'ewt_enabled' => env('EWT_ENABLED', true),

    // Minimum amount threshold for EWT application (optional)
    'ewt_minimum_threshold' => env('EWT_MINIMUM_THRESHOLD', 0),

];
