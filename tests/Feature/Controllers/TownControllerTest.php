<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Town;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TownControllerTest extends TestCase
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

        // Set the default du_tag for tests, as the controller uses it
        config(['app.du_tag' => 'TEST_DU']);
    }

    //=================================================================
    // INERTIA PAGE TESTS
    //=================================================================

    /** @test */
    public function it_can_render_the_town_index_page_with_towns(): void
    {
        // 1. ARRANGE
        $townA = Town::factory()->create(['name' => 'Town A']);
        $townB = Town::factory()->create(['name' => 'Town B']);

        // 2. ACT
        $response = $this->get('/addresses/towns');

        // 3. ASSERT
        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) => $page
            ->component('miscellaneous/addresses/towns/index')
            ->has('towns')
            ->has('towns.data', 2)
            ->has('towns.data.0', fn (Assert $prop) => $prop
                ->where('id', $townA->id)
                ->where('name', $townA->name)
                ->etc()
            )
        );
    }

    /** @test */
    public function it_can_search_for_towns_by_name(): void
    {
        // 1. ARRANGE
        Town::factory()->create(['name' => 'FindMe']);
        Town::factory()->create(['name' => 'IgnoreMe']);

        // 2. ACT
        $response = $this->get('/addresses/towns?search=FindMe');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('miscellaneous/addresses/towns/index')
            ->has('towns.data', 1)
            ->where('towns.data.0.name', 'FindMe')
        );
    }

    /** @test */
    public function it_can_search_for_towns_by_feeder(): void
    {
        // 1. ARRANGE
        Town::factory()->create(['name' => 'Town A', 'feeder' => 'Feeder-01']);
        Town::factory()->create(['name' => 'Town B', 'feeder' => 'Feeder-02']);

        // 2. ACT
        $response = $this->get('/addresses/towns?search=Feeder-01');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('miscellaneous/addresses/towns/index')
            ->has('towns.data', 1)
            ->where('towns.data.0.feeder', 'Feeder-01')
        );
    }

    /** @test */
    public function it_can_search_for_towns_by_du_tag(): void
    {
        // 1. ARRANGE
        Town::factory()->create(['name' => 'Town A', 'du_tag' => 'TAG-A']);
        Town::factory()->create(['name' => 'Town B', 'du_tag' => 'TAG-B']);

        // 2. ACT
        $response = $this->get('/addresses/towns?search=TAG-A');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('miscellaneous/addresses/towns/index')
            ->has('towns.data', 1)
            ->where('towns.data.0.du_tag', 'TAG-A')
        );
    }

    //=================================================================
    // CRUD TESTS
    //=================================================================

    /** @test */
    public function it_can_store_a_new_town(): void
    {
        // 1. ARRANGE
        $townData = [
            'name' => 'New Town',
            'feeder' => 'Feeder-03',
            'town_alias' => 'NWT',
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')->post('/addresses/towns', $townData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHas('success', 'Town created successfully!');

        $this->assertDatabaseHas('towns', [
            'name' => 'New Town',
            'feeder' => 'Feeder-03',
            'town_alias' => 'NWT',
            'du_tag' => 'TEST_DU', // From setUp config
        ]);
    }

    /** @test */
    public function store_validates_required_fields(): void
    {
        // 1. ARRANGE
        $townData = [
            'name' => null,
            'feeder' => null,
            'town_alias' => null,
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')->post('/addresses/towns', $townData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHasErrors(['name', 'feeder', 'town_alias']);
    }

    /** @test */
    public function store_validates_for_a_unique_town_alias(): void
    {
        // 1. ARRANGE
        Town::factory()->create(['town_alias' => 'ABC']);

        $townData = [
            'name' => 'New Town',
            'feeder' => 'Feeder-03',
            'town_alias' => 'ABC', // Not unique
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')->post('/addresses/towns', $townData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHasErrors('town_alias');
        $this->assertDatabaseCount('towns', 1);
    }

    /** @test */
    public function it_can_update_a_town(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create([
            'name' => 'Old Name',
            'feeder' => 'Old Feeder',
            'town_alias' => 'OLD'
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'feeder' => 'Updated Feeder',
            'town_alias' => 'UPD',
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')
                        ->put('/addresses/towns/' . $town->id, $updateData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHas('success', 'Town updated successfully!');

        $this->assertDatabaseHas('towns', [
            'id' => $town->id,
            'name' => 'Updated Name',
            'feeder' => 'Updated Feeder',
            'town_alias' => 'UPD',
        ]);
    }

    /** @test */
    public function update_validates_for_unique_town_alias_excluding_self(): void
    {
        // 1. ARRANGE
        $townA = Town::factory()->create(['town_alias' => 'AAA']);
        $townB = Town::factory()->create(['town_alias' => 'BBB']);

        $updateData = [
            'name' => $townB->name,
            'feeder' => $townB->feeder,
            'town_alias' => 'AAA', // Taken by townA
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')
                        ->put('/addresses/towns/' . $townB->id, $updateData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHasErrors('town_alias');

        $this->assertDatabaseHas('towns', [
            'id' => $townB->id,
            'town_alias' => 'BBB' // Unchanged
        ]);
    }

    /** @test */
    public function update_allows_keeping_same_alias(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create([
            'name' => 'Test Town',
            'town_alias' => 'TST',
        ]);

        $updateData = [
            'name' => 'Updated Test Town',
            'feeder' => $town->feeder,
            'town_alias' => 'TST', // Same alias
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')
                        ->put('/addresses/towns/' . $town->id, $updateData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHas('success', 'Town updated successfully!');

        $this->assertDatabaseHas('towns', [
            'id' => $town->id,
            'name' => 'Updated Test Town',
            'town_alias' => 'TST',
        ]);
    }

    //=================================================================
    // API (JSON) TESTS
    //=================================================================

    /** @test */
    public function check_town_alias_returns_available_for_new_alias(): void
    {
        // 2. ACT
        $response = $this->getJson('/addresses/check-town-alias?town_alias=NEW');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }

    /** @test */
    public function check_town_alias_returns_not_available_for_taken_alias(): void
    {
        // 1. ARRANGE
        Town::factory()->create(['town_alias' => 'TAKEN']);

        // 2. ACT
        $response = $this->getJson('/addresses/check-town-alias?town_alias=TAKEN');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => false]);
    }

    /** @test */
    public function check_town_alias_returns_available_when_checking_own_alias(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create(['town_alias' => 'MINE']);

        // 2. ACT
        $url = '/addresses/check-town-alias?town_alias=MINE&town_id=' . $town->id;
        $response = $this->getJson($url);

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }

    /** @test */
    public function check_town_alias_returns_available_when_no_alias_provided(): void
    {
        // 2. ACT
        $response = $this->getJson('/addresses/check-town-alias');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }

    //=================================================================
    // IMPORT/EXPORT TESTS
    //=================================================================

    /** @test */
    public function it_can_export_towns_and_barangays(): void
    {
        // 1. ARRANGE
        Excel::fake();
        Town::factory()->count(3)->create();

        // 2. ACT
        $response = $this->get('/addresses/towns/export');

        // 3. ASSERT
        $response->assertStatus(200);
        Excel::assertDownloaded('towns_and_barangays.xlsx');
    }

    /** @test */
    public function import_validates_for_a_file(): void
    {
        // 2. ACT
        $response = $this->from('/addresses/towns')
                        ->post('/addresses/towns/import', [
                            'file' => null,
                        ]);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHasErrors('file');
    }
}
