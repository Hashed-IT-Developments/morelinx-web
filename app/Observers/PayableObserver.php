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
        if ($payable->type != PayableTypeEnum::ISNAP_FEE) {
            return;
        }

        if ($payable->status != PayableStatusEnum::PAID) {
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
                return;
            }

            // Get the application for this account
            $isnapApplication = $customerAccount->application;

            if (!$isnapApplication) {
                return;
            }

            if (!$isnapApplication->is_isnap) {
                return;
            }

            // Check if inspection already exists
            if ($isnapApplication->inspections && $isnapApplication->inspections->count() > 0) {
                return;
            }

            // Create inspection record
            CustApplnInspection::create([
                'customer_application_id' => $isnapApplication->id,
                'status' => InspectionStatusEnum::FOR_INSPECTION
            ]);

            $isnapApplication->update(['status' => ApplicationStatusEnum::FOR_INSPECTION]);

        } catch (\Exception $e) {
            Log::error('PayableObserver: Failed to create inspection after ISNAP payment', [
                'payable_id' => $payable->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
