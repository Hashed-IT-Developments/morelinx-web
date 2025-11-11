<?php

namespace Tests\Feature\API;

use App\Enums\InspectionStatusEnum;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerApplicationInspectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_only_for_inspection_approval_records_with_an_inspector()
    {
        //Authenticate user
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        //Create related models
        $customerApplication = CustomerApplication::factory()
            ->for(CustomerType::factory())
            ->create();

        //Records that should appear
        $validInspection = CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => $user->id,
            'customer_application_id' => $customerApplication->id,
        ]);

        //Records that should NOT appear
        CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            'inspector_id' => null,
        ]);

        //Records with another status
        CustApplnInspection::factory()->create([
            'status' => InspectionStatusEnum::APPROVED,
            'inspector_id' => $user->id,
        ]);

        $response = $this->getJson('/api/inspections');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Inspections retrieved.',
            ])
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment([
                'id' => $validInspection->id,
                'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            ]);
    }

    public function test_it_updates_inspection_and_stores_multiple_materials()
    {
        $this->withoutExceptionHandling();

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

        // Existing materials (should be kept)
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
            ->assertJson([
                'success' => true,
                'message' => 'Inspection status updated.',
            ])
            ->assertJsonCount(3, 'data.materials')  // Updated
            ->assertJsonPath('data.status', InspectionStatusEnum::APPROVED);

        // Old material should exist
        $this->assertDatabaseHas('cust_app_insp_mats', [
            'cust_appln_inspection_id' => $inspection->id,
            'material_name' => 'Old Material',
        ]);

        // New materials exist
        $this->assertDatabaseHas('cust_app_insp_mats', [
            'cust_appln_inspection_id' => $inspection->id,
            'material_name' => 'Copper Wire #10',
            'quantity' => 5,
            'amount' => 20.5,
        ]);

        $this->assertDatabaseHas('cust_app_insp_mats', [
            'cust_appln_inspection_id' => $inspection->id,
            'material_name' => 'Breaker 30A',
            'quantity' => 2,
            'amount' => 150,
        ]);
    }
}
