<?php

namespace Tests\Feature\API;

use App\Models\Barangay;
use App\Models\CustomerApplication;
use App\Models\CustomerEnergization;
use App\Models\CustomerType;
use App\Models\District;
use App\Models\Town;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerEnergizationApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected CustomerApplication $customerApplication;
    protected User $teamUser;
    protected Barangay $barangay;
    protected District $district;
    protected CustomerType $customerType;
    protected Town $town;

    protected function setUp(): void
    {
        parent::setUp();

        $this->town = Town::factory()->create();
        $this->barangay = Barangay::factory()->create(['town_id' => $this->town->id]);
        $this->district = District::factory()->create();
        $this->customerType = CustomerType::factory()->create();

        $this->customerApplication = CustomerApplication::factory()
            ->for($this->customerType)
            ->create([
                'barangay_id' => $this->barangay->id,
                'district_id' => $this->district->id,
                'customer_type_id' => $this->customerType->id,
            ]);

        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);

        $this->teamUser = User::factory()->create(['name' => 'Team User']);
    }

    public function test_it_can_list_all_customer_energizations()
    {
        foreach (range(1, 5) as $i) {
            $this->createCustomerEnergization([
                'service_connection' => "Connection $i",
                'team_assigned' => $this->user->id,
            ]);
        }

        // Act
        $response = $this->getJson('/api/customer-energizations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [ '*' => $this->getEnergizationJsonStructure() ]
            ])
            ->assertJsonCount(5, 'data');
    }

    public function test_it_can_create_a_customer_energization()
    {
        // Arrange
        $data = [
            'customer_application_id' => $this->customerApplication->id,
            'status' => 'pending',
            'team_assigned' => $this->teamUser->id,
            'service_connection' => 'Temporary',
            'action_taken' => 'Installation',
            'remarks' => 'Test remarks',
            'time_of_arrival' => now()->toDateTimeString(),
            'date_installed' => now()->toDateTimeString(),
            'transformer_owned' => 'Company Owned',
            'transformer_rating' => '15 kVA',
            'ct_serial_number' => 'CT123456',
            'ct_brand_name' => 'Brand A',
            'ct_ratio' => '100:5',
            'pt_serial_number' => 'PT123456',
            'pt_brand_name' => 'Brand B',
            'pt_ratio' => '10:1',
            'team_executed' => $this->teamUser->id,
            'archive' => false,
        ];

        // Act
        $response = $this->postJson('/api/customer-energizations', $data);

        // Assert
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => $this->getEnergizationJsonStructure()
            ])
            ->assertJsonPath('data.service_connection', 'Temporary');

        $this->assertDatabaseHas('customer_energizations', [
            'customer_application_id' => $this->customerApplication->id,
            'service_connection' => 'Temporary',
        ]);
    }

    public function test_it_fails_to_create_with_invalid_data()
    {
        // Act - missing required fields
        $response = $this->postJson('/api/customer-energizations', []);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['customer_application_id']);
    }

    public function test_it_can_show_a_single_energization()
    {
        // Arrange
        $energization = $this->createCustomerEnergization();

        // Act
        $response = $this->getJson("/api/customer-energizations/{$energization->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => $this->getEnergizationJsonStructure()
            ])
            ->assertJsonPath('data.id', $energization->id);
    }

    public function test_it_can_update_an_energization()
    {
        // Arrange
        $energization = $this->createCustomerEnergization([
            'status' => 'pending',
        ]);

        $updateData = [
            'status' => 'completed',
            'remarks' => 'Updated remarks',
        ];

        // Act
        $response = $this->putJson("/api/customer-energizations/{$energization->id}", $updateData);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.remarks', 'Updated remarks');

        $this->assertDatabaseHas('customer_energizations', [
            'id' => $energization->id,
            'status' => 'completed',
        ]);
    }

    public function test_it_can_delete_an_energization()
    {
        // Arrange
        $energization = $this->createCustomerEnergization();

        // Act
        $response = $this->deleteJson("/api/customer-energizations/{$energization->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customer Energization deleted.'
            ]);

        $this->assertDatabaseMissing('customer_energizations', [
            'id' => $energization->id
        ]);
    }

    public function test_it_loads_customer_application_relationship()
    {
        // Arrange
        $energization = $this->createCustomerEnergization([
            'customer_application_id' => $this->customerApplication->id,
            'team_assigned' => null, // Optional: ensure no team interference
            'team_executed' => null,
        ]);

        // Act
        $response = $this->getJson("/api/customer-energizations/{$energization->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.customer_application.id', $this->customerApplication->id)
            ->assertJsonPath('data.customer_application.first_name', $this->customerApplication->first_name);
    }

    public function test_it_loads_all_nested_relationships()
    {
        // Arrange
        $energization = $this->createCustomerEnergization([
            'customer_application_id' => $this->customerApplication->id,
            'team_assigned' => $this->teamUser->id,
            'team_executed' => $this->teamUser->id,
        ]);

        // Act
        $response = $this->getJson("/api/customer-energizations/{$energization->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.customer_application.id', $this->customerApplication->id)
            ->assertJsonPath('data.assigned_team.id', $this->teamUser->id)
            ->assertJsonPath('data.executing_team.id', $this->teamUser->id);
    }

    private function createCustomerApplication(array $overrides = []): CustomerApplication
    {
        return CustomerApplication::factory()->create(array_merge([
            'barangay_id' => $this->barangay->id,
            'district_id' => $this->district->id,
            'customer_type_id' => $this->customerType->id,
        ], $overrides));
    }

    private function createCustomerEnergization(array $overrides = []): CustomerEnergization
    {
        return CustomerEnergization::factory()->create(array_merge([
            'customer_application_id' => $this->customerApplication->id,
            'team_assigned' => $this->teamUser->id,
            'team_executed' => $this->teamUser->id,
        ], $overrides));
    }

    private function getEnergizationJsonStructure(): array
    {
        return [
            'id', 'status', 'assigned_team', 'executing_team',
            'service_connection', 'action_taken', 'remarks',
            'time_of_arrival', 'date_installed', 'transformer_owned',
            'transformer_rating', 'ct_serial_number', 'ct_brand_name',
            'ct_ratio', 'pt_serial_number', 'pt_brand_name', 'pt_ratio',
            'archive', 'created_at', 'updated_at',
            'customer_application' => $this->getCustomerApplicationStructure(),
        ];
    }

    private function getCustomerApplicationStructure(): array
    {
        return [
            'id', 'account_number', 'first_name', 'last_name',
            'middle_name', 'suffix', 'birth_date', 'nationality',
            'gender', 'marital_status', 'barangay_id', 'landmark',
            'sitio', 'unit_no', 'building', 'street', 'subdivision',
            'district_id', 'block', 'route', 'customer_type_id',
            'customer_type' => ['id', 'rate_class', 'customer_type'],
            'connected_load', 'id_type_1', 'id_type_2', 'id_number_1',
            'id_number_2', 'is_sc', 'sc_from', 'sc_number',
            'property_ownership', 'cp_last_name', 'cp_first_name',
            'cp_middle_name', 'cp_relation', 'email_address', 'tel_no_1',
            'tel_no_2', 'mobile_1', 'mobile_2', 'sketch_lat_long',
            'status', 'account_name', 'trade_name',
            'c_peza_registered_activity', 'cor_number', 'tin_number',
            'cg_vat_zero_tag', 'created_at', 'updated_at'
        ];
    }
}
