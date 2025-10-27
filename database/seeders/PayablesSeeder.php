<?php

namespace Database\Seeders;

use App\Models\CustomerApplication;
use App\Models\Payable;
use App\Models\PayablesDefinition;
use App\Enums\ApplicationStatusEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
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
            // Create payables for current month and 3 future months (4 months total)
            for ($monthOffset = 0; $monthOffset < 4; $monthOffset++) {
                $billMonth = Carbon::now()->addMonths($monthOffset);
                $billMonthFormatted = $billMonth->format('Ym'); // YYYYMM format
                $billMonthDisplay = $billMonth->format('F Y'); // e.g., "October 2025"

                // Define the energization charges/materials for the first month
                // Monthly electric bills for subsequent months
                if ($monthOffset === 0) {
                    // First month: Create separate payables for better EWT demonstration
                    
                    // 1. Connection Fee Payable (SUBJECT TO EWT)
                    $connectionPayable = Payable::create([
                        'customer_application_id' => $customerApplication->id,
                        'customer_payable' => 'Connection Fee',
                        'type' => PayableTypeEnum::CONNECTION_FEE,
                        'bill_month' => $billMonthFormatted,
                        'total_amount_due' => 5000.00,
                        'status' => PayableStatusEnum::UNPAID,
                        'amount_paid' => 0,
                        'balance' => 5000.00,
                    ]);
                    
                    PayablesDefinition::create([
                        'payable_id' => $connectionPayable->id,
                        'transaction_name' => 'Service Connection Fee',
                        'transaction_code' => 'SCF001',
                        'billing_month' => $billMonth->format('Y-m-d'),
                        'quantity' => 1,
                        'unit' => 'service',
                        'amount' => 5000.00,
                        'total_amount' => 5000.00,
                    ]);

                    // 2. Meter Deposit Payable (NOT SUBJECT TO EWT)
                    $depositPayable = Payable::create([
                        'customer_application_id' => $customerApplication->id,
                        'customer_payable' => 'Meter Deposit',
                        'type' => PayableTypeEnum::METER_DEPOSIT,
                        'bill_month' => $billMonthFormatted,
                        'total_amount_due' => 2500.00,
                        'status' => PayableStatusEnum::UNPAID,
                        'amount_paid' => 0,
                        'balance' => 2500.00,
                    ]);
                    
                    PayablesDefinition::create([
                        'payable_id' => $depositPayable->id,
                        'transaction_name' => 'Meter Deposit',
                        'transaction_code' => 'MD001',
                        'billing_month' => $billMonth->format('Y-m-d'),
                        'quantity' => 1,
                        'unit' => 'deposit',
                        'amount' => 2500.00,
                        'total_amount' => 2500.00,
                    ]);

                    // 3. Installation Fee Payable (SUBJECT TO EWT)
                    $installationPayable = Payable::create([
                        'customer_application_id' => $customerApplication->id,
                        'customer_payable' => 'Installation Fee',
                        'type' => PayableTypeEnum::INSTALLATION_FEE,
                        'bill_month' => $billMonthFormatted,
                        'total_amount_due' => 4700.00,
                        'status' => PayableStatusEnum::UNPAID,
                        'amount_paid' => 0,
                        'balance' => 4700.00,
                    ]);
                    
                    PayablesDefinition::create([
                        'payable_id' => $installationPayable->id,
                        'transaction_name' => 'Installation Labor',
                        'transaction_code' => 'LABOR001',
                        'billing_month' => $billMonth->format('Y-m-d'),
                        'quantity' => 8,
                        'unit' => 'hours',
                        'amount' => 150.00,
                        'total_amount' => 1200.00,
                    ]);
                    
                    PayablesDefinition::create([
                        'payable_id' => $installationPayable->id,
                        'transaction_name' => 'Electrical Materials',
                        'transaction_code' => 'MAT001',
                        'billing_month' => $billMonth->format('Y-m-d'),
                        'quantity' => 1,
                        'unit' => 'lot',
                        'amount' => 3500.00,
                        'total_amount' => 3500.00,
                    ]);

                    // 4. Bill Deposit (NOT SUBJECT TO EWT)
                    $billDepositPayable = Payable::create([
                        'customer_application_id' => $customerApplication->id,
                        'customer_payable' => 'Bill Deposit',
                        'type' => PayableTypeEnum::BILL_DEPOSIT,
                        'bill_month' => $billMonthFormatted,
                        'total_amount_due' => 3000.00,
                        'status' => PayableStatusEnum::UNPAID,
                        'amount_paid' => 0,
                        'balance' => 3000.00,
                    ]);
                    
                    PayablesDefinition::create([
                        'payable_id' => $billDepositPayable->id,
                        'transaction_name' => 'Bill Deposit',
                        'transaction_code' => 'BD001',
                        'billing_month' => $billMonth->format('Y-m-d'),
                        'quantity' => 1,
                        'unit' => 'deposit',
                        'amount' => 3000.00,
                        'total_amount' => 3000.00,
                    ]);

                } else {
                    // Subsequent months: Monthly electric bill
                    $kwh = rand(150, 350); // Random kWh usage
                    $ratePerKwh = 12.50;
                    $energyCharge = $kwh * $ratePerKwh;
                    $systemLoss = $energyCharge * 0.10; // 10% system loss
                    $transmissionCharge = 250.00;
                    $generationCharge = $energyCharge * 0.15;
                    $distributionCharge = 350.00;
                    
                    $payableDefinitions = [
                        [
                            'transaction_name' => 'Energy Charge',
                            'transaction_code' => 'EC001',
                            'quantity' => $kwh,
                            'unit' => 'kWh',
                            'amount' => $ratePerKwh,
                            'total_amount' => $energyCharge,
                        ],
                        [
                            'transaction_name' => 'System Loss',
                            'transaction_code' => 'SL001',
                            'quantity' => 1,
                            'unit' => 'charge',
                            'amount' => $systemLoss,
                            'total_amount' => $systemLoss,
                        ],
                        [
                            'transaction_name' => 'Transmission Charge',
                            'transaction_code' => 'TC001',
                            'quantity' => 1,
                            'unit' => 'charge',
                            'amount' => $transmissionCharge,
                            'total_amount' => $transmissionCharge,
                        ],
                        [
                            'transaction_name' => 'Generation Charge',
                            'transaction_code' => 'GC001',
                            'quantity' => 1,
                            'unit' => 'charge',
                            'amount' => $generationCharge,
                            'total_amount' => $generationCharge,
                        ],
                        [
                            'transaction_name' => 'Distribution Charge',
                            'transaction_code' => 'DC001',
                            'quantity' => 1,
                            'unit' => 'charge',
                            'amount' => $distributionCharge,
                            'total_amount' => $distributionCharge,
                        ],
                    ];
                    $payableName = "Electric Bill - {$billMonthDisplay}";
                    $payableType = PayableTypeEnum::MONTHLY_BILL; // Monthly bill type
                
                    // Calculate total amount from definitions
                    $totalAmount = array_sum(array_column($payableDefinitions, 'total_amount'));

                    // Create a payable record for this customer application with calculated total
                    $payable = Payable::create([
                        'customer_application_id' => $customerApplication->id,
                        'customer_payable' => $payableName,
                        'type' => $payableType, // Assign the payable type
                        'bill_month' => $billMonthFormatted,
                        'total_amount_due' => $totalAmount,
                        'status' => PayableStatusEnum::UNPAID,
                        'amount_paid' => 0,
                        'balance' => $totalAmount,
                    ]);

                    // Create payable definitions
                    foreach ($payableDefinitions as $definition) {
                        PayablesDefinition::create([
                            'payable_id' => $payable->id,
                            'transaction_name' => $definition['transaction_name'],
                            'transaction_code' => $definition['transaction_code'],
                            'billing_month' => $billMonth->format('Y-m-d'),
                            'quantity' => $definition['quantity'],
                            'unit' => $definition['unit'],
                            'amount' => $definition['amount'],
                            'total_amount' => $definition['total_amount'],
                        ]);
                    }
                }
            }
        }
    }
}