<?php

namespace App\Observers;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\Payable;
use Illuminate\Console\Application;
use Illuminate\Support\Facades\Log;

class PayableObserver
{
    /**
     * Handle the Payable "updated" event.
     * 
     * When an ISNAP fee payable is fully paid, create a CustApplnInspection
     * for the associated customer application.
     */
    public function updated(Payable $payable): void
    {
        // Log for debugging
        Log::info('PayableObserver: Payable updated', [
            'payable_id' => $payable->id,
            'type' => $payable->type,
            'status' => $payable->status,
            'status_dirty' => $payable->isDirty('status'),
        ]);

        // Check if type is ISNAP_FEE (handle both string and enum)
        $isIsnapFee = $payable->type === PayableTypeEnum::ISNAP_FEE 
            || $payable->type === 'isnap_fee'
            || (string)$payable->type === 'isnap_fee';

        if (!$isIsnapFee) {
            return;
        }

        // Check if status is PAID (handle both string and enum)
        $isPaid = $payable->status === PayableStatusEnum::PAID 
            || $payable->status === 'paid'
            || (string)$payable->status === 'paid';

        if (!$isPaid) {
            return;
        }

        if (!$payable->isDirty('status')) {
            return;
        }

        try {
            // Load customer account with its application and inspections
            $payable->load(['customerAccount.application.inspections']);

            $customerAccount = $payable->customerAccount;

            if (!$customerAccount) {
                Log::warning('PayableObserver: No customer account found', [
                    'payable_id' => $payable->id,
                ]);
                return;
            }

            // Get the application for this account
            $isnapApplication = $customerAccount->application;

            if (!$isnapApplication) {
                Log::warning('PayableObserver: No application found for customer account', [
                    'payable_id' => $payable->id,
                    'customer_account_id' => $customerAccount->id,
                ]);
                return;
            }

            // Verify it's an ISNAP application
            if (!$isnapApplication->is_isnap) {
                Log::warning('PayableObserver: Application is not ISNAP', [
                    'payable_id' => $payable->id,
                    'application_id' => $isnapApplication->id,
                ]);
                return;
            }

            // Check if inspection already exists
            if ($isnapApplication->inspections && $isnapApplication->inspections->count() > 0) {
                Log::info('PayableObserver: Inspection already exists', [
                    'payable_id' => $payable->id,
                    'application_id' => $isnapApplication->id,
                ]);
                return;
            }

            // Create inspection record
            $inspection = CustApplnInspection::create([
                'customer_application_id' => $isnapApplication->id,
                'status' => InspectionStatusEnum::FOR_INSPECTION
            ]);

            $isnapApplication->update(['status' => ApplicationStatusEnum::FOR_INSPECTION]);

            Log::info('PayableObserver: Successfully created inspection', [
                'payable_id' => $payable->id,
                'application_id' => $isnapApplication->id,
                'inspection_id' => $inspection->id,
            ]);

        } catch (\Exception $e) {
            Log::error('PayableObserver: Failed to create inspection after ISNAP payment', [
                'payable_id' => $payable->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
