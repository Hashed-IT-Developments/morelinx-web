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

    protected function setUp(): void
    {
        parent::setUp();

        $this->town = \App\Models\Town::factory()->create();
        $this->barangay = \App\Models\Barangay::factory()->for($this->town)->create();
        $this->district = \App\Models\District::factory()->create();
    }

    public function test_it_returns_only_for_inspection_approval_records_with_an_inspector()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $town = \App\Models\Town::factory()->create();
        $barangay = \App\Models\Barangay::factory()->for($town)->create();
        $district = \App\Models\District::factory()->create();

        $customerApplication = CustomerApplication::factory()
            ->for(CustomerType::factory())
            ->for($this->barangay)
            ->for($this->district)
            ->create();

        $validInspection = CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => $user->id,
            'customer_application_id' => $customerApplication->id,
        ]);

        CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => null,
        ]);

        CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::APPROVED,
            'inspector_id' => $user->id,
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
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $customerApplication = CustomerApplication::factory()
            ->for(CustomerType::factory())
            ->for($this->barangay)
            ->for($this->district)
            ->create();

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

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $customerApplication = CustomerApplication::factory()
            ->for(CustomerType::factory())
            ->create();

        $inspection = CustApplnInspection::factory()->create([
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
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $customerApplication = CustomerApplication::factory()
            ->for(CustomerType::factory())
            ->create();

        $inspection = CustApplnInspection::factory()->create([
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
