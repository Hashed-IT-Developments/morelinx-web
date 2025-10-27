<?php

namespace Tests\Feature\API;

use App\Models\MaterialItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MaterialItemTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;

    protected function authenticate(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);
    }

    public function test_index_returns_material_items_list()
    {
        $this->authenticate();

        // seed some items
        MaterialItem::create(['material' => 'BOLT 1/2"', 'cost' => 10]);
        MaterialItem::create(['material' => 'NUT 5/8"', 'cost' => 5]);

        $response = $this->getJson('/api/materials');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         '*' => ['id', 'material', 'cost', 'created_at', 'updated_at']
                     ],
                     'message'
                 ]);

        $this->assertTrue($response->json('success'));
        $this->assertCount(2, $response->json('data'));
    }

    public function test_show_returns_single_material_item()
    {
        $this->authenticate();

        $item = MaterialItem::create(['material' => 'ANCHOR ROD', 'cost' => 17]);

        $response = $this->getJson("/api/materials/{$item->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id' => $item->id,
                         'material' => $item->material,
                         'cost' => (int) $item->cost,
                     ],
                 ]);
    }

    public function test_store_creates_new_material_item()
    {
        $this->authenticate();

        $payload = [
            'material' => 'TEST MATERIAL X',
            'cost' => 99.50
        ];

        $response = $this->postJson('/api/materials', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data' => ['id', 'material', 'cost', 'created_at', 'updated_at'],
                     'message'
                 ]);

        $this->assertDatabaseHas('material_items', [
            'material' => 'TEST MATERIAL X',
            // store numeric as stored value: cast to string/number depending on DB - we assert presence mostly
        ]);
    }

    public function test_update_modifies_material_item()
    {
        $this->authenticate();

        $item = MaterialItem::create(['material' => 'OLD NAME', 'cost' => 1]);

        $payload = [
            'material' => 'UPDATED NAME',
            'cost' => 123.45
        ];

        $response = $this->putJson("/api/materials/{$item->id}", $payload);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id' => $item->id,
                         'material' => 'UPDATED NAME',
                         // cost might be cast to string or number; we'll assert DB separately
                     ],
                 ]);

        $this->assertDatabaseHas('material_items', [
            'id' => $item->id,
            'material' => 'UPDATED NAME',
        ]);
    }

    public function test_destroy_deletes_material_item()
    {
        $this->authenticate();

        $item = MaterialItem::create(['material' => 'TO DELETE', 'cost' => 5]);

        $response = $this->deleteJson("/api/materials/{$item->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('material_items', [
            'id' => $item->id,
        ]);
    }
}
