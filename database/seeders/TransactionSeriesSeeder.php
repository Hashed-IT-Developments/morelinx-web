<?php

namespace Database\Seeders;

use App\Models\TransactionSeries;
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
        // Get the first admin user or create system user
        $admin = User::first();

        // Create the initial active series for 2025
        TransactionSeries::create([
            'series_name' => '2025 Main Series',
            'prefix' => null, // No prefix needed, format includes OR
            'current_number' => 0, // Will start from start_number on first use
            'start_number' => 1,
            'end_number' => 999999, // Up to 999,999 transactions
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}', // Format: OR-202510-000001
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'effective_to' => now()->endOfYear(),
            'created_by' => $admin?->id,
            'notes' => 'Initial transaction series for 2025. Format: OR-YYYYMM-NNNNNN',
        ]);

        // Create a future series for 2026 (inactive, will be activated later)
        TransactionSeries::create([
            'series_name' => '2026 Main Series',
            'prefix' => null,
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => false,
            'effective_from' => now()->addYear()->startOfYear(),
            'effective_to' => now()->addYear()->endOfYear(),
            'created_by' => $admin?->id,
            'notes' => 'Transaction series for 2026. Will be activated on January 1, 2026.',
        ]);

        $this->command->info('✅ Created initial transaction series for 2025 and 2026');
    }
}
