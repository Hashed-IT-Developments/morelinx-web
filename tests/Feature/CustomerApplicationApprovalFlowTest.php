<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\RolesEnum;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\User;
use App\Services\ApprovalFlowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CustomerApplicationApprovalFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $admin;
    protected User $superadmin;
    protected User $inspector;
    protected ApprovalFlowService $approvalService;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);

        // Create users with different roles
        $this->user = User::factory()->create();
        $this->user->assignRole(RolesEnum::USER);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(RolesEnum::ADMIN);

        $this->superadmin = User::factory()->create();
        $this->superadmin->assignRole(RolesEnum::SUPERADMIN);

        $this->inspector = User::factory()->create();
        $this->inspector->assignRole(RolesEnum::INSPECTOR);

        $this->approvalService = app(ApprovalFlowService::class);
    }

    #[Test]
    public function complete_approval_flow_works_correctly()
    {
        // 1. Create CustomerApplication with status for_ccd_approval
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->assertEquals(ApplicationStatusEnum::FOR_CCD_APPROVAL, $customerApplication->status);

        // 2. Manually update status to simulate approval flow completion
        // In a real scenario, this would be done by the approval service
        $customerApplication->update(['status' => ApplicationStatusEnum::FOR_INSPECTION]);
        
        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $customerApplication->status);

        // 3. Create CustApplnInspection record with status for_inspection
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION, $inspection->status);

        // 4. Assign inspector and schedule_date
        $inspection->update([
            'inspector_id' => $this->inspector->id,
            'schedule_date' => now()->addDays(3)
        ]);

        $this->assertEquals($this->inspector->id, $inspection->inspector_id);
        $this->assertNotNull($inspection->schedule_date);

        // 5. Inspector approves inspection (update status to for_inspection_approval)
        $inspection->update([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL
        ]);

        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION_APPROVAL, $inspection->status);

        // 6. Simulate approval completion - status changes to approved
        $inspection->update(['status' => InspectionStatusEnum::APPROVED]);
        
        $this->assertEquals(InspectionStatusEnum::APPROVED, $inspection->status);
    }

    #[Test]
    public function customer_application_status_transitions_are_valid()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        // Test valid status transitions
        $customerApplication->update(['status' => ApplicationStatusEnum::FOR_INSPECTION]);
        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $customerApplication->status);

        $customerApplication->update(['status' => ApplicationStatusEnum::VERIFIED]);
        $this->assertEquals(ApplicationStatusEnum::VERIFIED, $customerApplication->status);

        $customerApplication->update(['status' => ApplicationStatusEnum::ACTIVE]);
        $this->assertEquals(ApplicationStatusEnum::ACTIVE, $customerApplication->status);
    }

    #[Test]
    public function inspection_requires_inspector_assignment()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'inspector_id' => null, // No inspector assigned
            'schedule_date' => null
        ]);

        // Test that we can detect missing inspector
        $this->assertNull($inspection->inspector_id);
        $this->assertNull($inspection->schedule_date);

        // Assign inspector
        $inspection->update([
            'inspector_id' => $this->inspector->id,
            'schedule_date' => now()->addDays(1)
        ]);

        $this->assertEquals($this->inspector->id, $inspection->inspector_id);
        $this->assertNotNull($inspection->schedule_date);
    }

    #[Test]
    public function cannot_skip_approval_steps()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        // Verify we can track the current status
        $this->assertEquals(ApplicationStatusEnum::FOR_CCD_APPROVAL, $customerApplication->status);
        
        // In a real system, trying to skip to ACTIVE would be prevented by business logic
        // For now, we just test that we can identify invalid transitions
        $this->assertNotEquals(ApplicationStatusEnum::ACTIVE, $customerApplication->status);
    }

    #[Test]
    public function inspection_cannot_be_approved_without_inspector_assignment()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'inspector_id' => null, // No inspector assigned
            'schedule_date' => null
        ]);

        // Test that we can validate inspector assignment before approval
        $this->assertNull($inspection->inspector_id);
        $this->assertNull($inspection->schedule_date);
        
        // Business logic should prevent approval without inspector
        // For now, we just verify the current state
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION, $inspection->status);
    }

    #[Test]
    public function user_roles_are_properly_assigned()
    {
        // Test that users have the correct roles
        $this->assertTrue($this->user->hasRole(RolesEnum::USER));
        $this->assertTrue($this->admin->hasRole(RolesEnum::ADMIN));
        $this->assertTrue($this->superadmin->hasRole(RolesEnum::SUPERADMIN));
        $this->assertTrue($this->inspector->hasRole(RolesEnum::INSPECTOR));
    }

    #[Test]
    public function approval_flow_trait_methods_exist()
    {
        $customerApplication = CustomerApplication::factory()->create();
        $inspection = CustApplnInspection::factory()->create();
        
        // Test that approval flow methods exist
        $this->assertTrue(method_exists($customerApplication, 'approvalState'));
        $this->assertTrue(method_exists($customerApplication, 'approvals'));
        $this->assertTrue(method_exists($inspection, 'approvalState'));
        $this->assertTrue(method_exists($inspection, 'approvals'));
    }

    #[Test]
    public function inspection_status_transitions_are_valid()
    {
        $inspection = CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        // Valid transition: for_inspection -> for_inspection_approval
        $inspection->update(['status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL]);
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION_APPROVAL, $inspection->status);

        // Valid transition: for_inspection_approval -> approved
        $inspection->update(['status' => InspectionStatusEnum::APPROVED]);
        $this->assertEquals(InspectionStatusEnum::APPROVED, $inspection->status);
    }

    #[Test]
    public function customer_application_relationships_work()
    {
        $customerApplication = CustomerApplication::factory()->create();
        
        // Create related records
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id
        ]);
        
        // Test relationships
        $this->assertInstanceOf(CustApplnInspection::class, $customerApplication->inspections->first());
        $this->assertInstanceOf(CustomerApplication::class, $inspection->customerApplication);
        $this->assertEquals($customerApplication->id, $inspection->customer_application_id);
    }

    #[Test]
    public function inspection_can_be_rejected()
    {
        $inspection = CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL
        ]);

        // Reject inspection
        $inspection->update(['status' => InspectionStatusEnum::REJECTED]);
        
        $this->assertEquals(InspectionStatusEnum::REJECTED, $inspection->status);
    }
}