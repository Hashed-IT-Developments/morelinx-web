<?php

namespace Database\Seeders;

use App\Models\CustomerApplication;
use App\Models\Payable;
use App\Models\PayablesDefinition;
use App\Enums\ApplicationStatusEnum;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PayablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some CustomerApplications with FOR_COLLECTION status
        $customerApplications = CustomerApplication::where('status', ApplicationStatusEnum::FOR_COLLECTION)
            ->limit(5)
            ->get();

        if ($customerApplications->isEmpty()) {
            // Create some test applications if none exist
            $customerApplications = CustomerApplication::factory(3)->create([
                'status' => ApplicationStatusEnum::FOR_COLLECTION,
                'account_number' => function () {
                    return 'ACC-' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
                }
            ]);
        }

        foreach ($customerApplications as $customerApplication) {
            // Define the energization charges/materials
            $payableDefinitions = [
                [
                    'transaction_name' => 'Service Connection Fee',
                    'transaction_code' => 'SCF001',
                    'quantity' => 1,
                    'unit' => 'service',
                    'amount' => 5000.00,
                    'total_amount' => 5000.00,
                ],
                [
                    'transaction_name' => 'Meter Deposit',
                    'transaction_code' => 'MD001',
                    'quantity' => 1,
                    'unit' => 'deposit',
                    'amount' => 2500.00,
                    'total_amount' => 2500.00,
                ],
                [
                    'transaction_name' => 'Installation Labor',
                    'transaction_code' => 'LABOR001',
                    'quantity' => 8,
                    'unit' => 'hours',
                    'amount' => 150.00,
                    'total_amount' => 1200.00,
                ],
                [
                    'transaction_name' => 'Electrical Materials',
                    'transaction_code' => 'MAT001',
                    'quantity' => 1,
                    'unit' => 'lot',
                    'amount' => 3500.00,
                    'total_amount' => 3500.00,
                ],
                [
                    'transaction_name' => 'Transformer Usage Fee',
                    'transaction_code' => 'TUF001',
                    'quantity' => 1,
                    'unit' => 'fee',
                    'amount' => 1800.00,
                    'total_amount' => 1800.00,
                ],
            ];

            // Calculate total amount from definitions
            $totalAmount = array_sum(array_column($payableDefinitions, 'total_amount'));

            // Create a payable record for this customer application with calculated total
            $payable = Payable::create([
                'customer_application_id' => $customerApplication->id,
                'customer_payable' => 'Energization Charges',
                'total_amount_due' => $totalAmount,
                'status' => 'unpaid',
                'amount_paid' => 0,
                'balance' => $totalAmount,
            ]);

            // Create payable definitions
            foreach ($payableDefinitions as $definition) {
                PayablesDefinition::create([
                    'payable_id' => $payable->id,
                    'transaction_name' => $definition['transaction_name'],
                    'transaction_code' => $definition['transaction_code'],
                    'billing_month' => Carbon::now()->format('Y-m-d'),
                    'quantity' => $definition['quantity'],
                    'unit' => $definition['unit'],
                    'amount' => $definition['amount'],
                    'total_amount' => $definition['total_amount'],
                ]);
            }
        }
    }
}