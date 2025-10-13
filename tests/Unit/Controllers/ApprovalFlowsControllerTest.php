<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\Configurations\ApprovalFlowsController;
use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\User;
use App\Enums\ModuleName;
use App\Enums\RolesEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ApprovalFlowsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $controller;
    protected $superadminUser;
    protected $regularUser;
    protected $superadminRole;
    protected $userRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->controller = new ApprovalFlowsController();
        
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
     * Test index method returns approval flows with relationships
     */
    public function test_index_returns_approval_flows_with_relationships()
    {
        // Create test data
        $approvalFlow = ApprovalFlow::factory()->create();
        
        $this->actingAs($this->superadminUser);
        
        $response = $this->get(route('approval-flows.index'));
        
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => 
            $page->component('configurations/approval-flows/index')
                 ->has('approvalFlows')
        );
    }

    /**
     * Test index method with empty approval flows
     */
    public function test_index_returns_empty_array_when_no_approval_flows()
    {
        $this->actingAs($this->superadminUser);
        
        $response = $this->get(route('approval-flows.index'));
        
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => 
            $page->component('configurations/approval-flows/index')
                 ->where('approvalFlows', [])
        );
    }

    /**
     * Test create method returns required data
     */
    public function test_create_returns_required_data()
    {
        $this->actingAs($this->superadminUser);
        
        $response = $this->get(route('approval-flows.create'));
        
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => 
            $page->component('configurations/approval-flows/create-update')
                 ->has('modules')
                 ->has('roles')
                 ->has('users')
        );
    }

    /**
     * Test store method with valid data and superadmin user
     */
    public function test_store_creates_approval_flow_with_valid_data_as_superadmin()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
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
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success', 'Approval flow saved successfully.');
        
        $this->assertDatabaseHas('approval_flows', [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Approval Flow',
            'description' => 'Test Description',
            'created_by' => $this->superadminUser->id,
        ]);
    }

    /**
     * Test store method fails for non-superadmin user
     */
    public function test_store_fails_for_non_superadmin_user()
    {
        $this->actingAs($this->regularUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Approval Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['authorization']);
        $this->assertDatabaseMissing('approval_flows', [
            'name' => 'Test Approval Flow',
        ]);
    }

    /**
     * Test store method prevents duplicate module/department combinations
     */
    public function test_store_prevents_duplicate_module_department_combination()
    {
        $this->actingAs($this->superadminUser);
        
        // Create existing approval flow
        ApprovalFlow::factory()->create([
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'department_id' => null,
        ]);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'department_id' => null,
            'name' => 'Duplicate Test Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['module']);
        $this->assertDatabaseMissing('approval_flows', [
            'name' => 'Duplicate Test Flow',
        ]);
    }

    /**
     * Test store method validates required fields
     */
    public function test_store_validates_required_fields()
    {
        $this->actingAs($this->superadminUser);
        
        $response = $this->post(route('approval-flows.store'), []);
        
        $response->assertSessionHasErrors(['module', 'name', 'steps']);
    }

    /**
     * Test store method validates steps have either role_id or user_id
     */
    public function test_store_validates_steps_have_role_or_user()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => null,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['steps.0']);
    }

    /**
     * Test store method validates step order minimum value
     */
    public function test_store_validates_step_order_minimum()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [
                [
                    'order' => 0, // Invalid: less than 1
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['steps.0.order']);
    }

    /**
     * Test store method validates name maximum length
     */
    public function test_store_validates_name_max_length()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => str_repeat('a', 256), // Too long
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['name']);
    }

    /**
     * Test store method validates description maximum length
     */
    public function test_store_validates_description_max_length()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'description' => str_repeat('a', 501), // Too long
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['description']);
    }

    /**
     * Test store method validates steps array is not empty
     */
    public function test_store_validates_steps_minimum_count()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [] // Empty array
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['steps']);
    }

    /**
     * Test edit method loads approval flow with relationships
     */
    public function test_edit_loads_approval_flow_with_relationships()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        $response = $this->get(route('approval-flows.edit', $approvalFlow));
        
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => 
            $page->component('configurations/approval-flows/create-update')
                 ->has('modules')
                 ->has('roles')
                 ->has('users')
                 ->has('approvalFlow')
        );
    }

    /**
     * Test update method with valid data and superadmin user
     */
    public function test_update_modifies_approval_flow_with_valid_data_as_superadmin()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        $requestData = [
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
            'name' => 'Updated Flow Name',
            'description' => 'Updated Description',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->put(route('approval-flows.update', $approvalFlow), $requestData);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success', 'Approval flow updated successfully.');
        
        $this->assertDatabaseHas('approval_flows', [
            'id' => $approvalFlow->id,
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
            'name' => 'Updated Flow Name',
            'description' => 'Updated Description',
        ]);
    }

    /**
     * Test update method fails for non-superadmin user
     */
    public function test_update_fails_for_non_superadmin_user()
    {
        $this->actingAs($this->regularUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        $originalName = $approvalFlow->name;
        
        $requestData = [
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
            'name' => 'Updated Flow Name',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->put(route('approval-flows.update', $approvalFlow), $requestData);
        
        $response->assertSessionHasErrors(['authorization']);
        $this->assertDatabaseHas('approval_flows', [
            'id' => $approvalFlow->id,
            'name' => $originalName, // Should remain unchanged
        ]);
    }

    /**
     * Test update method validates step requirements
     */
    public function test_update_validates_step_requirements()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => null,
                    'user_id' => null, // Invalid: no role or user
                ]
            ]
        ];
        
        $response = $this->put(route('approval-flows.update', $approvalFlow), $requestData);
        
        $response->assertSessionHasErrors(['steps.0']);
    }

    /**
     * Test destroy method with superadmin user
     */
    public function test_destroy_deletes_approval_flow_as_superadmin()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        $response = $this->delete(route('approval-flows.destroy', $approvalFlow));
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success', 'Approval flow deleted successfully.');
        
        $this->assertDatabaseMissing('approval_flows', [
            'id' => $approvalFlow->id,
        ]);
    }

    /**
     * Test destroy method fails for non-superadmin user
     */
    public function test_destroy_fails_for_non_superadmin_user()
    {
        $this->actingAs($this->regularUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        $response = $this->delete(route('approval-flows.destroy', $approvalFlow));
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('error', 'Unauthorized. Only superadmin users can delete approval flows.');
        
        $this->assertDatabaseHas('approval_flows', [
            'id' => $approvalFlow->id,
        ]);
    }

    /**
     * Test that attempting to access non-existent approval flow returns 404
     */
    public function test_edit_nonexistent_approval_flow_returns_404()
    {
        $this->actingAs($this->superadminUser);
        
        $response = $this->get(route('approval-flows.edit', 99999));
        
        $response->assertNotFound();
    }

    /**
     * Test that attempting to update non-existent approval flow returns 404
     */
    public function test_update_nonexistent_approval_flow_returns_404()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->put(route('approval-flows.update', 99999), $requestData);
        
        $response->assertNotFound();
    }

    /**
     * Test that attempting to delete non-existent approval flow returns 404
     */
    public function test_destroy_nonexistent_approval_flow_returns_404()
    {
        $this->actingAs($this->superadminUser);
        
        $response = $this->delete(route('approval-flows.destroy', 99999));
        
        $response->assertNotFound();
    }

    /**
     * Test store with invalid role_id
     */
    public function test_store_validates_invalid_role_id()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => 99999, // Non-existent role
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['steps.0.role_id']);
    }

    /**
     * Test store with invalid user_id
     */
    public function test_store_validates_invalid_user_id()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => null,
                    'user_id' => 99999, // Non-existent user
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors(['steps.0.user_id']);
    }

    /**
     * Test that guest users cannot access any methods
     */
    public function test_guest_users_cannot_access_approval_flows()
    {
        $approvalFlow = ApprovalFlow::factory()->create();
        
        // Test index
        $response = $this->get(route('approval-flows.index'));
        $response->assertRedirect(route('login'));
        
        // Test create
        $response = $this->get(route('approval-flows.create'));
        $response->assertRedirect(route('login'));
        
        // Test store
        $response = $this->post(route('approval-flows.store'), []);
        $response->assertRedirect(route('login'));
        
        // Test edit
        $response = $this->get(route('approval-flows.edit', $approvalFlow));
        $response->assertRedirect(route('login'));
        
        // Test update
        $response = $this->put(route('approval-flows.update', $approvalFlow), []);
        $response->assertRedirect(route('login'));
        
        // Test destroy
        $response = $this->delete(route('approval-flows.destroy', $approvalFlow));
        $response->assertRedirect(route('login'));
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}