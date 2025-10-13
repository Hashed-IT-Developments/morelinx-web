<?php

namespace Tests\Support;

use App\Models\User;
use App\Enums\RolesEnum;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Helper trait for setting up approval flow tests
 */
trait ApprovalFlowTestHelper
{
    use RefreshDatabase;

    protected $superadminUser;
    protected $regularUser;
    protected $superadminRole;
    protected $userRole;

    /**
     * Set up common test data for approval flow tests
     */
    protected function setUpApprovalFlowTest(): void
    {
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
     * Get valid approval flow data for testing
     */
    protected function getValidApprovalFlowData(array $overrides = []): array
    {
        return array_merge([
            'module' => \App\Enums\ModuleName::CUSTOMER_APPLICATION,
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
        ], $overrides);
    }

    /**
     * Get invalid approval flow data for testing validation
     */
    protected function getInvalidApprovalFlowData(): array
    {
        return [
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
    }
}