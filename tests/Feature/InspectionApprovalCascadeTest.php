<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\ModuleName;
use App\Enums\RolesEnum;
use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\ApprovalFlowSystem\ApprovalFlowStep;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\User;
use App\Services\ApprovalFlowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InspectionApprovalCascadeTest extends TestCase
{
    use RefreshDatabase;

    protected User $supervisor;
    protected User $manager;
    protected ApprovalFlowService $approvalService;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);

        // Create users with supervisor roles
        $this->supervisor = User::factory()->create();
        $this->supervisor->assignRole(RolesEnum::CCD_SUPERVISOR);

        $this->manager = User::factory()->create();
        $this->manager->assignRole(RolesEnum::ADMIN);

        $this->approvalService = app(ApprovalFlowService::class);

        // Create approval flow for inspection approval
        $this->createInspectionApprovalFlow();
    }

    protected function createInspectionApprovalFlow(): void
    {
        $supervisorRole = Role::where('name', RolesEnum::CCD_SUPERVISOR)->first();
        $adminRole = Role::where('name', RolesEnum::ADMIN)->first();

        $approvalFlow = ApprovalFlow::create([
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
            'name' => 'Inspection Approval Flow',
            'description' => 'Approval flow for inspection supervisor approval',
            'department_id' => null,
            'created_by' => $this->supervisor->id,
        ]);

        // Step 1: CCD Supervisor approval
        ApprovalFlowStep::create([
            'approval_flow_id' => $approvalFlow->id,
            'order' => 1,
            'role_id' => $supervisorRole->id,
            'user_id' => null,
        ]);

        // Step 2: Admin/Manager approval
        ApprovalFlowStep::create([
            'approval_flow_id' => $approvalFlow->id,
            'order' => 2,
            'role_id' => $adminRole->id,
            'user_id' => null,
        ]);
    }

    #[Test]
    public function inspection_approval_flow_initializes_when_status_becomes_approved()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        // Update inspection status to APPROVED (inspector approved)
        $inspection->update(['status' => InspectionStatusEnum::APPROVED]);

        // Refresh to get the approval state
        $inspection->refresh();
        $inspection->load('approvalState');

        // Verify approval flow was initialized
        $this->assertNotNull($inspection->approvalState);
        $this->assertEquals('pending', $inspection->approvalState->status);
        $this->assertEquals(1, $inspection->approvalState->current_order);
    }

    #[Test]
    public function completed_inspection_approval_updates_customer_application_to_verified()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        // Update inspection status to APPROVED to initialize approval flow
        $inspection->update(['status' => InspectionStatusEnum::APPROVED]);
        $inspection->refresh();
        $inspection->load('approvalState');

        // Verify approval flow was initialized
        $this->assertNotNull($inspection->approvalState);

        // Step 1: Supervisor approves
        $result = $this->approvalService->approve($inspection, $this->supervisor, 'Supervisor approval');
        $this->assertTrue($result);

        $inspection->refresh();
        $this->assertEquals(2, $inspection->approvalState->current_order);
        $this->assertEquals('pending', $inspection->approvalState->status);

        // Step 2: Manager approves (final step)
        $result = $this->approvalService->approve($inspection, $this->manager, 'Manager final approval');
        $this->assertTrue($result);

        // Refresh both models
        $inspection->refresh();
        $customerApplication->refresh();

        // Verify approval flow is completed
        $this->assertEquals('approved', $inspection->approvalState->status);
        
        // Verify inspection status remains APPROVED
        $this->assertEquals(InspectionStatusEnum::APPROVED, $inspection->status);

        // Verify customer application status was updated to VERIFIED
        $this->assertEquals(ApplicationStatusEnum::FOR_VERIFICATION, $customerApplication->status);
    }

    #[Test]
    public function inspection_approval_rejection_does_not_update_customer_application()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        // Update inspection status to APPROVED to initialize approval flow
        $inspection->update(['status' => InspectionStatusEnum::APPROVED]);
        $inspection->refresh();
        $inspection->load('approvalState');

        // Supervisor rejects the approval
        $result = $this->approvalService->reject($inspection, $this->supervisor, 'Issues found in inspection');
        $this->assertTrue($result);

        // Refresh both models
        $inspection->refresh();
        $customerApplication->refresh();

        // Verify approval flow is rejected
        $this->assertEquals('rejected', $inspection->approvalState->status);
        
        // Verify inspection status remains APPROVED
        $this->assertEquals(InspectionStatusEnum::APPROVED, $inspection->status);

        // Verify customer application status was NOT updated (stays FOR_INSPECTION)
        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $customerApplication->status);
    }

    #[Test]
    public function multiple_inspections_only_last_approved_updates_customer_application()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        // Create first inspection and complete its approval
        $inspection1 = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        $inspection1->update(['status' => InspectionStatusEnum::APPROVED]);
        $inspection1->refresh();
        $inspection1->load('approvalState');

        // Complete approval for first inspection
        $this->approvalService->approve($inspection1, $this->supervisor);
        $this->approvalService->approve($inspection1, $this->manager);

        $customerApplication->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_VERIFICATION, $customerApplication->status);

        // Create second inspection
        $inspection2 = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        // Update customer application back to FOR_INSPECTION for testing
        $customerApplication->update(['status' => ApplicationStatusEnum::FOR_INSPECTION]);

        $inspection2->update(['status' => InspectionStatusEnum::APPROVED]);
        $inspection2->refresh();
        $inspection2->load('approvalState');

        // Complete approval for second inspection
        $this->approvalService->approve($inspection2, $this->supervisor);
        $this->approvalService->approve($inspection2, $this->manager);

        $customerApplication->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_VERIFICATION, $customerApplication->status);
    }

    #[Test]
    public function approval_flow_progress_tracking_works()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        // Update inspection status to APPROVED
        $inspection->update(['status' => InspectionStatusEnum::APPROVED]);
        $inspection->refresh();

        // Check initial progress
        $this->assertEquals(0, $this->approvalService->getApprovalProgress($inspection));
        
        // First approval
        $this->approvalService->approve($inspection, $this->supervisor);
        $inspection->refresh();
        $this->assertEquals(50, $this->approvalService->getApprovalProgress($inspection));
        
        // Final approval
        $this->approvalService->approve($inspection, $this->manager);
        $inspection->refresh();
        $this->assertEquals(100, $this->approvalService->getApprovalProgress($inspection));
    }

    #[Test]
    public function inspection_approval_history_is_tracked()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);

        // Update inspection status to APPROVED
        $inspection->update(['status' => InspectionStatusEnum::APPROVED]);
        $inspection->refresh();

        // Approve through both steps
        $this->approvalService->approve($inspection, $this->supervisor, 'Supervisor approved');
        $this->approvalService->approve($inspection, $this->manager, 'Manager approved');

        // Get approval history
        $history = $this->approvalService->getApprovalHistory($inspection);
        
        $this->assertEquals(2, $history->count());
        $this->assertEquals($this->supervisor->id, $history->first()->approved_by);
        $this->assertEquals($this->manager->id, $history->last()->approved_by);
        $this->assertEquals('Supervisor approved', $history->first()->remarks);
        $this->assertEquals('Manager approved', $history->last()->remarks);
    }
}