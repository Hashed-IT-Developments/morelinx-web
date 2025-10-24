<?php

namespace Database\Seeders;

use App\Models\PayablesDefinition;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PayablesDefinitionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 50 standalone payables definitions
        PayablesDefinition::factory(50)->create();

        // Create specific transaction type definitions
        $this->createConnectionFeeDefinitions();
        $this->createMaintenanceDefinitions();
        $this->createBillingDefinitions();
    }

    /**
     * Create connection fee related definitions
     */
    private function createConnectionFeeDefinitions(): void
    {
        // Connection fees
        PayablesDefinition::factory(10)->connectionFee()->create();

        // Meter installations
        PayablesDefinition::factory(8)->meterInstallation()->create();

        // Service drop installations
        PayablesDefinition::factory(12)->serviceDropInstallation()->create();
    }

    /**
     * Create maintenance related definitions
     */
    private function createMaintenanceDefinitions(): void
    {
        $maintenanceTransactions = [
            ['name' => 'Line Maintenance', 'code' => 'LM'],
            ['name' => 'Transformer Maintenance', 'code' => 'TM'],
            ['name' => 'Meter Calibration', 'code' => 'MC'],
            ['name' => 'Pole Replacement', 'code' => 'PR'],
        ];

        foreach ($maintenanceTransactions as $transaction) {
            PayablesDefinition::factory(5)->create([
                'transaction_name' => $transaction['name'],
                'transaction_code' => $transaction['code'],
                'quantity' => 1,
                'unit' => 'service',
            ]);
        }
    }

    /**
     * Create billing related definitions
     */
    private function createBillingDefinitions(): void
    {
        $billingTransactions = [
            ['name' => 'Late Payment Fee', 'code' => 'LPF'],
            ['name' => 'Reconnection Fee', 'code' => 'RF'],
            ['name' => 'Disconnection Fee', 'code' => 'DF'],
            ['name' => 'Bill Processing Fee', 'code' => 'BPF'],
        ];

        foreach ($billingTransactions as $transaction) {
            PayablesDefinition::factory(8)->create([
                'transaction_name' => $transaction['name'],
                'transaction_code' => $transaction['code'],
                'quantity' => 1,
                'unit' => 'fee',
                'amount' => fake()->randomFloat(2, 25, 150),
            ]);
        }
    }
}