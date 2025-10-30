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
        // Get the first admin user
        $admin = User::first();

        // Create the first active series (2025)
        TransactionSeries::create([
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

        // Create a future series (2026) as inactive
        TransactionSeries::create([
            'series_name' => '2026 OR Series',
            'prefix' => 'CR',
            'current_number' => 0,
            'start_number' => 10000000001,
            'end_number' => 19999999999,
            'format' => '{PREFIX}{NUMBER:11}', // Format: CR00000000001 (11 digits)
            'is_active' => false,
            'effective_from' => now()->addYear()->startOfYear(),
            'effective_to' => now()->addYear()->endOfYear(),
            'created_by' => $admin?->id,
            'notes' => 'Transaction series for 2026. Activate this series when 2025 series is exhausted or when the year changes.',
        ]);
    }
}
