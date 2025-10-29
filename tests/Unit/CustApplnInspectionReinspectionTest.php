<?php

namespace Tests\Unit;

use App\Enums\InspectionStatusEnum;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustApplnInspectionReinspectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_disapproving_inspection_does_not_auto_create_reinspection()
    {
        // Arrange: Create initial inspection
        $application = CustomerApplication::factory()->create();
        $inspector = User::factory()->create();
        
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'inspector_id' => $inspector->id,
            'schedule_date' => now()->addDays(1),
            'status' => InspectionStatusEnum::FOR_INSPECTION(),
        ]);

        // Act: Update status to disapproved
        $inspection->update([
            'status' => InspectionStatusEnum::DISAPPROVED(),
        ]);

        // Assert: No new record is created automatically
        $this->assertDatabaseCount('cust_appln_inspections', 1);
        
        // Verify the status was updated
        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::DISAPPROVED(), $inspection->status);
    }

    public function test_updating_to_other_statuses_does_not_create_reinspection()
    {
        // Arrange
        $application = CustomerApplication::factory()->create();
        $inspector = User::factory()->create();
        
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'inspector_id' => $inspector->id,
            'schedule_date' => now()->addDays(1),
            'status' => InspectionStatusEnum::FOR_INSPECTION(),
        ]);

        // Act: Update to approved (not disapproved)
        $inspection->update([
            'status' => InspectionStatusEnum::APPROVED(),
        ]);

        // Assert: No additional record created
        $this->assertDatabaseCount('cust_appln_inspections', 1);
    }

    public function test_creating_inspection_with_disapproved_status_works_normally()
    {
        // Arrange & Act: Create inspection directly with disapproved status
        $application = CustomerApplication::factory()->create();
        
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::DISAPPROVED(),
        ]);

        // Assert: Only one record exists
        $this->assertDatabaseCount('cust_appln_inspections', 1);
        $this->assertEquals(InspectionStatusEnum::DISAPPROVED(), $inspection->status);
    }
}
