<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\CustomerApplication;
use App\Models\Barangay;
use App\Models\CustomerType;
use App\Models\CaContactInfo;
use App\Models\CaBillInfo;
use App\Models\CustApplnInspection;

class GenerateCustomerApplications extends Command
{
    protected $signature = 'generate:customers
                            {--count=100000 : Number of customers to create (max 100000)}
                            {--batch=500 : Batch size for insertion}
                            {--truncate : Truncate table before seeding}';

    protected $description = 'Generate fake Customer Applications in batches using optimized bulk operations.';

    private $barangayIds = [];
    private $customerTypeIds = [];

    public function handle()
    {
        $count = (int) $this->option('count');
        $batch = (int) $this->option('batch');
        $truncate = $this->option('truncate');

        $max = 100000;
        if ($count > $max) {
            $this->warn("Capping count to {$max}.");
            $count = $max;
        }

        if ($truncate) {
            $this->warn('Truncating related tables...');
            $this->truncateTables();
            $this->info('Tables truncated.');
        }

        // Pre-load reference data
        $this->info('Loading reference data...');
        $this->loadReferenceData();

        $this->info("Generating {$count} Customer Applications in batches of {$batch}...");

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $remaining = $count;
        while ($remaining > 0) {
            $current = min($batch, $remaining);

            // Use database transaction for better performance
            DB::transaction(function () use ($current, $bar) {
                $this->generateBatch($current, $bar);
            });

            $remaining -= $current;
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Successfully generated {$count} customer applications.");

        return 0;
    }

    private function truncateTables()
    {
        // Use Laravel's truncate method which handles different databases properly
        CustApplnInspection::truncate();
        CaBillInfo::truncate();
        CaContactInfo::truncate();
        CustomerApplication::truncate();
    }

    private function loadReferenceData()
    {
        // Pre-load barangay and customer type IDs to avoid repeated queries
        $this->barangayIds = Barangay::pluck('id')->toArray();
        $this->customerTypeIds = CustomerType::pluck('id')->toArray();

        // Create some if they don't exist
        if (empty($this->barangayIds)) {
            Barangay::factory(50)->create();
            $this->barangayIds = Barangay::pluck('id')->toArray();
        }

        if (empty($this->customerTypeIds)) {
            CustomerType::factory(10)->create();
            $this->customerTypeIds = CustomerType::pluck('id')->toArray();
        }
    }

    private function generateBatch($count, $bar)
    {
        // Generate customer applications with optimized factory
        $applications = CustomerApplication::factory($count)->make([
            'barangay_id' => fn() => fake()->randomElement($this->barangayIds),
            'customer_type_id' => fn() => fake()->randomElement($this->customerTypeIds),
        ]);

        // Bulk insert customer applications
        $insertData = $applications->map(function ($app) {
            return array_merge($app->toArray(), [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        })->toArray();

        CustomerApplication::insert($insertData);

        // Get the IDs of the inserted records
        $lastId = CustomerApplication::latest('id')->first()->id;
        $firstId = $lastId - $count + 1;
        $applicationIds = range($firstId, $lastId);

        // Generate related records in bulk
        $this->generateContactInfo($applicationIds);
        $this->generateBillInfo($applicationIds);
        $this->generateInspections($applicationIds);

        $bar->advance($count);
    }

    private function generateContactInfo(array $applicationIds)
    {
        $contactData = [];
        foreach ($applicationIds as $appId) {
            $contactData[] = [
                'customer_application_id' => $appId,
                'last_name' => fake()->lastName(),
                'first_name' => fake()->firstName(),
                'middle_name' => fake()->firstName(),
                'relation' => fake()->randomElement(['Spouse', 'Parent', 'Sibling', 'Child']),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        CaContactInfo::insert($contactData);
    }

    private function generateBillInfo(array $applicationIds)
    {
        $billData = [];
        foreach ($applicationIds as $appId) {
            $billData[] = [
                'customer_application_id' => $appId,
                'barangay_id' => fake()->randomElement($this->barangayIds),
                'subdivision' => fake()->word(),
                'street' => fake()->streetName(),
                'unit_no' => fake()->buildingNumber(),
                'building' => fake()->company(),
                'delivery_mode' => fake()->randomElement(['Email', 'Postal', 'Pickup', 'SMS']),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        CaBillInfo::insert($billData);
    }

    private function generateInspections(array $applicationIds)
    {
        $inspectionData = [];
        foreach ($applicationIds as $appId) {
            $numInspections = rand(1, 3);
            for ($i = 0; $i < $numInspections; $i++) {
                $inspectionData[] = [
                    'customer_application_id' => $appId,
                    'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
                    'house_loc' => fake()->latitude() . ',' . fake()->longitude(),
                    'meter_loc' => fake()->latitude() . ',' . fake()->longitude(),
                    'bill_deposit' => fake()->randomFloat(2, 100, 2000),
                    'material_deposit' => fake()->randomFloat(2, 100, 2000),
                    'remarks' => fake()->optional()->sentence(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($inspectionData)) {
            // Insert in chunks to avoid memory issues with large datasets
            collect($inspectionData)->chunk(1000)->each(function ($chunk) {
                CustApplnInspection::insert($chunk->toArray());
            });
        }
    }
}
