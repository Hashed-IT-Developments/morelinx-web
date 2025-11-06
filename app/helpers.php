<?php

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
