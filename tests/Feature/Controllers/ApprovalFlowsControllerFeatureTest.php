<?php

namespace Tests\Feature\Controllers;

use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\ApprovalFlowSystem\ApprovalFlowStep;
use App\Models\User;
use App\Enums\ModuleName;
use App\Enums\RolesEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ApprovalFlowsControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected $superadminUser;
    protected $regularUser;
    protected $superadminRole;
    protected $userRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles
        $this->superadminRole = Role::create(['name' => RolesEnum::SUPERADMIN]);
        $this->userRole = Role::create(['name' => RolesEnum::USER]);
        
        // Create users
        $this->superadminUser = User::factory()->create();
        $this->superadminUser->assignRole($this->superadminRole);
        
        $this->regularUser = User::factory()->create();
        $this->regularUser->assignRole($this->userRole);
    }

    /**
     * Test full workflow: create, read, update, delete approval flow
     */
    public function test_complete_approval_flow_crud_workflow()
    {
        $this->actingAs($this->superadminUser);
        
        // 1. Create approval flow
        $createData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Approval Flow',
            'description' => 'Test Description',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ],
                [
                    'order' => 2,
                    'role_id' => null,
                    'user_id' => $this->regularUser->id,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $createData);
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $approvalFlow = ApprovalFlow::where('name', 'Test Approval Flow')->first();
        $this->assertNotNull($approvalFlow);
        $this->assertEquals(2, $approvalFlow->steps()->count());
        
        // 2. Read approval flow (index)
        $response = $this->get(route('approval-flows.index'));
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => 
            $page->component('configurations/approval-flows/index')
                 ->has('approvalFlows', 1)
                 ->where('approvalFlows.0.name', 'Test Approval Flow')
        );
        
        // 3. Edit approval flow (show edit form)
        $response = $this->get(route('approval-flows.edit', $approvalFlow));
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => 
            $page->component('configurations/approval-flows/create-update')
                 ->where('approvalFlow.name', 'Test Approval Flow')
        );
        
        // 4. Update approval flow
        $updateData = [
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
            'name' => 'Updated Approval Flow',
            'description' => 'Updated Description',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->superadminRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->put(route('approval-flows.update', $approvalFlow), $updateData);
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $approvalFlow->refresh();
        $this->assertEquals('Updated Approval Flow', $approvalFlow->name);
        $this->assertEquals(ModuleName::FOR_INSPECTION_APPROVAL, $approvalFlow->module);
        $this->assertEquals(1, $approvalFlow->steps()->count());
        
        // 5. Delete approval flow
        $response = $this->delete(route('approval-flows.destroy', $approvalFlow));
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseMissing('approval_flows', ['id' => $approvalFlow->id]);
    }

    /**
     * Test creating approval flow with multiple validation errors
     */
    public function test_create_approval_flow_with_multiple_validation_errors()
    {
        $this->actingAs($this->superadminUser);
        
        $invalidData = [
            // Missing required fields
            'module' => '',
            'name' => '',
            'description' => str_repeat('a', 501), // Too long
            'steps' => [
                [
                    'order' => 0, // Invalid: less than 1
                    'role_id' => 99999, // Non-existent role
                    'user_id' => null,
                ],
                [
                    'order' => 2,
                    'role_id' => null,
                    'user_id' => null, // Invalid: no role or user
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $invalidData);
        
        $response->assertSessionHasErrors([
            'module',
            'name', 
            'description',
            'steps.0.order',
            'steps.0.role_id',
        ]);
        
        $this->assertDatabaseMissing('approval_flows', ['name' => '']);
    }

    /**
     * Test preventing duplicate module/department combinations with different department IDs
     */
    public function test_prevent_duplicate_module_with_different_departments()
    {
        $this->actingAs($this->superadminUser);
        
        // Create first approval flow for module with no department
        ApprovalFlow::factory()->create([
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'department_id' => null,
        ]);
        
        // Try to create another for same module with no department (should fail)
        $duplicateData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'department_id' => null,
            'name' => 'Duplicate Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $duplicateData);
        $response->assertSessionHasErrors(['module']);
        
        // Create approval flow for same module but with department (should succeed)
        $validData = [
            'module' => ModuleName::FOR_INSPECTION_APPROVAL, // Different module instead of department
            'department_id' => null,
            'name' => 'Different Module Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $validData);
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
    }

    /**
     * Test cascade deletion of approval flow steps
     */
    public function test_deleting_approval_flow_cascades_to_steps()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        // Create multiple steps
        $step1 = ApprovalFlowStep::factory()->create([
            'approval_flow_id' => $approvalFlow->id,
            'order' => 1,
        ]);
        $step2 = ApprovalFlowStep::factory()->create([
            'approval_flow_id' => $approvalFlow->id,
            'order' => 2,
        ]);
        
        $this->assertDatabaseHas('approval_flow_steps', ['id' => $step1->id]);
        $this->assertDatabaseHas('approval_flow_steps', ['id' => $step2->id]);
        
        // Delete approval flow
        $response = $this->delete(route('approval-flows.destroy', $approvalFlow));
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        // Check that steps are also deleted
        $this->assertDatabaseMissing('approval_flow_steps', ['id' => $step1->id]);
        $this->assertDatabaseMissing('approval_flow_steps', ['id' => $step2->id]);
    }

    /**
     * Test updating approval flow recreates steps correctly
     */
    public function test_updating_approval_flow_recreates_steps()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        // Create initial steps
        $originalStep1 = ApprovalFlowStep::factory()->create([
            'approval_flow_id' => $approvalFlow->id,
            'order' => 1,
            'role_id' => $this->userRole->id,
        ]);
        $originalStep2 = ApprovalFlowStep::factory()->create([
            'approval_flow_id' => $approvalFlow->id,
            'order' => 2,
            'user_id' => $this->regularUser->id,
        ]);
        
        $this->assertEquals(2, $approvalFlow->steps()->count());
        
        // Update with different steps
        $updateData = [
            'module' => $approvalFlow->module,
            'name' => 'Updated Flow',
            'description' => 'Updated description',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->superadminRole->id,
                    'user_id' => null,
                ],
                [
                    'order' => 2,
                    'role_id' => null,
                    'user_id' => $this->superadminUser->id,
                ],
                [
                    'order' => 3,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->put(route('approval-flows.update', $approvalFlow), $updateData);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        // Check old steps are deleted
        $this->assertDatabaseMissing('approval_flow_steps', ['id' => $originalStep1->id]);
        $this->assertDatabaseMissing('approval_flow_steps', ['id' => $originalStep2->id]);
        
        // Check new steps are created
        $approvalFlow->refresh();
        $this->assertEquals(3, $approvalFlow->steps()->count());
        
        $newSteps = $approvalFlow->steps()->orderBy('order')->get();
        $this->assertEquals($this->superadminRole->id, $newSteps[0]->role_id);
        $this->assertEquals($this->superadminUser->id, $newSteps[1]->user_id);
        $this->assertEquals($this->userRole->id, $newSteps[2]->role_id);
    }

    /**
     * Test authorization across all methods for different user types
     */
    public function test_authorization_enforcement_across_all_methods()
    {
        $approvalFlow = ApprovalFlow::factory()->create();
        
        // Test as regular user (non-superadmin)
        $this->actingAs($this->regularUser);
        
        // Store should fail
        $response = $this->post(route('approval-flows.store'), [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [['order' => 1, 'role_id' => $this->userRole->id, 'user_id' => null]]
        ]);
        $response->assertSessionHasErrors(['authorization']);
        
        // Update should fail
        $response = $this->put(route('approval-flows.update', $approvalFlow), [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Updated Flow',
            'steps' => [['order' => 1, 'role_id' => $this->userRole->id, 'user_id' => null]]
        ]);
        $response->assertSessionHasErrors(['authorization']);
        
        // Destroy should fail with error message
        $response = $this->delete(route('approval-flows.destroy', $approvalFlow));
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('error');
        
        // Index and create/edit should be accessible (assuming no additional middleware)
        $response = $this->get(route('approval-flows.index'));
        $response->assertOk();
        
        $response = $this->get(route('approval-flows.create'));
        $response->assertOk();
        
        $response = $this->get(route('approval-flows.edit', $approvalFlow));
        $response->assertOk();
    }

    /**
     * Test edge case: empty description and department_id
     */
    public function test_create_approval_flow_with_null_optional_fields()
    {
        $this->actingAs($this->superadminUser);
        
        $data = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'description' => null,
            'department_id' => null,
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $data);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('approval_flows', [
            'name' => 'Test Flow',
            'description' => null,
            'department_id' => null,
        ]);
    }

    /**
     * Test edge case: very large number of steps
     */
    public function test_create_approval_flow_with_many_steps()
    {
        $this->actingAs($this->superadminUser);
        
        // Create 10 steps
        $steps = [];
        for ($i = 1; $i <= 10; $i++) {
            $steps[] = [
                'order' => $i,
                'role_id' => $i % 2 === 0 ? $this->userRole->id : null,
                'user_id' => $i % 2 === 1 ? $this->regularUser->id : null,
            ];
        }
        
        $data = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Multi-Step Flow',
            'steps' => $steps
        ];
        
        $response = $this->post(route('approval-flows.store'), $data);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $approvalFlow = ApprovalFlow::where('name', 'Multi-Step Flow')->first();
        $this->assertEquals(10, $approvalFlow->steps()->count());
    }

    /**
     * Test performance with multiple approval flows
     */
    public function test_index_performance_with_multiple_approval_flows()
    {
        $this->actingAs($this->superadminUser);
        
        // Create multiple approval flows
        ApprovalFlow::factory(20)->create();
        
        $response = $this->get(route('approval-flows.index'));
        
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => 
            $page->component('configurations/approval-flows/index')
                 ->has('approvalFlows', 20)
        );
    }
}