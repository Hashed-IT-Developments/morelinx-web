<?php

namespace Tests\Feature\API;

use App\Enums\InspectionStatusEnum;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerApplicationInspectionTest extends TestCase
{
    use RefreshDatabase;

    protected $town;
    protected $barangay;
    protected $district;
    protected $customerType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->town = \App\Models\Town::factory()->create();
        $this->barangay = \App\Models\Barangay::factory()->for($this->town)->create();
        $this->district = \App\Models\District::factory()->create();

        $this->customerType = CustomerType::forceCreate([
            'rate_class' => 'residential',
            'customer_type' => 'test_customer',
        ]);
    }

    /**
     * Create a customer application without triggering User factory
     */
    protected function createCustomerApplication(): CustomerApplication
    {
        return CustomerApplication::forceCreate([
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
            'district_id' => $this->district->id,
            'account_number' => 'ACC-' . time() . '-' . uniqid(),
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'middle_name' => 'M',
            'suffix' => null,
            'birth_date' => '1990-01-01',
            'nationality' => 'Filipino',
            'gender' => 'male',
            'marital_status' => 'single',
            'landmark' => 'Near Mall',
            'sitio' => 'Sitio 1',
            'unit_no' => null,
            'building' => null,
            'street' => 'Main St',
            'subdivision' => 'Subdiv',
            'block' => 'Block A',
            'route' => 'Route 1',
            'connected_load' => '10.5',
            'id_type_1' => 'Driver License',
            'id_type_2' => null,
            'id_number_1' => 'ID12345',
            'id_number_2' => null,
            'is_sc' => false,
            'sc_from' => null,
            'sc_number' => null,
            'property_ownership' => 'owned',
            'cp_last_name' => 'Contact',
            'cp_first_name' => 'Person',
            'cp_middle_name' => null,
            'cp_relation' => 'Spouse',
            'email_address' => 'test@example.com',
            'tel_no_1' => null,
            'tel_no_2' => null,
            'mobile_1' => '+639123456789',
            'mobile_2' => null,
            'sketch_lat_long' => '14.123,121.456',
            'status' => 'pending',
            'account_name' => 'Test Account',
            'trade_name' => 'Test Trade',
        ]);
    }

    public function test_it_returns_only_for_inspection_approval_records_with_an_inspector()
    {
        $user = User::forceCreate([
            'name' => 'Inspector User',
            'email' => 'inspector@example.com',
            'username' => 'inspectoruser',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        Sanctum::actingAs($user);

        $customerApplication = $this->createCustomerApplication();

        $validInspection = CustApplnInspection::forceCreate([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => $user->id,
            'customer_application_id' => $customerApplication->id,
        ]);

        $otherUser = User::forceCreate([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'username' => 'otheruser',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        CustApplnInspection::forceCreate([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => null,
            'customer_application_id' => $customerApplication->id,
        ]);

        CustApplnInspection::forceCreate([
            'status' => InspectionStatusEnum::APPROVED,
            'inspector_id' => $otherUser->id,
            'customer_application_id' => $customerApplication->id,
        ]);

        $response = $this->getJson('/api/inspections');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment([
                'id' => $validInspection->id,
                'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'customer_application' => [
                            'barangay'  => ['id', 'name'],
                            'town'      => ['id', 'name'],
                            'district'  => ['id', 'name'],
                        ]
                    ]
                ]
            ]);
    }

    public function test_it_creates_inspection_and_returns_nested_location_data()
    {
        $user = User::forceCreate([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        Sanctum::actingAs($user);

        $customerApplication = $this->createCustomerApplication();

        $payload = [
            'customer_application_id' => $customerApplication->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => $user->id,
        ];

        $response = $this->postJson('/api/inspections', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'customer_application' => [
                        'barangay' => ['id', 'name'],
                        'town' => ['id', 'name'],
                        'district' => ['id', 'name'],
                    ]
                ]
            ]);
    }

    public function test_it_updates_inspection_and_stores_multiple_materials_and_updates_timeline()
    {
        $user = User::forceCreate([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        Sanctum::actingAs($user);

        $customerApplication = $this->createCustomerApplication();

        $inspection = CustApplnInspection::forceCreate([
            'customer_application_id' => $customerApplication->id,
            'inspector_id' => $user->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
        ]);

        // Ensure timeline exists first
        $customerApplication->ageingTimeline()->create([
            'inspection_date' => now(),
        ]);

        $inspection->materialsUsed()->create([
            'material_name' => 'Old Material',
            'unit' => 'm',
            'quantity' => 1,
            'amount' => 10,
        ]);

        $payload = [
            'status' => InspectionStatusEnum::APPROVED,
            'materials' => [
                [
                    'material_item_id' => null,
                    'material_name' => 'Copper Wire #10',
                    'unit' => 'm',
                    'quantity' => 5,
                    'amount' => 20.5
                ],
                [
                    'material_item_id' => null,
                    'material_name' => 'Breaker 30A',
                    'unit' => 'pcs',
                    'quantity' => 2,
                    'amount' => 150
                ]
            ]
        ];

        $response = $this->putJson("/api/inspections/{$inspection->id}", $payload);

        $response->assertOk()
            ->assertJsonCount(3, 'data.materials')
            ->assertJsonPath('data.status', InspectionStatusEnum::APPROVED);

        // Assert timeline was updated with inspection_uploaded_to_system
        $timeline = $customerApplication->fresh()->ageingTimeline;
        $this->assertNotNull($timeline->inspection_uploaded_to_system);

        // Material assertions
        $this->assertDatabaseHas('cust_app_insp_mats', [
            'material_name' => 'Old Material',
        ]);
        $this->assertDatabaseHas('cust_app_insp_mats', [
            'material_name' => 'Copper Wire #10',
        ]);
    }

    public function test_it_updates_timeline_when_inspection_is_disapproved()
    {
        $user = User::forceCreate([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        Sanctum::actingAs($user);

        $customerApplication = $this->createCustomerApplication();

        $inspection = CustApplnInspection::forceCreate([
            'customer_application_id' => $customerApplication->id,
            'inspector_id' => $user->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
        ]);

        // Ensure timeline exists first
        $customerApplication->ageingTimeline()->create([
            'inspection_date' => now(),
        ]);

        $payload = ['status' => InspectionStatusEnum::DISAPPROVED];

        $response = $this->putJson("/api/inspections/{$inspection->id}", $payload);

        $response->assertOk()
            ->assertJsonPath('data.status', InspectionStatusEnum::DISAPPROVED);

        // Assert timeline was updated
        $timeline = $customerApplication->fresh()->ageingTimeline;
        $this->assertNotNull($timeline->inspection_uploaded_to_system);
    }
}
