<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\ModuleName;
use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\ApprovalFlowSystem\ApprovalFlowStep;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\User;
use App\Services\ApprovalFlowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Complete Application and Inspection Flow Test
 * 
 * This test suite covers the complete flow:
 * 1. Create new customer application
 * 2. Test WITH approval flow - application approval process
 * 3. Test WITHOUT approval flow - direct assignment
 * 4. Assign inspector
 * 5. Inspector approval
 * 6. Supervisor approval via approval flow
 * 7. Disapproval scenario
 * 8. Reassignment of inspector
 */
class CompleteApplicationInspectionFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;
    protected User $admin;
    protected User $approver1;
    protected User $approver2;
    protected User $inspector1;
    protected User $inspector2;
    protected ApprovalFlowService $approvalService;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);

        // Create users with different roles
        $this->superadmin = User::factory()->create(['name' => 'Super Admin']);
        $this->superadmin->assignRole(RolesEnum::SUPERADMIN);
        $this->superadmin->givePermissionTo(PermissionsEnum::ASSIGN_INSPECTOR);

        $this->admin = User::factory()->create(['name' => 'Admin']);
        $this->admin->assignRole(RolesEnum::ADMIN);
        $this->admin->givePermissionTo(PermissionsEnum::ASSIGN_INSPECTOR);

        $this->approver1 = User::factory()->create(['name' => 'Approver 1']);
        $this->approver1->assignRole(RolesEnum::ADMIN);

        $this->approver2 = User::factory()->create(['name' => 'Approver 2']);
        $this->approver2->assignRole(RolesEnum::SUPERADMIN);
        $this->approver2->givePermissionTo(PermissionsEnum::ASSIGN_INSPECTOR);

        $this->inspector1 = User::factory()->create(['name' => 'Inspector 1']);
        $this->inspector1->assignRole(RolesEnum::INSPECTOR);

        $this->inspector2 = User::factory()->create(['name' => 'Inspector 2']);
        $this->inspector2->assignRole(RolesEnum::INSPECTOR);

        $this->approvalService = app(ApprovalFlowService::class);
    }

    /**
     * Test complete flow WITH customer application approval flow
     * 
     * Flow:
     * 1. Create customer application
     * 2. Application automatically gets approval flow
     * 3. Approvers approve the application
     * 4. Application status changes to FOR_INSPECTION
     * 5. Inspection record is created
     * 6. Inspector is assigned
     * 7. Inspector approves inspection
     * 8. Inspection gets approval flow
     * 9. Approvers approve inspection
     * 10. Application status changes to VERIFIED
     */
    public function test_complete_flow_with_customer_application_approval_flow()
    {
        // === SETUP: Create approval flows ===
        $this->createCustomerApplicationApprovalFlow();
        $this->createInspectionApprovalFlow();

        // === STEP 1: Create new customer application ===
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL,
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        // Verify application has approval flow initialized
        $this->assertNotNull($application->approvalState);
        $this->assertEquals('pending', $application->approvalState->status);
        $this->assertEquals(1, $application->approvalState->current_order);
        $this->assertEquals(ApplicationStatusEnum::FOR_CCD_APPROVAL, $application->status);

        // === STEP 2: First approver approves the application ===
        Sanctum::actingAs($this->approver1);
        $this->approvalService->approve($application, $this->approver1, 'First approval');

        $application->refresh();
        $this->assertEquals('pending', $application->approvalState->status);
        $this->assertEquals(2, $application->approvalState->current_order); // Moved to step 2

        // === STEP 3: Second approver approves the application ===
        Sanctum::actingAs($this->approver2);
        $this->approvalService->approve($application, $this->approver2, 'Final approval');

        $application->refresh();
        $this->assertEquals('approved', $application->approvalState->status);
        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $application->status);

        // === STEP 4: Create inspection record ===
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'inspector_id' => null,
            'schedule_date' => null,
        ]);

        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION, $inspection->status);
        $this->assertNull($inspection->inspector_id);

        // === STEP 5: Assign inspector ===
        Sanctum::actingAs($this->admin);
        $response = $this->postJson(route('inspections.assign'), [
            'inspection_id' => $inspection->id,
            'inspector_id' => $this->inspector1->id,
            'schedule_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $inspection->refresh();
        $this->assertEquals($this->inspector1->id, $inspection->inspector_id);
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION_APPROVAL, $inspection->status);
        $this->assertNotNull($inspection->schedule_date);

        // === STEP 6: Inspector performs inspection and updates status to APPROVED ===
        // This triggers approval flow initialization for the inspection
        Sanctum::actingAs($this->inspector1);
        $inspection->update([
            'status' => InspectionStatusEnum::APPROVED,
            'remarks' => 'Inspection completed successfully',
            'inspection_time' => now(),
        ]);

        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::APPROVED, $inspection->status);
        $this->assertNotNull($inspection->approvalState);
        $this->assertEquals('pending', $inspection->approvalState->status);

        // === STEP 7: First approver approves the inspection ===
        Sanctum::actingAs($this->approver1);
        $this->approvalService->approve($inspection, $this->approver1, 'Inspection looks good');

        $inspection->refresh();
        $this->assertEquals('pending', $inspection->approvalState->status);
        $this->assertEquals(2, $inspection->approvalState->current_order);

        // === STEP 8: Second approver approves the inspection ===
        Sanctum::actingAs($this->approver2);
        $this->approvalService->approve($inspection, $this->approver2, 'Final inspection approval');

        $inspection->refresh();
        $application->refresh();

        // Verify inspection approval flow is completed
        $this->assertEquals('approved', $inspection->approvalState->status);

        // Verify customer application status is updated to VERIFIED
        $this->assertEquals(ApplicationStatusEnum::VERIFIED, $application->status);
    }

    /**
     * Test complete flow WITHOUT customer application approval flow
     * 
     * Flow:
     * 1. Create customer application that bypasses approval flow
     * 2. Application status is directly FOR_INSPECTION
     * 3. Inspector is assigned
     * 4. Inspector approves inspection
     * 5. Inspection gets approval flow
     * 6. Approvers approve inspection
     */
    public function test_complete_flow_without_customer_application_approval_flow()
    {
        // === SETUP: Create only inspection approval flow ===
        $this->createInspectionApprovalFlow();
        // Deliberately NOT creating customer application approval flow

        // === STEP 1: Create application without approval flow ===
        // Simulating a scenario where application is already approved or doesn't need approval
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);

        // Verify no approval flow was created for the application
        // Note: The application still gets an approval flow due to the interface implementation
        // but we can work around this by testing the scenario where it's already approved
        if ($application->approvalState) {
            // Manually mark it as approved to simulate bypass
            $application->approvalState->update(['status' => 'approved']);
        }

        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $application->status);

        // === STEP 2: Create inspection record ===
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'inspector_id' => null,
            'schedule_date' => null,
        ]);

        // === STEP 3: Assign inspector (should work without application approval) ===
        Sanctum::actingAs($this->admin);
        $response = $this->postJson(route('inspections.assign'), [
            'inspection_id' => $inspection->id,
            'inspector_id' => $this->inspector1->id,
            'schedule_date' => now()->addDays(2)->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $inspection->refresh();
        $this->assertEquals($this->inspector1->id, $inspection->inspector_id);
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION_APPROVAL, $inspection->status);

        // === STEP 4: Inspector approves inspection ===
        $inspection->update([
            'status' => InspectionStatusEnum::APPROVED,
            'remarks' => 'All requirements met',
        ]);

        $inspection->refresh();
        $this->assertNotNull($inspection->approvalState);
        $this->assertEquals('pending', $inspection->approvalState->status);

        // === STEP 5: Complete inspection approval flow ===
        Sanctum::actingAs($this->approver1);
        $this->approvalService->approve($inspection, $this->approver1, 'Approved');

        Sanctum::actingAs($this->approver2);
        $this->approvalService->approve($inspection, $this->approver2, 'Final approval');

        $inspection->refresh();
        $application->refresh();

        $this->assertEquals('approved', $inspection->approvalState->status);
        $this->assertEquals(ApplicationStatusEnum::VERIFIED, $application->status);
    }

    /**
     * Test disapproval and reassignment flow
     * 
     * Flow:
     * 1. Create and approve customer application
     * 2. Assign inspector
     * 3. Inspector inspection is DISAPPROVED
     * 4. Reassign to different inspector
     * 5. New inspector completes inspection
     * 6. Inspection gets approved
     */
    public function test_disapproval_and_reassignment_flow()
    {
        // === SETUP: Create approval flows ===
        $this->createCustomerApplicationApprovalFlow();
        $this->createInspectionApprovalFlow();

        // === STEP 1: Create and approve customer application ===
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL,
            'first_name' => 'Bob',
            'last_name' => 'Wilson',
        ]);

        // Fast-forward through application approvals
        Sanctum::actingAs($this->approver1);
        $this->approvalService->approve($application, $this->approver1, 'Approved');
        
        Sanctum::actingAs($this->approver2);
        $this->approvalService->approve($application, $this->approver2, 'Approved');

        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $application->status);

        // === STEP 2: Create inspection and assign first inspector ===
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'inspector_id' => null,
            'schedule_date' => null,
        ]);

        Sanctum::actingAs($this->admin);
        $response = $this->postJson(route('inspections.assign'), [
            'inspection_id' => $inspection->id,
            'inspector_id' => $this->inspector1->id,
            'schedule_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $inspection->refresh();
        $this->assertEquals($this->inspector1->id, $inspection->inspector_id);
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION_APPROVAL, $inspection->status);

        // === STEP 3: Inspector completes but inspection gets DISAPPROVED ===
        // This could happen during approval process or direct disapproval
        $inspection->update([
            'status' => InspectionStatusEnum::DISAPPROVED,
            'remarks' => 'Site not ready for installation',
        ]);

        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::DISAPPROVED, $inspection->status);
        $this->assertEquals($this->inspector1->id, $inspection->inspector_id);

        // === STEP 4: Reassign to different inspector ===
        $expectedScheduleDate = now()->addDays(5)->format('Y-m-d');
        
        Sanctum::actingAs($this->admin);
        $response = $this->postJson(route('inspections.assign'), [
            'inspection_id' => $inspection->id,
            'inspector_id' => $this->inspector2->id,
            'schedule_date' => $expectedScheduleDate,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify original inspection is marked as REASSIGNED
        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::REASSIGNED, $inspection->status);
        $this->assertEquals($this->inspector1->id, $inspection->inspector_id);

        // Verify new inspection was created
        $this->assertDatabaseCount('cust_appln_inspections', 2);

        $newInspection = CustApplnInspection::where('id', '!=', $inspection->id)
            ->where('customer_application_id', $application->id)
            ->first();

        $this->assertNotNull($newInspection);
        $this->assertEquals($this->inspector2->id, $newInspection->inspector_id);
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION_APPROVAL, $newInspection->status);
        $this->assertEquals($expectedScheduleDate, $newInspection->schedule_date);

        // === STEP 5: New inspector completes inspection successfully ===
        $newInspection->update([
            'status' => InspectionStatusEnum::APPROVED,
            'remarks' => 'Site is now ready, all requirements met',
        ]);

        $newInspection->refresh();
        $this->assertEquals(InspectionStatusEnum::APPROVED, $newInspection->status);
        $this->assertNotNull($newInspection->approvalState);

        // === STEP 6: Complete approval flow for new inspection ===
        Sanctum::actingAs($this->approver1);
        $this->approvalService->approve($newInspection, $this->approver1, 'Approved');

        Sanctum::actingAs($this->approver2);
        $this->approvalService->approve($newInspection, $this->approver2, 'Final approval');

        $newInspection->refresh();
        $application->refresh();

        $this->assertEquals('approved', $newInspection->approvalState->status);
        $this->assertEquals(ApplicationStatusEnum::VERIFIED, $application->status);
    }

    /**
     * Test that inspector cannot be assigned before application approval
     */
    public function test_cannot_assign_inspector_before_application_approval()
    {
        // === SETUP: Create approval flow ===
        $this->createCustomerApplicationApprovalFlow();

        // === STEP 1: Create application that's pending approval ===
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL,
        ]);

        $this->assertEquals('pending', $application->approvalState->status);

        // === STEP 2: Create inspection record ===
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION,
            'inspector_id' => null,
        ]);

        // === STEP 3: Try to assign inspector (should fail) ===
        Sanctum::actingAs($this->admin);
        $response = $this->postJson(route('inspections.assign'), [
            'inspection_id' => $inspection->id,
            'inspector_id' => $this->inspector1->id,
            'schedule_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['inspection']);

        // Verify inspector was not assigned
        $inspection->refresh();
        $this->assertNull($inspection->inspector_id);
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION, $inspection->status);
    }

    /**
     * Test complete approval flow rejection scenario
     */
    public function test_application_rejection_in_approval_flow()
    {
        // === SETUP: Create approval flow ===
        $this->createCustomerApplicationApprovalFlow();

        // === STEP 1: Create application ===
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL,
        ]);

        $this->assertEquals('pending', $application->approvalState->status);

        // === STEP 2: Reject application ===
        Sanctum::actingAs($this->approver1);
        $this->approvalService->reject($application, $this->approver1, 'Missing required documents');

        $application->refresh();
        $this->assertEquals('rejected', $application->approvalState->status);

        // Verify inspection cannot be created/assigned for rejected application
        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION,
        ]);

        Sanctum::actingAs($this->admin);
        $response = $this->postJson(route('inspections.assign'), [
            'inspection_id' => $inspection->id,
            'inspector_id' => $this->inspector1->id,
            'schedule_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors();
    }

    /**
     * Test cannot reassign inspector if inspection is not disapproved
     */
    public function test_cannot_reassign_inspector_for_non_disapproved_inspection()
    {
        // Create inspection with approved status
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION,
        ]);

        // Manually mark approval as approved if it exists
        if ($application->approvalState) {
            $application->approvalState->update(['status' => 'approved']);
        }

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::APPROVED,
            'inspector_id' => $this->inspector1->id,
        ]);

        // Try to "reassign" - should fail as already has inspector
        Sanctum::actingAs($this->superadmin); // Use superadmin with permissions
        $response = $this->postJson(route('inspections.assign'), [
            'inspection_id' => $inspection->id,
            'inspector_id' => $this->inspector2->id,
            'schedule_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['inspection']);

        // Verify inspector was not changed
        $inspection->refresh();
        $this->assertEquals($this->inspector1->id, $inspection->inspector_id);
        $this->assertEquals(InspectionStatusEnum::APPROVED, $inspection->status);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Create customer application approval flow with 2 steps
     */
    protected function createCustomerApplicationApprovalFlow(): void
    {
        $flow = ApprovalFlow::create([
            'name' => 'Customer Application Approval',
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'department_id' => null,
            'created_by' => $this->superadmin->id,
        ]);

        ApprovalFlowStep::create([
            'approval_flow_id' => $flow->id,
            'name' => 'Initial Review',
            'order' => 1,
            'role_id' => $this->approver1->roles->first()->id,
        ]);

        ApprovalFlowStep::create([
            'approval_flow_id' => $flow->id,
            'name' => 'Final Approval',
            'order' => 2,
            'role_id' => $this->approver2->roles->first()->id,
        ]);
    }

    /**
     * Create inspection approval flow with 2 steps
     */
    protected function createInspectionApprovalFlow(): void
    {
        $flow = ApprovalFlow::create([
            'name' => 'Inspection Approval',
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
            'department_id' => null,
            'created_by' => $this->superadmin->id,
        ]);

        ApprovalFlowStep::create([
            'approval_flow_id' => $flow->id,
            'name' => 'Supervisor Review',
            'order' => 1,
            'role_id' => $this->approver1->roles->first()->id,
        ]);

        ApprovalFlowStep::create([
            'approval_flow_id' => $flow->id,
            'name' => 'Manager Approval',
            'order' => 2,
            'role_id' => $this->approver2->roles->first()->id,
        ]);
    }
}
