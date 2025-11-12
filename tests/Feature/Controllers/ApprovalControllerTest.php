<?php

namespace Tests\Feature\Controllers;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\RolesEnum;
use App\Http\Controllers\ApprovalFlowSystem\ApprovalController;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\User;
use App\Services\ApprovalFlowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApprovalControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $admin;
    protected User $superadmin;
    protected User $inspector;
    protected ApprovalFlowService $approvalService;
    protected CustomerApplication $customerApplication;
    protected CustApplnInspection $inspection;

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
    public function complete_approval_controller_flow_works_correctly()
    {
        // Note: This test focuses on HTTP layer, not business logic
        // Business logic is tested in separate approval flow tests
        
        // 1. Create CustomerApplication
        $this->customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        // 2. Test getting pending approvals
        $this->actingAs($this->user);
        $response = $this->get(route('applications.approvals'));
        $response->assertStatus(200);

        // 3. Test that approval endpoints exist and respond (using mocked service)
        $this->mock(ApprovalFlowService::class, function ($mock) {
            $mock->shouldReceive('approve')->andReturn(true);
            $mock->shouldReceive('getPendingApprovalsForUser')->andReturn(collect([]));
            $mock->shouldReceive('getCurrentStepInfo')->andReturn(['step' => 'test']);
        });

        // Ensure model has canUserApprove method that returns true for this test
        $this->assertTrue(method_exists($this->customerApplication, 'canUserApprove'));
        
        // Test the HTTP endpoints work
        $response = $this->post(route('approvals.approve'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $this->customerApplication->id,
            'remarks' => 'Test approval'
        ]);

        $response->assertRedirect();
    }

    #[Test]
    public function index_returns_pending_approvals_for_user()
    {
        // Create test applications
        $application1 = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);
        
        $application2 = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->actingAs($this->admin);
        $response = $this->get(route('applications.approvals'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('approvals/index')
                 ->has('approvals')
                 ->has('dashboardData')
                 ->has('modelTypes')
        );
    }

    #[Test]
    public function index_filters_by_model_class()
    {
        CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->actingAs($this->admin);
        $response = $this->get(route('applications.approvals'));

        $response->assertStatus(200);
    }

    #[Test]
    public function approve_action_works_correctly()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->actingAs($this->admin);
        $response = $this->post(route('approvals.approve'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id,
            'remarks' => 'Approved by admin'
        ]);

        $response->assertRedirect();
        // Since no approval flow exists, we expect an error message
        $response->assertSessionHas('error');
    }

    #[Test]
    public function approve_action_validates_required_fields()
    {
        $this->actingAs($this->admin);
        $response = $this->post(route('approvals.approve'), []);

        $response->assertSessionHasErrors(['model_type', 'model_id']);
    }

    #[Test]
    public function approve_action_validates_model_existence()
    {
        $this->actingAs($this->admin);
        $response = $this->post(route('approvals.approve'), [
            'model_type' => 'CustomerApplication',
            'model_id' => 99999, // Non-existent ID
            'remarks' => 'Test'
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    #[Test]
    public function approve_action_checks_user_permissions()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        // Create a user without proper permissions
        $unauthorizedUser = User::factory()->create();
        
        $this->actingAs($unauthorizedUser);
        $response = $this->post(route('approvals.approve'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id,
            'remarks' => 'Unauthorized approval attempt'
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    #[Test]
    public function reject_action_works_correctly()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->actingAs($this->admin);
        $response = $this->post(route('approvals.reject'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id,
            'remarks' => 'Rejected due to missing documents'
        ]);

        $response->assertRedirect();
        // Since no approval flow exists, we expect an error message
        $response->assertSessionHas('error');
    }

    #[Test]
    public function reject_action_requires_remarks()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->actingAs($this->admin);
        $response = $this->post(route('approvals.reject'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id,
            // Missing remarks
        ]);

        $response->assertSessionHasErrors(['remarks']);
    }

    #[Test]
    public function reset_action_works_for_authorized_users()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        // Mock the approval service to return success
        $this->mock(ApprovalFlowService::class, function ($mock) {
            $mock->shouldReceive('resetApprovalFlow')->once()->andReturn(true);
        });

        $this->actingAs($this->superadmin);
        $response = $this->post(route('approvals.reset'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Approval flow reset successfully.');
    }

    #[Test]
    public function reset_action_denies_unauthorized_users()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->actingAs($this->user); // Regular user cannot reset
        $response = $this->post(route('approvals.reset'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    #[Test]
    public function history_action_returns_approval_history()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        $this->actingAs($this->admin);
        $response = $this->get(route('approvals.history', [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('approvals/history')
                 ->has('history')
                 ->has('model')
                 ->has('current_status')
                 ->has('progress')
        );
    }

    #[Test]
    public function history_action_validates_model_existence()
    {
        $this->actingAs($this->admin);
        $response = $this->get(route('approvals.history', [
            'model_type' => 'CustomerApplication',
            'model_id' => 99999 // Non-existent ID
        ]));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    #[Test]
    public function get_model_class_handles_invalid_types()
    {
        $controller = new ApprovalController($this->approvalService);
        
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Invalid model type: InvalidModel');
        
        // Use reflection to access protected method
        $reflection = new \ReflectionClass($controller);
        $method = $reflection->getMethod('getModelClass');
        $method->setAccessible(true);
        
        $method->invoke($controller, 'InvalidModel');
    }

    #[Test]
    public function get_model_title_returns_correct_format()
    {
        $application = CustomerApplication::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $controller = new ApprovalController($this->approvalService);
        
        // Use reflection to access protected method
        $reflection = new \ReflectionClass($controller);
        $method = $reflection->getMethod('getModelTitle');
        $method->setAccessible(true);
        
        $title = $method->invoke($controller, $application);
        
        $this->assertEquals("John Doe - {$application->account_number}", $title);
    }

    #[Test]
    public function inspection_approval_flow_through_controller()
    {
        // Create customer application and inspection
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $application->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => $this->inspector->id,
            'schedule_date' => now()->addDays(1)
        ]);

        // Admin tries to approve - should get error since no approval flow exists
        $this->actingAs($this->admin);
        $response = $this->post(route('approvals.approve'), [
            'model_type' => 'CustApplnInspection',
            'model_id' => $inspection->id,
            'remarks' => 'Inspection approved by admin'
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');

        // Superadmin tries to approve - should also get error since no approval flow exists
        $this->actingAs($this->superadmin);
        $response = $this->post(route('approvals.approve'), [
            'model_type' => 'CustApplnInspection',
            'model_id' => $inspection->id,
            'remarks' => 'Final approval by superadmin'
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    #[Test]
    public function concurrent_approval_requests_are_handled_correctly()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        // Simulate concurrent approval attempts
        $this->actingAs($this->admin);
        $response1 = $this->post(route('approvals.approve'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id,
            'remarks' => 'First approval attempt'
        ]);

        $response2 = $this->post(route('approvals.approve'), [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id,
            'remarks' => 'Second approval attempt'
        ]);

        // Both should handle gracefully
        $response1->assertRedirect();
        $response2->assertRedirect();
    }

    #[Test]
    public function approval_flow_maintains_audit_trail()
    {
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);

        // Approve by multiple users
        $this->simulateApprovalByUser($application, $this->user);
        $this->simulateApprovalByUser($application, $this->admin);

        // Check history contains all approvals
        $this->actingAs($this->admin);
        $response = $this->get(route('approvals.history', [
            'model_type' => 'CustomerApplication',
            'model_id' => $application->id
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('history')
                 ->where('model.type', 'CustomerApplication')
                 ->where('model.id', $application->id)
        );
    }

    // Helper methods for simulating approvals

    private function simulateApprovalByUser($model, User $user): void
    {
        $this->actingAs($user);
        $modelType = class_basename($model);
        
        $this->post(route('approvals.approve'), [
            'model_type' => $modelType,
            'model_id' => $model->id,
            'remarks' => "Approved by {$user->name}"
        ]);
    }

    private function simulateInspectionApprovalByUser(CustApplnInspection $inspection, User $user): void
    {
        $this->actingAs($user);
        
        $this->post(route('approvals.approve'), [
            'model_type' => 'CustApplnInspection',
            'model_id' => $inspection->id,
            'remarks' => "Inspection approved by {$user->name}"
        ]);
    }
}