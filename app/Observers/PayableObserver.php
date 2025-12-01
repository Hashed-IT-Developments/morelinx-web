<?php

namespace App\Observers;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\PayableCategoryEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Events\MakeLog;
use App\Models\CustApplnInspection;
use App\Models\Payable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayableObserver
{
    /**
     * Handle the Payable "updated" event.
     * 
     * Handles two scenarios:
     * 1. When an ISNAP fee payable is fully paid, create a CustApplnInspection
     * 2. When an energization payable is paid, check if all 3 are paid and update application to FOR_SIGNING
     */
    public function updated(Payable $payable): void
    {
        // Only proceed if status changed to PAID
        if (!$payable->isDirty('status') || $payable->status !== PayableStatusEnum::PAID) {
            return;
        }

        // Handle ISNAP fee payment
        if ($payable->type === PayableTypeEnum::ISNAP_FEE) {
            $this->handleIsnapPayment($payable);
            return;
        }

        // Handle energization payable payment
        if ($payable->payable_category === PayableCategoryEnum::ENERGIZATION) {
            $this->handleEnergizationPayment($payable);
        }
    }

    /**
     * Handle ISNAP fee payment - creates inspection when paid
     */
    protected function handleIsnapPayment(Payable $payable): void
    {
        try {
            // Load customer account with its application and inspections in one query
            $payable->load(['customerAccount.application.inspections']);

            $application = $payable->customerAccount?->application;

            // Early returns: check if application exists, is ISNAP, and has no inspections
            if (!$application || !$application->is_isnap || $application->inspections->isNotEmpty()) {
                return;
            }

            // Create inspection record
            DB::transaction(function () use ($application) {
                CustApplnInspection::create([
                    'customer_application_id' => $application->id,
                    'status' => InspectionStatusEnum::FOR_INSPECTION
                ]);

                $application->update(['status' => ApplicationStatusEnum::FOR_INSPECTION]);
            });

        } catch (\Exception $e) {
            Log::error('PayableObserver: Failed to create inspection after ISNAP payment', [
                'payable_id' => $payable->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle energization payable payment
     * When all 3 energization payables are paid, update application status to FOR_SIGNING
     */
    protected function handleEnergizationPayment(Payable $payable): void
    {

        try {
            // Load customer account with application
            $payable->load('customerAccount.application');

            $customerAccount = $payable->customerAccount;
            $application = $customerAccount?->application;

            // Only update if application exists and is currently in FOR_COLLECTION status
            if (!$customerAccount || !$application || $application->status !== ApplicationStatusEnum::FOR_COLLECTION) {
                return;
            }

            // Check if all 3 energization payables are now paid
            if (!$customerAccount->areEnergizationPayablesPaid()) {
                Log::info('PayableObserver: Not all energization payables are paid', [
                    'payable_id' => $payable->id,
                    'application_id' => $application->id,
                ]);
                return;
            }

            // Update application status to FOR_SIGNING
            DB::transaction(function () use ($application) {
                $application->update(['status' => ApplicationStatusEnum::FOR_SIGNING]);
                
                // Log payment verification completion
                event(new MakeLog(
                    'application',
                    $application->id,
                    'Payment Verified',
                    'All energization payables have been paid. Application is ready for contract signing.',
                    Auth::id(),
                ));

                $application->ageingTimeline()->updateOrCreate(
                    ['customer_application_id' => $application->id], 
                    ['paid_to_cashier' => now()]
                );
            });

            Log::info('PayableObserver: All energization payables paid, application updated to FOR_SIGNING', [
                'payable_id' => $payable->id,
                'application_id' => $application->id,
            ]);

        } catch (\Exception $e) {
            Log::error('PayableObserver: Failed to update application after energization payment', [
                'payable_id' => $payable->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
