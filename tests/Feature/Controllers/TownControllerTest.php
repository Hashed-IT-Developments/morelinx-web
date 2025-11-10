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
use PHPUnit\Framework\Attributes\Test;

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

    #[Test]
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

    #[Test]
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

    #[Test]
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

    #[Test]
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

    #[Test]
    public function it_can_store_a_new_town(): void
    {
        // 1. ARRANGE
        $townData = [
            'name' => 'New Town',
            'feeder' => 'Feeder-03',
            'alias' => 'NWT',
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')->post('/addresses/towns', $townData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHas('success', 'Town created successfully!');

        $this->assertDatabaseHas('towns', [
            'name' => 'New Town',
            'feeder' => 'Feeder-03',
            'alias' => 'NWT',
            'du_tag' => 'TEST_DU', // From setUp config
        ]);
    }

    #[Test]
    public function store_validates_required_fields(): void
    {
        // 1. ARRANGE
        $townData = [
            'name' => null,
            'feeder' => null,
            'alias' => null,
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')->post('/addresses/towns', $townData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHasErrors(['name', 'feeder', 'alias']);
    }

    #[Test]
    public function store_validates_for_a_unique_alias(): void
    {
        // 1. ARRANGE
        Town::factory()->create(['alias' => 'ABC']);

        $townData = [
            'name' => 'New Town',
            'feeder' => 'Feeder-03',
            'alias' => 'ABC', // Not unique
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')->post('/addresses/towns', $townData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHasErrors('alias');
        $this->assertDatabaseCount('towns', 1);
    }

    #[Test]
    public function it_can_update_a_town(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create([
            'name' => 'Old Name',
            'feeder' => 'Old Feeder',
            'alias' => 'OLD'
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'feeder' => 'Updated Feeder',
            'alias' => 'UPD',
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
            'alias' => 'UPD',
        ]);
    }

    #[Test]
    public function update_validates_for_unique_alias_excluding_self(): void
    {
        // 1. ARRANGE
        $townA = Town::factory()->create(['alias' => 'AAA']);
        $townB = Town::factory()->create(['alias' => 'BBB']);

        $updateData = [
            'name' => $townB->name,
            'feeder' => $townB->feeder,
            'alias' => 'AAA', // Taken by townA
        ];

        // 2. ACT
        $response = $this->from('/addresses/towns')
                        ->put('/addresses/towns/' . $townB->id, $updateData);

        // 3. ASSERT
        $response->assertRedirect('/addresses/towns');
        $response->assertSessionHasErrors('alias');

        $this->assertDatabaseHas('towns', [
            'id' => $townB->id,
            'alias' => 'BBB' // Unchanged
        ]);
    }

    #[Test]
    public function update_allows_keeping_same_alias(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create([
            'name' => 'Test Town',
            'alias' => 'TST',
        ]);

        $updateData = [
            'name' => 'Updated Test Town',
            'feeder' => $town->feeder,
            'alias' => 'TST', // Same alias
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
            'alias' => 'TST',
        ]);
    }

    //=================================================================
    // API (JSON) TESTS
    //=================================================================

    #[Test]
    public function check_alias_returns_available_for_new_alias(): void
    {
        // 2. ACT
        $response = $this->getJson('/addresses/check-town-alias?alias=NEW');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }

    #[Test]
    public function check_alias_returns_not_available_for_taken_alias(): void
    {
        // 1. ARRANGE
        Town::factory()->create(['alias' => 'TAKEN']);

        // 2. ACT
        $response = $this->getJson('/addresses/check-town-alias?alias=TAKEN');

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => false]);
    }

    #[Test]
    public function check_alias_returns_available_when_checking_own_alias(): void
    {
        // 1. ARRANGE
        $town = Town::factory()->create(['alias' => 'MINE']);

        // 2. ACT
        $url = '/addresses/check-town-alias?alias=MINE&town_id=' . $town->id;
        $response = $this->getJson($url);

        // 3. ASSERT
        $response->assertStatus(200);
        $response->assertJson(['available' => true]);
    }

    #[Test]
    public function check_alias_returns_available_when_no_alias_provided(): void
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

    #[Test]
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

    #[Test]
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
