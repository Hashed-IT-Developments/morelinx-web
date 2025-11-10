<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Barangay;
use App\Models\Town;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

class BarangayControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper variable to store an authenticated user.
     */
    protected User $user;

    /**
     * Set up the test environment.
     * This method is called before each test.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Create a default user and authenticate them for all tests
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    //=================================================================
    // INERTIA PAGE TESTS
    //=================================================================

    /** @test */
    public function it_can_render_the_barangay_index_page_with_barangays(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create(['name' => 'Sample Town']);
        $barangayA = Barangay::factory()->create(['name' => 'Barangay A', 'town_id' => $town->id]);
        $barangayB = Barangay::factory()->create(['name' => 'Barangay B', 'town_id' => $town->id]);

        // 2. ACT
        $response = $this->get('/addresses/barangays');

        // 3. ASSERT
        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) => $page
            ->component('miscellaneous/addresses/barangays/index')
            ->has('barangays')
            ->has('barangays.data', 2)
            ->has('barangays.data.0', fn (Assert $prop) => $prop
                ->where('id', $barangayA->id)
                ->where('name', $barangayA->name)
                ->where('townName', 'Sample Town')
                ->etc()
            )
        );
    }

    /** @test */
    public function it_can_search_for_barangays_by_barangay_name(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create();
        $barangayToFind = Barangay::factory()->create(['name' => 'FindMe', 'town_id' => $town->id]);
        $barangayToIgnore = Barangay::factory()->create(['name' => 'IgnoreMe', 'town_id' => $town->id]);

        // 2. ACT
        $response = $this->get('/addresses/barangays?search=FindMe');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('miscellaneous/addresses/barangays/index')
            ->has('barangays.data', 1)
            ->where('barangays.data.0.name', 'FindMe')
        );
    }

    /** @test */
    public function it_can_search_for_barangays_by_town_name(): void
    {
        // 1. ARRANGE
        $townA = Town::factory()->create(['name' => 'TownToFind']);
        $townB = Town::factory()->create(['name' => 'TownToIgnore']);

        $barangayA = Barangay::factory()->create(['name' => 'Barangay A', 'town_id' => $townA->id]);
        $barangayB = Barangay::factory()->create(['name' => 'Barangay B', 'town_id' => $townB->id]);

        // 2. ACT
        $response = $this->get('/addresses/barangays?search=TownToFind');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('miscellaneous/addresses/barangays/index')
            ->has('barangays.data', 1)
            ->where('barangays.data.0.townName', 'TownToFind')
        );
    }

    /** @test */
    public function it_can_store_a_new_barangay(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create();
        $barangayData = [
            'town_id' => $town->id,
            'barangays' => [
                ['name' => 'New Barangay', 'barangay_alias' => 'NBA'],
            ],
        ];

        // 2. ACT
        $response = $this->post('/addresses/barangays', $barangayData);

        // 3. ASSERT
        $response->assertStatus(302);
        $response->assertRedirect();
        $response->assertSessionHas('success', 'Barangay created successfully!');

        $this->assertDatabaseHas('barangays', [
            'name' => 'New Barangay',
            'town_id' => $town->id,
            'barangay_alias' => 'NBA',
        ]);
    }

    /** @test */
    public function it_can_store_multiple_new_barangays(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create();
        $barangayData = [
            'town_id' => $town->id,
            'barangays' => [
                ['name' => 'Barangay One', 'barangay_alias' => 'BO1'],
                ['name' => 'Barangay Two', 'barangay_alias' => 'BT2'],
            ],
        ];

        // 2. ACT
        $response = $this->post('/addresses/barangays', $barangayData);

        // 3. ASSERT
        $response->assertRedirect();
        $response->assertSessionHas('success', '2 barangays created successfully!');
        $this->assertDatabaseCount('barangays', 2);
        $this->assertDatabaseHas('barangays', ['name' => 'Barangay One']);
        $this->assertDatabaseHas('barangays', ['name' => 'Barangay Two']);
    }

    /** @test */
    public function store_validates_for_a_unique_barangay_alias(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create();
        Barangay::factory()->create(['barangay_alias' => 'ABC', 'town_id' => $town->id]);

        $barangayData = [
            'town_id' => $town->id,
            'barangays' => [
                ['name' => 'New Barangay', 'barangay_alias' => 'ABC'],
            ],
        ];

        // 2. ACT
        $response = $this->from('/addresses/barangays')
                         ->post('/addresses/barangays', $barangayData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/barangays');
        $response->assertSessionHasErrors('barangays.0.barangay_alias');
        $this->assertDatabaseCount('barangays', 1);
    }

    /** @test */
    public function store_validates_required_fields(): void
    {
        // 1. ARRANGE
        $barangayData = [
            'town_id' => null,
            'barangays' => [],
        ];

        // 2. ACT
        $response = $this->from('/addresses/barangays')
                         ->post('/addresses/barangays', $barangayData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/barangays');
        $response->assertSessionHasErrors(['town_id', 'barangays']);
    }

    /** @test */
    public function it_can_update_a_barangay(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create();
        $otherTown = Town::factory()->create();
        $barangay = Barangay::factory()->create([
            'town_id' => $town->id,
            'name' => 'Old Name',
            'barangay_alias' => 'OLD'
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'town_id' => $otherTown->id,
            'barangay_alias' => 'UPD',
        ];

        // 2. ACT
        $response = $this->put('/addresses/barangays/' . $barangay->id, $updateData);

        // 3. ASSERT
        $response->assertRedirect();
        $response->assertSessionHas('success', 'Barangay updated successfully!');

        $this->assertDatabaseHas('barangays', [
            'id' => $barangay->id,
            'name' => 'Updated Name',
            'town_id' => $otherTown->id,
            'barangay_alias' => 'UPD',
        ]);
    }

    /** @test */
    public function update_validates_for_unique_barangay_alias_excluding_self(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create();
        $barangayA = Barangay::factory()->create(['barangay_alias' => 'AAA', 'town_id' => $town->id]);
        $barangayB = Barangay::factory()->create(['barangay_alias' => 'BBB', 'town_id' => $town->id]);

        // 2. ACT
        $response = $this->from('/addresses/barangays')
                         ->put('/addresses/barangays/' . $barangayB->id, [
                            'name' => $barangayB->name,
                            'town_id' => $barangayB->town_id,
                            'barangay_alias' => 'AAA',
                         ]);

        // 3. ASSERT
        $response->assertRedirect('/addresses/barangays');
        $response->assertSessionHasErrors('barangay_alias');
        $this->assertDatabaseHas('barangays', [
            'id' => $barangayB->id,
            'barangay_alias' => 'BBB'
        ]);
    }

    /** @test */
    public function update_allows_keeping_same_alias(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create();
        $barangay = Barangay::factory()->create([
            'name' => 'Test Barangay',
            'barangay_alias' => 'TST',
            'town_id' => $town->id
        ]);

        // 2. ACT - Update name but keep same alias
        $response = $this->put('/addresses/barangays/' . $barangay->id, [
            'name' => 'Updated Test Barangay',
            'town_id' => $town->id,
            'barangay_alias' => 'TST', // Same alias
        ]);

        // 3. ASSERT
        $response->assertRedirect();
        $response->assertSessionHas('success', 'Barangay updated successfully!');
        $this->assertDatabaseHas('barangays', [
            'id' => $barangay->id,
            'name' => 'Updated Test Barangay',
            'barangay_alias' => 'TST',
        ]);
    }

    //=================================================================
    // API (JSON) TESTS
    //=================================================================

    /** @test */
    public function check_barangay_alias_returns_available_for_new_alias(): void
    {
        // 2. ACT
        $response = $this->getJson('/addresses/check-barangay-alias?barangay_alias=NEW');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }

    /** @test */
    public function check_barangay_alias_returns_not_available_for_taken_alias(): void
    {
        // 1. ARRANGE
        Barangay::factory()->create(['barangay_alias' => 'TAKEN']);

        // 2. ACT
        $response = $this->getJson('/addresses/check-barangay-alias?barangay_alias=TAKEN');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => false]);
    }

    /** @test */
    public function check_barangay_alias_returns_available_when_checking_own_alias(): void
    {
        // 1. ARRANGE
        $barangay = Barangay::factory()->create(['barangay_alias' => 'MINE']);

        // 2. ACT
        $url = '/addresses/check-barangay-alias?barangay_alias=MINE&barangay_id=' . $barangay->id;
        $response = $this->getJson($url);

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }

    /** @test */
    public function check_barangay_alias_returns_available_when_no_alias_provided(): void
    {
        // 2. ACT
        $response = $this->getJson('/addresses/check-barangay-alias');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }
}
