<?php

namespace Tests\Feature\Console;

use App\Models\ReadingSchedule;
use App\Models\Route;
use App\Models\User;
use App\Enums\AccountStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GenerateReadingScheduleCommandTest extends TestCase
{
    use RefreshDatabase;

    private User $meterReader;
    private Route $route1;
    private Route $route2;
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

        // Town
        $town = \App\Models\Town::create([
            'name' => 'Test Town',
            'feeder' => 'TEST-FEEDER',
            'district' => 1,
            'du_tag' => 'TEST-DU',
        ]);

        // Barangay
        $this->barangay = \App\Models\Barangay::create([
            'name' => 'Test Barangay',
            'town_id' => $town->id,
        ]);

        // Routes
        $this->route1 = Route::create([
            'name' => 'Route 1',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 15,
            'barangay_id' => $this->barangay->id,
        ]);

        $this->route2 = Route::create([
            'name' => 'Route 2',
            'meter_reader_id' => $this->meterReader->id,
            'reading_day_of_month' => 20,
            'barangay_id' => $this->barangay->id,
        ]);

        $this->createCustomerAccounts($this->route1, 10, 2);
        $this->createCustomerAccounts($this->route2, 5, 1);
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

    public function test_it_generates_schedules_for_current_month_by_default()
    {
        $this->artisan('generate:reading-schedule')
            ->expectsOutputToContain('Generating up to all schedules')
            ->expectsOutput('Success! Generated 2 schedules.')
            ->assertSuccessful();

        $this->assertDatabaseCount('reading_schedules', 2);
        $this->assertDatabaseHas('reading_schedules', [
            'route_id' => $this->route1->id,
            'billing_month' => now()->format('Y-m'),
            'reading_date' => 15,
            'active_accounts' => 10,
            'disconnected_accounts' => 2,
            'total_accounts' => 12,
        ]);
    }

    public function test_it_generates_schedules_for_specific_month_and_year()
    {
        $this->artisan('generate:reading-schedule', [
            'month' => '3',
            'year' => '2025',
        ])
            ->expectsOutputToContain('Generating up to all schedules')
            ->expectsOutput('Success! Generated 2 schedules.')
            ->assertSuccessful();

        $this->assertDatabaseHas('reading_schedules', [
            'route_id' => $this->route1->id,
            'billing_month' => '2025-03',
        ]);
    }

    public function test_it_cancels_operation_when_user_declines_regeneration()
    {
        ReadingSchedule::generateForMonth(2025, 3);

        $this->artisan('generate:reading-schedule', [
            'month' => '3',
            'year' => '2025',
        ])
            ->expectsConfirmation('Do you want to regenerate them?', 'no')
            ->expectsOutput('Operation cancelled.')
            ->assertSuccessful();

        $this->assertDatabaseCount('reading_schedules', 2);
    }

    public function test_it_respects_limit_option()
    {
        $this->artisan('generate:reading-schedule', [
            '--limit' => 1,
            '--force' => true,
        ])
            ->expectsOutput('Success! Generated 1 schedules.')
            ->assertSuccessful();

        $this->assertDatabaseCount('reading_schedules', 1);

        $this->artisan('generate:reading-schedule', [
            '--force' => true,
        ])
            ->expectsOutput('Success! Generated 2 schedules.')
            ->assertSuccessful();

        $this->assertDatabaseCount('reading_schedules', 2);
    }

    public function test_it_updates_existing_schedules_with_new_data()
    {
        ReadingSchedule::generateForMonth(2025, 3);

        $this->route1->update(['reading_day_of_month' => 25]);
        $this->createCustomerAccounts($this->route1, 5, 3, 100);

        $this->artisan('generate:reading-schedule', [
            'month' => '3',
            'year' => '2025',
            '--force' => true,
        ])
            ->expectsOutput('Success! Generated 2 schedules.')
            ->assertSuccessful();

        $this->assertDatabaseHas('reading_schedules', [
            'route_id' => $this->route1->id,
            'reading_date' => 25,
            'active_accounts' => 15,
            'disconnected_accounts' => 5,
            'total_accounts' => 20,
        ]);
    }

    public function test_it_displays_correct_existing_schedule_warning()
    {
        ReadingSchedule::generateForMonth(2025, 3);

        $this->artisan('generate:reading-schedule', [
            'month' => '3',
            'year' => '2025',
        ])
            ->expectsOutputToContain('Found 2 existing schedules for 2025-03')
            ->expectsConfirmation('Do you want to regenerate them?', 'yes')
            ->assertSuccessful();
    }
}
