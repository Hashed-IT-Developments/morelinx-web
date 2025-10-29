<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatusEnum;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustApplnInspectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get unique customer applications with 'for_inspection' status
        $customerApplications = CustomerApplication::where('status', ApplicationStatusEnum::FOR_INSPECTION)
            ->inRandomOrder()
            ->limit(20)
            ->get();
        
        // If not enough applications exist, create them
        $neededCount = 20 - $customerApplications->count();
        if ($neededCount > 0) {
            $newApplications = CustomerApplication::factory($neededCount)
                ->create(['status' => ApplicationStatusEnum::FOR_INSPECTION]);
            $customerApplications = $customerApplications->merge($newApplications);
        }
        
        // Create 10 inspections in "for_inspection" state (no inspector assigned)
        // Each with a different customer application
        foreach ($customerApplications->take(10) as $application) {
            CustApplnInspection::factory()
                ->forInspection()
                ->create(['customer_application_id' => $application->id]);
        }
        
        // Create 10 inspections in "for_inspection_approval" state (inspector assigned)
        // Each with a different customer application
        foreach ($customerApplications->skip(10)->take(10) as $application) {
            CustApplnInspection::factory()
                ->forInspectionApproval()
                ->create(['customer_application_id' => $application->id]);
        }
    }
}
