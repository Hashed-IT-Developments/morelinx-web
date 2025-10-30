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
}
