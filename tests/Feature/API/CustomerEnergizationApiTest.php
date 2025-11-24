<?php

namespace Tests\Feature\API;

use App\Models\AgeingTimeline;
use App\Models\Barangay;
use App\Models\CustomerApplication;
use App\Models\CustomerEnergization;
use App\Models\CustomerType;
use App\Models\District;
use App\Models\Town;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerEnergizationApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected User $otherUser;
    protected CustomerApplication $customerApplication;
    protected User $teamUser;
    protected Barangay $barangay;
    protected District $district;
    protected CustomerType $customerType;
    protected Town $town;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public'); // Fake storage for all tests

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
        $this->otherUser = User::factory()->create(['name' => 'Other User']);
        $this->teamUser = User::factory()->create(['name' => 'Team User']);

        Sanctum::actingAs($this->user);
    }

    public function test_it_can_list_customer_energizations_assigned_to_authenticated_user_only()
    {
        // Create 3 energizations assigned to the auth user
        foreach (range(1, 3) as $i) {
            $this->createCustomerEnergization([
                'service_connection' => "Connection $i",
                'team_assigned_id' => $this->user->id,
            ]);
        }

        // Create 2 energizations assigned to another user
        foreach (range(1, 2) as $i) {
            $this->createCustomerEnergization([
                'service_connection' => "Other Connection $i",
                'team_assigned_id' => $this->otherUser->id,
            ]);
        }

        $response = $this->getJson('/api/customer-energizations');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJson([
                'success' => true,
                'message' => 'Customer Energizations retrieved.'
            ]);
    }

    public function test_it_returns_empty_list_when_no_energizations_assigned()
    {
        // Create energization assigned to another user
        $this->createCustomerEnergization([
            'team_assigned_id' => $this->otherUser->id,
        ]);

        $response = $this->getJson('/api/customer-energizations');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_it_can_create_a_customer_energization_with_attachments()
    {
        $data = $this->getValidEnergizationData([
            'team_assigned_id' => $this->teamUser->id,
        ]);

        // Add attachments
        $data['attachments'] = [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg'),
        ];

        $response = $this->postJson('/api/customer-energizations', $data);

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

        // Verify attachments were stored in storage
        $energization = CustomerEnergization::first();
        $this->assertIsArray($energization->attachments);
        $this->assertCount(2, $energization->attachments);

        // Check that files exist in storage
        foreach ($energization->attachments as $path) {
            Storage::disk('public')->assertExists($path);
        }
    }

    public function test_it_can_create_energization_without_attachments()
    {
        $data = $this->getValidEnergizationData([
            'team_assigned_id' => $this->teamUser->id,
        ]);

        $response = $this->postJson('/api/customer-energizations', $data);

        $response->assertStatus(201);

        $energization = CustomerEnergization::first();
        $this->assertNull($energization->attachments);
    }

    public function test_it_fails_to_create_with_invalid_customer_application_id()
    {
        $data = $this->getValidEnergizationData([
            'customer_application_id' => 99999, // Non-existent ID
        ]);

        $response = $this->postJson('/api/customer-energizations', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['customer_application_id']);
    }

    public function test_it_can_show_a_single_energization()
    {
        $energization = $this->createCustomerEnergization([
            'team_assigned_id' => $this->user->id,
        ]);

        $response = $this->getJson("/api/customer-energizations/{$energization->id}");

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
        $energization = $this->createCustomerEnergization([
            'status' => 'pending',
            'team_assigned_id' => $this->user->id,
        ]);

        $updateData = [
            'status' => 'completed',
            'remarks' => 'Updated remarks',
        ];

        $response = $this->putJson("/api/customer-energizations/{$energization->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.remarks', 'Updated remarks');

        $this->assertDatabaseHas('customer_energizations', [
            'id' => $energization->id,
            'status' => 'completed',
            'remarks' => 'Updated remarks',
        ]);
    }

    public function test_it_can_update_energization_with_new_attachments()
    {
        $energization = $this->createCustomerEnergization([
            'team_assigned_id' => $this->user->id,
            'attachments' => ['existing-file.jpg'],
        ]);

        $updateData = [
            'status' => 'completed',
            'attachments' => [
                UploadedFile::fake()->image('new-photo.jpg'),
            ],
        ];

        $response = $this->putJson("/api/customer-energizations/{$energization->id}", $updateData);

        $response->assertStatus(200);

        $energization->refresh();
        $this->assertIsArray($energization->attachments);
        $this->assertCount(1, $energization->attachments);

        // Verify file was stored in the attachments directory
        $this->assertStringContainsString('attachments/', $energization->attachments[0]);
        Storage::disk('public')->assertExists($energization->attachments[0]);
    }

    public function test_it_can_delete_an_energization()
    {
        $energization = $this->createCustomerEnergization([
            'team_assigned_id' => $this->user->id,
        ]);

        $response = $this->deleteJson("/api/customer-energizations/{$energization->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customer Energization deleted.'
            ]);

        $this->assertDatabaseMissing('customer_energizations', [
            'id' => $energization->id
        ]);
    }

    public function test_it_loads_customer_application_relationship_with_nested_data()
    {
        $energization = $this->createCustomerEnergization([
            'customer_application_id' => $this->customerApplication->id,
            'team_assigned_id' => $this->user->id,
            'team_executed_id' => $this->teamUser->id,
        ]);

        $response = $this->getJson("/api/customer-energizations/{$energization->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.customer_application.id', $this->customerApplication->id)
            ->assertJsonPath('data.customer_application.first_name', $this->customerApplication->first_name)
            ->assertJsonPath('data.customer_application.customer_type.id', $this->customerType->id)
            ->assertJsonPath('data.assigned_team.id', $this->user->id)
            ->assertJsonPath('data.executing_team.id', $this->teamUser->id);
    }

    public function test_it_can_mark_installation_as_downloaded()
    {
        $energization = $this->createCustomerEnergization([
            'team_assigned_id' => $this->user->id,
        ]);

        $response = $this->postJson("/api/customer-energizations/{$energization->id}/download");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Installation marked as downloaded.'
            ]);

        $this->assertDatabaseHas('ageing_timelines', [
            'customer_application_id' => $energization->customer_application_id,
            'downloaded_to_lineman' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    public function test_it_updates_downloaded_timestamp_if_ageing_timeline_already_exists()
    {
        $energization = $this->createCustomerEnergization([
            'team_assigned_id' => $this->user->id,
        ]);

        // Create existing timeline
        AgeingTimeline::create([
            'customer_application_id' => $energization->customer_application_id,
            'downloaded_to_lineman' => now()->subDays(5),
        ]);

        $response = $this->postJson("/api/customer-energizations/{$energization->id}/download");

        $response->assertStatus(200);

        // Verify timestamp was updated
        $timeline = AgeingTimeline::where('customer_application_id', $energization->customer_application_id)->first();
        $this->assertEqualsWithDelta(now()->timestamp, $timeline->downloaded_to_lineman->timestamp, 5);
    }

    public function test_it_validates_file_uploads_are_images_or_documents()
    {
        $data = $this->getValidEnergizationData([
            'team_assigned_id' => $this->user->id,
        ]);

        // Add invalid file type
        $data['attachments'] = [
            UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
        ];

        $response = $this->postJson('/api/customer-energizations', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['attachments.0']);
    }

   private function getValidEnergizationData(array $overrides = []): array
    {
        return array_merge([
            'customer_application_id' => $this->customerApplication->id,
            'status' => 'pending',
            'team_assigned_id' => $this->teamUser->id,
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
            'team_executed_id' => $this->teamUser->id,
            'archive' => false,
        ], $overrides);
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
            'team_assigned_id' => $this->teamUser->id,
            'team_executed_id' => $this->teamUser->id,
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
