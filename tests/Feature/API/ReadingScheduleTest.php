<?php

namespace Tests\Unit\Models;

use App\Models\ReadingSchedule;
use App\Models\Route;
use App\Models\User;
use App\Enums\AccountStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReadingScheduleTest extends TestCase
{
    use RefreshDatabase;

    private User $meterReader;
    private $customerType;
    private $barangay;

    protected function setUp(): void
    {
        parent::setUp();

        $this->meterReader = User::forceCreate([
            'name' => 'Meter Reader',
            'email' => 'reader@example.com',
            'username' => 'meter_reader_' . uniqid(),
            'password' => bcrypt('password'),
        ]);

        $this->customerType = \App\Models\CustomerType::create([
            'rate_class' => 'RES',
            'customer_type' => 'Residential',
        ]);

        $town = \App\Models\Town::create([
            'name' => 'Test Town',
            'feeder' => 'TEST-FEEDER',
            'district' => 1,
            'du_tag' => 'TEST-DU',
        ]);

        $this->barangay = \App\Models\Barangay::create([
            'name' => 'Test Barangay',
            'town_id' => $town->id,
        ]);
    }

    private function createCustomerAccounts(Route $route, int $activeCount, int $disconnectedCount, int $offset = 0): void
    {
        // Active accounts
        for ($i = 0; $i < $activeCount; $i++) {
            $application = \App\Models\CustomerApplication::create([
                'account_number' => 'APP' . $route->id . 'A' . str_pad($i + $offset, 3, '0', STR_PAD_LEFT),
                'barangay_id' => $this->barangay->id,
                'customer_type_id' => $this->customerType->id,
                'connected_load' => 1000,
                'id_type_1' => 'Driver License',
                'id_number_1' => 'ID' . rand(1000, 9999),
                'cp_last_name' => 'LastName',
                'cp_first_name' => 'FirstName',
                'cp_relation' => 'Owner',
                'status' => 'active',
            ]);

            \App\Models\CustomerAccount::create([
                'account_number' => 'ACC' . $route->id . 'A' . str_pad($i + $offset, 3, '0', STR_PAD_LEFT),
                'customer_name' => 'Active Customer ' . $i,
                'route_id' => $route->id,
                'barangay_id' => $this->barangay->id,
                'customer_application_id' => $application->id,
                'customer_type_id' => $this->customerType->id,
                'account_status' => AccountStatusEnum::ACTIVE,
            ]);
        }

        // Disconnected accounts
        for ($i = 0; $i < $disconnectedCount; $i++) {
            $application = \App\Models\CustomerApplication::create([
                'account_number' => 'APP' . $route->id . 'D' . str_pad($i + $offset, 3, '0', STR_PAD_LEFT),
                'barangay_id' => $this->barangay->id,
                'customer_type_id' => $this->customerType->id,
                'connected_load' => 1000,
                'id_type_1' => 'Driver License',
                'id_number_1' => 'ID' . rand(1000, 9999),
                'cp_last_name' => 'LastName',
                'cp_first_name' => 'FirstName',
                'cp_relation' => 'Owner',
                'status' => 'active',
            ]);

            \App\Models\CustomerAccount::create([
                'account_number' => 'ACC' . $route->id . 'D' . str_pad($i + $offset, 3, '0', STR_PAD_LEFT),
                'customer_name' => 'Disconnected Customer ' . $i,
                'route_id' => $route->id,
                'barangay_id' => $this->barangay->id,
                'customer_application_id' => $application->id,
                'customer_type_id' => $this->customerType->id,
                'account_status' => AccountStatusEnum::DISCONNECTED,
            ]);
        }
    }

    public function test_it_calculates_account_counts_correctly()
    {
        $route = Route::create([
            'name' => 'Test Route',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 15,
            'barangay_id' => $this->barangay->id,
        ]);

        $this->createCustomerAccounts($route, 8, 3);

        $schedule = ReadingSchedule::create([
            'route_id' => $route->id,
            'reading_date' => 15,
            'meter_reader_id' => $this->meterReader->id,
            'billing_month' => '2025-03',
        ]);

        $this->assertEquals(8, $schedule->active_accounts);
        $this->assertEquals(3, $schedule->disconnected_accounts);
        $this->assertEquals(11, $schedule->total_accounts);
    }

    public function test_it_scopes_by_billing_month()
    {
        $route1 = Route::create([
            'name' => 'Test Route 1',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 15,
            'barangay_id' => $this->barangay->id,
        ]);

        $route2 = Route::create([
            'name' => 'Test Route 2',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 20,
            'barangay_id' => $this->barangay->id,
        ]);

        ReadingSchedule::create([
            'route_id' => $route1->id,
            'reading_date' => 15,
            'meter_reader_id' => $this->meterReader->id,
            'billing_month' => '2025-03', // Same month, different route
        ]);
        ReadingSchedule::create([
            'route_id' => $route2->id,
            'reading_date' => 20,
            'meter_reader_id' => $this->meterReader->id,
            'billing_month' => '2025-03', // Same month, different route
        ]);

        ReadingSchedule::create([
            'route_id' => $route1->id,
            'reading_date' => 15,
            'meter_reader_id' => $this->meterReader->id,
            'billing_month' => '2025-04',
        ]);

        $results = ReadingSchedule::forBillingMonth(2025, 3)->get();

        $this->assertCount(2, $results);
        $results->each(function ($schedule) {
            $this->assertEquals('2025-03', $schedule->billing_month);
        });
    }

    public function test_generate_for_month_creates_schedules_for_all_routes()
    {
        $routes = collect([
            Route::create([
                'name' => 'Route 1',
                'meter_reader_id' => $this->meterReader->id,
                'reading_day_of_month' => 10,
                'barangay_id' => $this->barangay->id,
            ]),
            Route::create([
                'name' => 'Route 2',
                'meter_reader_id' => $this->meterReader->id,
                'reading_day_of_month' => 15,
                'barangay_id' => $this->barangay->id,
            ]),
            Route::create([
                'name' => 'Route 3',
                'meter_reader_id' => $this->meterReader->id,
                'reading_day_of_month' => 20,
                'barangay_id' => $this->barangay->id,
            ]),
        ]);

        $routes->each(function ($route) {
            $this->createCustomerAccounts($route, 5, 0);
        });

        $schedules = ReadingSchedule::generateForMonth(2025, 5);

        $this->assertCount(3, $schedules);
        $this->assertDatabaseCount('reading_schedules', 3);
    }

    public function test_generate_for_month_filters_by_route_ids()
    {
        $route1 = Route::create([
            'name' => 'Route 1',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 10,
            'barangay_id' => $this->barangay->id,
        ]);
        $route2 = Route::create([
            'name' => 'Route 2',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 15,
            'barangay_id' => $this->barangay->id,
        ]);
        $route3 = Route::create([
            'name' => 'Route 3',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 20,
            'barangay_id' => $this->barangay->id,
        ]);

        $this->createCustomerAccounts($route1, 3, 0);
        $this->createCustomerAccounts($route2, 3, 0);
        $this->createCustomerAccounts($route3, 3, 0);

        $schedules = ReadingSchedule::generateForMonth(2025, 5, [$route1->id, $route3->id]);

        $this->assertCount(2, $schedules);
        $this->assertDatabaseHas('reading_schedules', ['route_id' => $route1->id]);
        $this->assertDatabaseHas('reading_schedules', ['route_id' => $route3->id]);
        $this->assertDatabaseMissing('reading_schedules', ['route_id' => $route2->id]);
    }

    public function test_generate_for_month_respects_limit()
    {
        $routes = collect();
        for ($i = 1; $i <= 5; $i++) {
            $routes->push(Route::create([
                'name' => 'Route ' . $i,
                'meter_reader_id' => $this->meterReader->id,
                'reading_day_of_month' => 10 + $i,
                'barangay_id' => $this->barangay->id,
            ]));
        }

        $routes->each(function ($route) {
            $this->createCustomerAccounts($route, 2, 0);
        });

        $schedules = ReadingSchedule::generateForMonth(2025, 5, null, 2);

        $this->assertCount(2, $schedules);
        $this->assertDatabaseCount('reading_schedules', 2);
    }

    public function test_generate_for_month_updates_existing_schedules()
    {
        $route = Route::create([
            'name' => 'Test Route',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 10,
            'barangay_id' => $this->barangay->id,
        ]);

        $this->createCustomerAccounts($route, 3, 0);

        $schedule1 = ReadingSchedule::generateForMonth(2025, 3)->first();
        $this->assertEquals(10, $schedule1->reading_date);

        $route->update(['reading_day_of_month' => 20]);

        $schedule2 = ReadingSchedule::generateForMonth(2025, 3)->first();

        $this->assertEquals($schedule1->id, $schedule2->id);
        $this->assertEquals(20, $schedule2->reading_date);
    }

    public function test_it_has_proper_relationships()
    {
        $route = Route::create([
            'name' => 'Test Route',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 15,
            'barangay_id' => $this->barangay->id,
        ]);

        $schedule = ReadingSchedule::create([
            'route_id' => $route->id,
            'reading_date' => 15,
            'meter_reader_id' => $this->meterReader->id,
            'billing_month' => '2025-03',
        ]);

        $this->assertInstanceOf(Route::class, $schedule->route);
        $this->assertInstanceOf(User::class, $schedule->meterReader);
    }

    public function test_billing_month_format_is_consistent()
    {
        $route = Route::create([
            'name' => 'Test Route',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 15,
            'barangay_id' => $this->barangay->id,
        ]);

        $schedule = ReadingSchedule::create([
            'route_id' => $route->id,
            'reading_date' => 15,
            'meter_reader_id' => $this->meterReader->id,
            'billing_month' => '2025-03',
        ]);

        $this->assertEquals('2025-03', $schedule->billing_month);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}$/', $schedule->billing_month);
    }
}
