<?php

namespace Database\Seeders;

use App\Enums\RolesEnum;
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

        // Get treasury staff users to assign as cashiers
        $treasuries = User::role(RolesEnum::TREASURY_STAFF)->get();

        if ($treasuries->isEmpty()) {
            // If no treasuries yet, create a default series
            TransactionSeries::create([
                'series_name' => 'Default Series',
                'prefix' => 'CR',
                'current_number' => 0,
                'start_number' => 1,
                'end_number' => 9999999999,
                'format' => '{PREFIX}{NUMBER:10}', // Format: CR0000000001
                'is_active' => true,
                'assigned_to_user_id' => null, // No user assigned yet
                'effective_from' => now()->startOfYear(),
                'effective_to' => null,
                'created_by' => $admin?->id,
                'notes' => 'Default transaction series. Assign to a cashier when ready.',
            ]);
            return;
        }

        // Loop through each treasury staff and create a series
        foreach ($treasuries as $index => $treasury) {
            $cashierNumber = $index + 1;
            $startNumber = $index * 1000000000 + 1; // 1, 1000000001, 2000000001, etc.
            $endNumber = ($index + 1) * 1000000000; // 1000000000, 2000000000, 3000000000, etc.

            TransactionSeries::create([
                'series_name' => "Cashier {$cashierNumber} Series - {$treasury->name}",
                'prefix' => 'CR',
                'current_number' => $startNumber - 1, // Will start from start_number on first use
                'start_number' => $startNumber,
                'end_number' => $endNumber,
                'format' => '{PREFIX}{NUMBER:10}', // Format: CR000000000001 (12 digits)
                'is_active' => true,
                'assigned_to_user_id' => $treasury->id,
                'effective_from' => now()->startOfYear(),
                'effective_to' => null, // No end date
                'created_by' => $admin?->id,
                'notes' => "Transaction series for {$treasury->name}. Range: CR" . str_pad($startNumber, 10, '0', STR_PAD_LEFT) . " to CR" . str_pad($endNumber, 10, '0', STR_PAD_LEFT),
            ]);
        }
    }
}
