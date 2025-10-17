<?php

namespace Tests\Unit;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\RolesEnum;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApprovalFlowTraitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles and permissions for the tests
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);
    }

    #[Test]
    public function customer_application_implements_approval_flow_interface()
    {
        $customerApplication = new CustomerApplication();
        
        $this->assertInstanceOf(\App\Contracts\RequiresApprovalFlow::class, $customerApplication);
        $this->assertTrue(method_exists($customerApplication, 'getApprovalModule'));
        $this->assertTrue(method_exists($customerApplication, 'getApprovalDepartmentId'));
        $this->assertTrue(method_exists($customerApplication, 'shouldInitializeApprovalFlow'));
    }

    #[Test]
    public function inspection_implements_approval_flow_interface()
    {
        $inspection = new CustApplnInspection();
        
        $this->assertInstanceOf(\App\Contracts\RequiresApprovalFlow::class, $inspection);
        $this->assertTrue(method_exists($inspection, 'shouldInitializeApprovalFlowOn'));
    }

    #[Test]
    public function customer_application_approval_module_is_correct()
    {
        $customerApplication = CustomerApplication::factory()->create();
        
        $this->assertEquals('customer_application', $customerApplication->getApprovalModule());
    }

    #[Test]
    public function inspection_approval_module_is_correct()
    {
        $inspection = CustApplnInspection::factory()->create();
        
        $this->assertEquals('for_inspection_approval', $inspection->getApprovalModule());
    }

    #[Test]
    public function customer_application_initializes_approval_flow_by_default()
    {
        $customerApplication = CustomerApplication::factory()->create();
        
        $this->assertTrue($customerApplication->shouldInitializeApprovalFlow());
    }

    #[Test]
    public function inspection_does_not_initialize_approval_flow_on_creation()
    {
        $inspection = CustApplnInspection::factory()->create();
        
        $this->assertFalse($inspection->shouldInitializeApprovalFlow());
    }

    #[Test]
    public function inspection_initializes_approval_flow_on_status_change_to_for_inspection_approval()
    {
        $inspection = CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);
        
        // Test that it doesn't initialize on creation
        $this->assertFalse($inspection->shouldInitializeApprovalFlowOn('created'));
        
        // Change status to for_inspection_approval
        $inspection->status = InspectionStatusEnum::FOR_INSPECTION_APPROVAL;
        
        // Test that it initializes on this specific status change
        $this->assertTrue($inspection->shouldInitializeApprovalFlowOn('updated'));
    }

    #[Test]
    public function inspection_does_not_initialize_approval_flow_on_other_status_changes()
    {
        $inspection = CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);
        
        // Change to other statuses
        $inspection->status = InspectionStatusEnum::APPROVED;
        $this->assertFalse($inspection->shouldInitializeApprovalFlowOn('updated'));
        
        $inspection->status = InspectionStatusEnum::REJECTED;
        $this->assertFalse($inspection->shouldInitializeApprovalFlowOn('updated'));
    }

    #[Test]
    public function application_status_enum_contains_all_required_values()
    {
        $expectedStatuses = [
            'in_process',
            'for_ccd_approval',
            'for_inspection',
            'verified',
            'for_collection',
            'for_signing',
            'for_installation_approval',
            'active'
        ];
        
        $actualStatuses = ApplicationStatusEnum::getValues();
        
        foreach ($expectedStatuses as $status) {
            $this->assertContains($status, $actualStatuses);
        }
    }

    #[Test]
    public function inspection_status_enum_contains_all_required_values()
    {
        $expectedStatuses = [
            'for_inspection',
            'for_inspection_approval',
            'approved',
            'rejected'
        ];
        
        $actualStatuses = InspectionStatusEnum::getValues();
        
        foreach ($expectedStatuses as $status) {
            $this->assertContains($status, $actualStatuses);
        }
    }

    #[Test]
    public function roles_enum_contains_all_required_roles()
    {
        $expectedRoles = [
            'superadmin',
            'admin',
            'user',
            'inspector',
            'ccd staff',
            'ccd supervisor',
            'ndog supervisor',
            'treasury staff'
        ];
        
        $actualRoles = RolesEnum::getValues();
        
        foreach ($expectedRoles as $role) {
            $this->assertContains($role, $actualRoles);
        }
    }

    #[Test]
    public function customer_application_has_proper_relationships()
    {
        $customerApplication = CustomerApplication::factory()->create();
        
        // Test relationships exist
        $this->assertTrue(method_exists($customerApplication, 'barangay'));
        $this->assertTrue(method_exists($customerApplication, 'customerType'));
        $this->assertTrue(method_exists($customerApplication, 'inspections'));
        $this->assertTrue(method_exists($customerApplication, 'contactInfo'));
        $this->assertTrue(method_exists($customerApplication, 'billInfo'));
    }

    #[Test]
    public function inspection_has_proper_relationships()
    {
        $inspection = CustApplnInspection::factory()->create();
        
        // Test relationships exist
        $this->assertTrue(method_exists($inspection, 'customerApplication'));
        $this->assertTrue(method_exists($inspection, 'inspector'));
    }

    #[Test]
    public function customer_application_full_name_attribute_works()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'first_name' => 'John',
            'middle_name' => 'Doe',
            'last_name' => 'Smith',
            'suffix' => 'Jr.'
        ]);
        
        $this->assertEquals('John Doe Smith Jr.', $customerApplication->full_name);
    }

    #[Test]
    public function customer_application_full_name_handles_null_values()
    {
        $customerApplication = CustomerApplication::factory()->create([
            'first_name' => 'John',
            'middle_name' => null,
            'last_name' => 'Smith',
            'suffix' => null
        ]);
        
        $this->assertEquals('John Smith', $customerApplication->full_name);
    }

    #[Test]
    public function customer_application_search_scope_works()
    {
        CustomerApplication::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Smith',
            'account_number' => 'ACC123456'
        ]);
        
        CustomerApplication::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'account_number' => 'ACC789012'
        ]);
        
        $results = CustomerApplication::search('John')->get();
        $this->assertCount(1, $results);
        $this->assertEquals('John', $results->first()->first_name);
        
        $results = CustomerApplication::search('ACC123')->get();
        $this->assertCount(1, $results);
        $this->assertEquals('ACC123456', $results->first()->account_number);
    }

    #[Test]
    public function approval_flow_validation_rules_are_enforced()
    {
        // Test that certain business rules are enforced at the model level
        $customerApplication = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_CCD_APPROVAL
        ]);
        
        // Status should be one of the valid enum values
        $this->assertContains($customerApplication->status, ApplicationStatusEnum::getValues());
        
        // Required fields should be present
        $this->assertNotNull($customerApplication->first_name);
        $this->assertNotNull($customerApplication->last_name);
        $this->assertNotNull($customerApplication->account_number);
    }

    #[Test]
    public function inspection_validation_rules_are_enforced()
    {
        $inspection = CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION
        ]);
        
        // Status should be one of the valid enum values
        $this->assertContains($inspection->status, InspectionStatusEnum::getValues());
        
        // Required relationships should exist
        $this->assertNotNull($inspection->customer_application_id);
        $this->assertTrue($inspection->customerApplication()->exists());
    }
}