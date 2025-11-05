<?php

namespace Database\Seeders;

use App\Enums\RolesEnum;
use App\Models\TransactionSeries;
use App\Models\TransactionSeriesUserCounter;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first admin user
        $admin = User::role(RolesEnum::SUPERADMIN)->first();

        // Create the first active series (2025)
        $activeSeries = TransactionSeries::create([
            'series_name' => '2025 OR Series',
            'prefix' => 'CR',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 9999999999,
            'format' => '{PREFIX}{NUMBER:10}', // Format: CR0000000001
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'effective_to' => now()->endOfYear(),
            'created_by' => $admin?->id,
            'notes' => 'Active transaction series for 2025. Only one series can be active at a time.',
        ]);

        // ============================================================
        // MULTI-CASHIER: Create sample counter assignments for testing
        // ============================================================
        
        // Get sample users for testing (adjust based on your user seeder)
        $users = User::role(RolesEnum::TREASURY_STAFF)->limit(3)->get();

        if ($users->count() >= 3) {
            // Cashier 1: Starts at offset 1
            TransactionSeriesUserCounter::create([
                'transaction_series_id' => $activeSeries->id,
                'user_id' => $users[0]->id,
                'start_offset' => 1,
                'current_number' => 0,
                'last_generated_number' => null,
                'is_auto_assigned' => false,
            ]);

            // Cashier 2: Starts at offset 100
            TransactionSeriesUserCounter::create([
                'transaction_series_id' => $activeSeries->id,
                'user_id' => $users[1]->id,
                'start_offset' => 100,
                'current_number' => 0,
                'last_generated_number' => null,
                'is_auto_assigned' => false,
            ]);

            // Cashier 3: Starts at offset 200
            TransactionSeriesUserCounter::create([
                'transaction_series_id' => $activeSeries->id,
                'user_id' => $users[2]->id,
                'start_offset' => 200,
                'current_number' => 0,
                'last_generated_number' => null,
                'is_auto_assigned' => false,
            ]);

            $this->command->info('✓ Created sample cashier counter assignments (offsets: 1, 100, 200)');
        } else {
            $this->command->warn('⚠ Not enough users to create sample cashier counters. Skipping...');
        }
    }
}
