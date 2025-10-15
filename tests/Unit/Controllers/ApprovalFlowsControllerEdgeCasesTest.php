<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\Configurations\ApprovalFlowsController;
use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\User;
use App\Enums\ModuleName;
use App\Enums\RolesEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Support\ApprovalFlowTestHelper;

class ApprovalFlowsControllerEdgeCasesTest extends TestCase
{
    use ApprovalFlowTestHelper;

    protected $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpApprovalFlowTest();
        $this->controller = new ApprovalFlowsController();
    }

    /**
     * Test store method with extremely long step array
     */
    public function test_store_with_maximum_steps_limit()
    {
        $this->actingAs($this->superadminUser);
        
        // Create 50 steps (testing performance and limits)
        $steps = [];
        for ($i = 1; $i <= 50; $i++) {
            $steps[] = [
                'order' => $i,
                'role_id' => $i % 2 === 0 ? $this->userRole->id : null,
                'user_id' => $i % 2 === 1 ? $this->regularUser->id : null,
            ];
        }
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Max Steps Flow',
            'description' => 'Testing maximum steps',
            'steps' => $steps
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $approvalFlow = ApprovalFlow::where('name', 'Max Steps Flow')->first();
        $this->assertEquals(50, $approvalFlow->steps()->count());
    }

    /**
     * Test store method with unicode and special characters
     */
    public function test_store_with_unicode_and_special_characters()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow 测试 🚀 & Special Characters @#$%',
            'description' => 'Description with émojis 🎉 and spëcial châractërs',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('approval_flows', [
            'name' => 'Test Flow 测试 🚀 & Special Characters @#$%',
            'description' => 'Description with émojis 🎉 and spëcial châractërs',
        ]);
    }

    /**
     * Test store method with SQL injection attempts
     */
    public function test_store_prevents_sql_injection()
    {
        $this->actingAs($this->superadminUser);
        
        $maliciousData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => "'; DROP TABLE approval_flows; --",
            'description' => "'; UPDATE users SET password = 'hacked'; --",
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $maliciousData);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        // Verify the malicious content is stored as-is (properly escaped)
        $this->assertDatabaseHas('approval_flows', [
            'name' => "'; DROP TABLE approval_flows; --",
            'description' => "'; UPDATE users SET password = 'hacked'; --",
        ]);
        
        // Verify tables still exist and weren't dropped
        $this->assertDatabaseHas('users', ['id' => $this->superadminUser->id]);
    }

    /**
     * Test concurrent creation of approval flows
     */
    public function test_concurrent_creation_duplicate_prevention()
    {
        $this->actingAs($this->superadminUser);
        
        // Create first approval flow
        $firstData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'First Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response1 = $this->post(route('approval-flows.store'), $firstData);
        $response1->assertRedirect(route('approval-flows.index'));
        $response1->assertSessionHas('success');
        
        // Attempt to create duplicate (different name, same module)
        $duplicateData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Second Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]
            ]
        ];
        
        $response2 = $this->post(route('approval-flows.store'), $duplicateData);
        $response2->assertSessionHasErrors(['module']);
        
        // Verify only one was created
        $this->assertEquals(1, ApprovalFlow::where('module', ModuleName::CUSTOMER_APPLICATION)->count());
    }

    /**
     * Test update with step reordering
     */
    public function test_update_with_step_reordering()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        // Create initial steps in order
        $step1 = $approvalFlow->steps()->create([
            'order' => 1,
            'role_id' => $this->userRole->id,
            'user_id' => null,
        ]);
        $step2 = $approvalFlow->steps()->create([
            'order' => 2,
            'role_id' => null,
            'user_id' => $this->regularUser->id,
        ]);
        $step3 = $approvalFlow->steps()->create([
            'order' => 3,
            'role_id' => $this->superadminRole->id,
            'user_id' => null,
        ]);
        
        // Update with reversed order
        $updateData = [
            'module' => $approvalFlow->module,
            'name' => $approvalFlow->name,
            'description' => $approvalFlow->description,
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->superadminRole->id,
                    'user_id' => null,
                ],
                [
                    'order' => 2,
                    'role_id' => null,
                    'user_id' => $this->regularUser->id,
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
        
        // Verify steps are reordered correctly
        $approvalFlow->refresh();
        $steps = $approvalFlow->steps()->orderBy('order')->get();
        
        $this->assertEquals($this->superadminRole->id, $steps[0]->role_id);
        $this->assertEquals($this->regularUser->id, $steps[1]->user_id);
        $this->assertEquals($this->userRole->id, $steps[2]->role_id);
    }

    /**
     * Test store with duplicate step orders
     */
    public function test_store_allows_duplicate_step_orders()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Duplicate Order Flow',
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ],
                [
                    'order' => 1, // Duplicate order
                    'role_id' => null,
                    'user_id' => $this->regularUser->id,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        // Should succeed as the validation doesn't check for unique orders
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $approvalFlow = ApprovalFlow::where('name', 'Duplicate Order Flow')->first();
        $this->assertEquals(2, $approvalFlow->steps()->count());
        $this->assertEquals(2, $approvalFlow->steps()->where('order', 1)->count());
    }

    /**
     * Test destroy with database constraints
     */
    public function test_destroy_with_foreign_key_constraints()
    {
        $this->actingAs($this->superadminUser);
        
        $approvalFlow = ApprovalFlow::factory()->create();
        
        // Create steps
        $approvalFlow->steps()->create([
            'order' => 1,
            'role_id' => $this->userRole->id,
            'user_id' => null,
        ]);
        
        $approvalFlowId = $approvalFlow->id;
        
        $response = $this->delete(route('approval-flows.destroy', $approvalFlow));
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        // Verify both flow and steps are deleted
        $this->assertDatabaseMissing('approval_flows', ['id' => $approvalFlowId]);
        $this->assertDatabaseMissing('approval_flow_steps', ['approval_flow_id' => $approvalFlowId]);
    }

    /**
     * Test validation edge case with null values
     */
    public function test_validation_with_null_values()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'description' => null, // Explicitly null
            'department_id' => null, // Explicitly null
            'steps' => [
                [
                    'order' => 1,
                    'role_id' => null, // Explicitly null
                    'user_id' => $this->regularUser->id,
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertRedirect(route('approval-flows.index'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('approval_flows', [
            'name' => 'Test Flow',
            'description' => null,
            'department_id' => null,
        ]);
    }

    /**
     * Test memory usage with large datasets
     */
    public function test_index_memory_efficiency_with_large_dataset()
    {
        $this->actingAs($this->superadminUser);
        
        // Create 100 approval flows with steps
        for ($i = 1; $i <= 100; $i++) {
            $flow = ApprovalFlow::factory()->create([
                'name' => "Flow {$i}",
            ]);
            
            // Add 5 steps each
            for ($j = 1; $j <= 5; $j++) {
                $flow->steps()->create([
                    'order' => $j,
                    'role_id' => $this->userRole->id,
                    'user_id' => null,
                ]);
            }
        }
        
        $memoryBefore = memory_get_usage();
        
        $response = $this->get(route('approval-flows.index'));
        
        $memoryAfter = memory_get_usage();
        $memoryUsed = $memoryAfter - $memoryBefore;
        
        $response->assertOk();
        
        // Assert reasonable memory usage (less than 50MB for this dataset)
        $this->assertLessThan(50 * 1024 * 1024, $memoryUsed, 'Memory usage too high for dataset');
    }

    /**
     * Test malformed JSON-like input
     */
    public function test_store_with_malformed_step_data()
    {
        $this->actingAs($this->superadminUser);
        
        $requestData = [
            'module' => ModuleName::CUSTOMER_APPLICATION,
            'name' => 'Test Flow',
            'steps' => [
                [
                    'order' => 'not_a_number',
                    'role_id' => 'not_a_number',
                    'user_id' => 'not_a_number',
                ]
            ]
        ];
        
        $response = $this->post(route('approval-flows.store'), $requestData);
        
        $response->assertSessionHasErrors([
            'steps.0.order',
            'steps.0.role_id',
            'steps.0.user_id'
        ]);
    }

    /**
     * Test concurrent access by different users
     */
    public function test_concurrent_access_different_users()
    {
        $approvalFlow = ApprovalFlow::factory()->create();
        
        // User 1 (superadmin) starts editing
        $this->actingAs($this->superadminUser);
        $response1 = $this->get(route('approval-flows.edit', $approvalFlow));
        $response1->assertOk();
        
        // User 2 (regular user) tries to delete
        $this->actingAs($this->regularUser);
        $response2 = $this->delete(route('approval-flows.destroy', $approvalFlow));
        $response2->assertRedirect(route('approval-flows.index'));
        $response2->assertSessionHas('error'); // Should fail due to authorization
        
        // User 1 should still be able to update
        $this->actingAs($this->superadminUser);
        $updateData = $this->getValidApprovalFlowData(['name' => 'Updated by User 1']);
        
        $response3 = $this->put(route('approval-flows.update', $approvalFlow), $updateData);
        $response3->assertRedirect(route('approval-flows.index'));
        $response3->assertSessionHas('success');
        
        // Verify the flow still exists and was updated
        $this->assertDatabaseHas('approval_flows', [
            'id' => $approvalFlow->id,
            'name' => 'Updated by User 1',
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}