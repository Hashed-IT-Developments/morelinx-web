<?php

namespace Tests\Feature\API;

use App\Models\CustomerApplication;
use App\Models\Meter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MeterApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected CustomerApplication $customerApplication;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
        $this->customerApplication = CustomerApplication::factory()->create();
    }

    public function test_it_can_list_meters_with_relationships()
    {
        Meter::factory()->count(3)->create([
            'customer_application_id' => $this->customerApplication->id,
        ]);

        $response = $this->getJson('/api/meters');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'success',
                'data' => ['*' => [
                    'id',
                    'account_number',
                    'meter_serial_number',
                    'meter_brand',
                    'customer_application' => [
                        'id',
                        'first_name',
                        'customer_type' => ['id', 'rate_class', 'customer_type']
                    ],
                    'created_at',
                    'updated_at',
                ]],
                'message'
            ]);
    }

    public function test_it_can_create_meter_with_valid_data()
    {
        $data = [
            'customer_application_id' => $this->customerApplication->id,
            'meter_serial_number' => 'MTR-' . fake()->unique()->numerify('######'),
            'meter_brand' => 'Siemens',
            'voltage' => 220.00,
            'initial_reading' => 1000.00,
        ];

        $response = $this->postJson('/api/meters', $data);

        $response->assertCreated()
            ->assertJsonFragment(['success' => true, 'message' => 'Meter created.']);

        $this->assertDatabaseHas('meters', [
            'meter_serial_number' => $data['meter_serial_number'],
            'customer_application_id' => $this->customerApplication->id,
        ]);
    }

    public function test_it_can_show_meter()
    {
        $meter = Meter::factory()->create([
            'customer_application_id' => $this->customerApplication->id,
        ]);

        $response = $this->getJson("/api/meters/{$meter->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $meter->id)
            ->assertJsonPath('data.customer_application.id', $this->customerApplication->id);
    }

    public function test_it_can_update_meter()
    {
        $meter = Meter::factory()->create([
            'meter_serial_number' => 'MTR-123456',
            'customer_application_id' => $this->customerApplication->id,
        ]);

        $updateData = [
            'customer_application_id' => $this->customerApplication->id,
            'meter_serial_number' => 'MTR-123456',
            'meter_brand' => 'GE',
            'voltage' => 440.50,
        ];

        $response = $this->putJson("/api/meters/{$meter->id}", $updateData);

        $response->assertOk()
            ->assertJsonPath('data.meter_brand', 'GE');

        $this->assertDatabaseHas('meters', [
            'id' => $meter->id,
            'meter_brand' => 'GE',
        ]);
    }

    public function test_it_can_delete_meter()
    {
        $meter = Meter::factory()->create([
            'customer_application_id' => $this->customerApplication->id,
        ]);

        $response = $this->deleteJson("/api/meters/{$meter->id}");

        $response->assertOk()
            ->assertJson(['success' => true, 'message' => 'Meter deleted.']);

        $this->assertDatabaseMissing('meters', ['id' => $meter->id]);
    }
}
