<?php

use App\Models\Setting;
use App\Services\PayableService;

if (!function_exists('payable')) {
    /**
     * Create a new payable using the fluent builder interface
     * 
     * @return \App\Services\PayableService
     * 
     * @example
     * payable()
     *     ->billTo($customerId)
     *     ->connectionFee()
     *     ->totalAmountDue(2500)
     *     ->save();
     */
    function payable(): PayableService
    {
        return PayableService::createPayable();
    }
}

if (!function_exists('setting')) {
    /**
     * Get a setting value by key with optional default fallback
     * 
     * @param string $key The setting key to retrieve
     * @param mixed $default Default value if setting not found
     * @return mixed The setting value with proper type casting
     * 
     * @example
     * $isnapFee = setting('isnap_fee', 850.00);
     * $maintenanceMode = setting('maintenance_mode', false);
     */
    function setting(string $key, mixed $default = null): mixed
    {
        static $cache = [];

        // Check if we've already cached this setting in this request
        if (array_key_exists($key, $cache)) {
            return $cache[$key];
        }

        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            $cache[$key] = $default;
            return $default;
        }

        $cache[$key] = $setting->value;
        return $setting->value;
    }
}
