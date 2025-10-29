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

    public function test_disapproving_inspection_creates_reinspection_record()
    {
        // Arrange: Create initial inspection
        $application = CustomerApplication::factory()->create();
        $inspector = User::factory()->create();
        
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'inspector_id' => $inspector->id,
            'schedule_date' => now()->addDays(1),
            'status' => InspectionStatusEnum::FOR_INSPECTION,
        ]);

        $originalId = $inspection->id;

        // Act: Update status to disapproved
        $inspection->update([
            'status' => InspectionStatusEnum::DISAPPROVED,
        ]);

        // Assert: Check that a new reinspection record was created
        $this->assertDatabaseCount('cust_appln_inspections', 2);
        
        // Get the new reinspection record
        $reinspection = CustApplnInspection::where('id', '!=', $originalId)
            ->where('customer_application_id', $application->id)
            ->first();

        $this->assertNotNull($reinspection);
        $this->assertEquals(InspectionStatusEnum::FOR_REINSPECTION, $reinspection->status);
        $this->assertNull($reinspection->inspector_id);
        $this->assertNull($reinspection->schedule_date);
        $this->assertEquals($application->id, $reinspection->customer_application_id);
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
            'status' => InspectionStatusEnum::FOR_INSPECTION,
        ]);

        // Act: Update to approved (not disapproved)
        $inspection->update([
            'status' => InspectionStatusEnum::APPROVED,
        ]);

        // Assert: No additional record created
        $this->assertDatabaseCount('cust_appln_inspections', 1);
    }

    public function test_creating_inspection_with_disapproved_status_does_not_trigger_reinspection()
    {
        // Arrange & Act: Create inspection directly with disapproved status
        $application = CustomerApplication::factory()->create();
        
        CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::DISAPPROVED,
        ]);

        // Assert: Only one record exists (the boot hook only triggers on update)
        $this->assertDatabaseCount('cust_appln_inspections', 1);
    }

    public function test_reinspection_record_maintains_original_data()
    {
        // Arrange: Create inspection with various fields
        $application = CustomerApplication::factory()->create();
        $inspector = User::factory()->create();
        
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'inspector_id' => $inspector->id,
            'schedule_date' => now()->addDays(1),
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            // Add any other fields that should be maintained
        ]);

        $originalId = $inspection->id;

        // Act: Disapprove the inspection
        $inspection->update([
            'status' => InspectionStatusEnum::DISAPPROVED,
        ]);

        // Assert: Reinspection maintains customer application relationship
        $reinspection = CustApplnInspection::where('id', '!=', $originalId)->first();
        
        $this->assertEquals($application->id, $reinspection->customer_application_id);
        $this->assertNotEquals($originalId, $reinspection->id);
    }

    public function test_multiple_disapprovals_create_multiple_reinspections()
    {
        // Arrange
        $application = CustomerApplication::factory()->create();
        $inspector = User::factory()->create();
        
        $inspection1 = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'inspector_id' => $inspector->id,
            'schedule_date' => now()->addDays(1),
            'status' => InspectionStatusEnum::FOR_INSPECTION,
        ]);

        // Act: First disapproval
        $inspection1->update(['status' => InspectionStatusEnum::DISAPPROVED]);
        
        $this->assertDatabaseCount('cust_appln_inspections', 2);

        // Get the reinspection and assign inspector
        $reinspection = CustApplnInspection::where('status', InspectionStatusEnum::FOR_REINSPECTION)->first();
        $reinspection->update([
            'inspector_id' => $inspector->id,
            'schedule_date' => now()->addDays(2),
            'status' => InspectionStatusEnum::FOR_INSPECTION,
        ]);

        // Act: Second disapproval
        $reinspection->update(['status' => InspectionStatusEnum::DISAPPROVED()]);

        // Assert: Now we should have 3 records total
        $this->assertDatabaseCount('cust_appln_inspections', 3);
        
        // Verify the latest reinspection (should be the newly created one with for_reinspection status)
        $latestReinspection = CustApplnInspection::where('status', InspectionStatusEnum::FOR_REINSPECTION())
            ->orderBy('created_at', 'desc')
            ->first();
        
        $this->assertNotNull($latestReinspection);
        $this->assertEquals(InspectionStatusEnum::FOR_REINSPECTION(), $latestReinspection->status);
        $this->assertNull($latestReinspection->inspector_id);
        $this->assertNull($latestReinspection->schedule_date);
    }
}
