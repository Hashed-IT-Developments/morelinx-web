<?php

namespace Tests\Feature\Commands;

use App\Models\Barangay;
use App\Models\CaBillInfo;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GenerateCustomerApplicationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create some reference data for the command to use
        Barangay::factory(5)->create();
        CustomerType::factory(3)->create();
    }

    public function test_command_generates_default_number_of_customer_applications()
    {
        $this->artisan('generate:customers')
            ->expectsOutput('Loading reference data...')
            ->expectsOutput('Generating 1000 Customer Applications in batches of 50...')
            ->expectsOutput('✅ Successfully generated 1000 customer applications.')
            ->assertExitCode(0);

        // Assert that the correct number of records were created
        $this->assertEquals(1000, CustomerApplication::count());
        $this->assertEquals(1000, CaBillInfo::count());
        $this->assertEquals(1000, CustApplnInspection::count());
    }

    public function test_command_generates_custom_count_of_customer_applications()
    {
        $count = 100;

        $this->artisan('generate:customers', ['--count' => $count])
            ->expectsOutput("Generating {$count} Customer Applications in batches of 50...")
            ->expectsOutput("✅ Successfully generated {$count} customer applications.")
            ->assertExitCode(0);

        // Assert that the correct number of records were created
        $this->assertEquals($count, CustomerApplication::count());
        $this->assertEquals($count, CaBillInfo::count());
        $this->assertEquals($count, CustApplnInspection::count());
    }

    public function test_command_generates_with_custom_batch_size()
    {
        $count = 50;
        $batch = 25;

        $this->artisan('generate:customers', [
            '--count' => $count,
            '--batch' => $batch
        ])
            ->expectsOutput("Generating {$count} Customer Applications in batches of {$batch}...")
            ->expectsOutput("✅ Successfully generated {$count} customer applications.")
            ->assertExitCode(0);

        $this->assertEquals($count, CustomerApplication::count());
    }

    public function test_command_caps_count_to_maximum()
    {
        $this->markTestSkipped();
        
        $this->artisan('generate:customers', ['--count' => 150000])
            ->expectsOutput('Capping count to 100000.')
            ->expectsOutput('Generating 100000 Customer Applications in batches of 50...')
            ->assertExitCode(0);
    }

    public function test_command_truncates_tables_when_option_provided()
    {
        // Create some existing data
        CustomerApplication::factory(5)->create();
        $this->assertEquals(5, CustomerApplication::count());

        $this->artisan('generate:customers', [
            '--count' => 10,
            '--truncate' => true
        ])
            ->expectsOutput('Truncating related tables...')
            ->expectsOutput('Tables truncated.')
            ->expectsOutput('✅ Successfully generated 10 customer applications.')
            ->assertExitCode(0);

        // Should only have the newly generated records
        $this->assertEquals(10, CustomerApplication::count());
    }

    public function test_command_creates_reference_data_if_missing()
    {
        // Remove all barangays and customer types
        Barangay::truncate();
        CustomerType::truncate();

        $this->assertEquals(0, Barangay::count());
        $this->assertEquals(0, CustomerType::count());

        $this->artisan('generate:customers', ['--count' => 10])
            ->assertExitCode(0);

        // Command should have created reference data
        $this->assertGreaterThan(0, Barangay::count());
        $this->assertGreaterThan(0, CustomerType::count());
        $this->assertEquals(10, CustomerApplication::count());
    }

    public function test_generated_customer_applications_have_valid_relationships()
    {
        $this->artisan('generate:customers', ['--count' => 5])
            ->assertExitCode(0);

        $applications = CustomerApplication::with(['barangay', 'customerType'])->get();

        foreach ($applications as $application) {
            // Assert relationships exist
            $this->assertNotNull($application->barangay);
            $this->assertNotNull($application->customerType);

            // Assert application has related records
            $this->assertTrue($application->billInfo()->exists());
            $this->assertTrue($application->inspections()->exists());
        }
    }

    public function test_generated_bill_info_has_required_fields()
    {
        $this->artisan('generate:customers', ['--count' => 5])
            ->assertExitCode(0);

        $billInfos = CaBillInfo::all();

        foreach ($billInfos as $billInfo) {
            $this->assertNotNull($billInfo->customer_application_id);
            $this->assertNotNull($billInfo->barangay_id);
            $this->assertNotNull($billInfo->delivery_mode);
            $this->assertIsArray($billInfo->delivery_mode);
            $this->assertNotEmpty($billInfo->delivery_mode);
            $this->assertContains($billInfo->delivery_mode[0], ['Email', 'Postal', 'Pickup', 'SMS']);
        }
    }

    public function test_generated_inspections_have_required_fields()
    {
        $this->artisan('generate:customers', ['--count' => 5])
            ->assertExitCode(0);

        $inspections = CustApplnInspection::all();

        foreach ($inspections as $inspection) {
            $this->assertNotNull($inspection->customer_application_id);
            $this->assertNotNull($inspection->status);
            $this->assertNotNull($inspection->bill_deposit);
            $this->assertIsNumeric($inspection->bill_deposit);
            $this->assertGreaterThan(0, $inspection->bill_deposit);
        }
    }

    public function test_command_handles_zero_count()
    {
        $this->artisan('generate:customers', ['--count' => 0])
            ->expectsOutput('Generating 0 Customer Applications in batches of 50...')
            ->expectsOutput('✅ Successfully generated 0 customer applications.')
            ->assertExitCode(0);

        $this->assertEquals(0, CustomerApplication::count());
    }
}