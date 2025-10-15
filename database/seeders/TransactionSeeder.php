<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatusEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\PaymentType;
use App\Models\CustomerApplication;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some CustomerApplication records first to reference
        $customerApplications = CustomerApplication::factory(10)->create();
        
        // Create some CustomerApplications specifically with FOR_COLLECTION status
        $forCollectionApps = CustomerApplication::factory(5)->create([
            'status' => ApplicationStatusEnum::FOR_COLLECTION
        ]);

        // Create 20 random transactions with related details and payment types
        Transaction::factory(20)
            ->has(
                TransactionDetail::factory()
                    ->count(rand(1, 5)), // Each transaction has 1-5 details
                'transactionDetails'
            )
            ->has(
                PaymentType::factory()
                    ->count(rand(1, 3)), // Each transaction has 1-3 payment types
                'paymentTypes'
            )
            ->create();

        // Create 5 standalone transactions (without transactionable relationship)
        Transaction::factory(5)->standalone()
            ->has(
                TransactionDetail::factory()
                    ->count(rand(1, 2)),
                'transactionDetails'
            )
            ->has(
                PaymentType::factory()
                    ->count(1),
                'paymentTypes'
            )
            ->create();

        // Create 5 transactions specifically for FOR_COLLECTION applications
        Transaction::factory(5)->forCollection()
            ->has(
                TransactionDetail::factory()
                    ->count(rand(1, 3)),
                'transactionDetails'
            )
            ->has(
                PaymentType::factory()
                    ->count(rand(1, 2)),
                'paymentTypes'
            )
            ->create();

        // Create some specific transaction scenarios
        
        // Customer Application Transaction with FOR_COLLECTION status
        $collectionApp = $forCollectionApps->first();
        $customerAppTransaction = Transaction::factory()->forCollection()->create([
            'transactionable_type' => CustomerApplication::class,
            'transactionable_id' => $collectionApp->id,
            'or_number' => 'OR-001001',
            'total_amount' => 15000.00,
            'description' => 'Service connection fee collection',
            'payment_mode' => 'Full Payment',
            'status' => TransactionStatusEnum::COMPLETED
        ]);

        // Add details for customer application
        TransactionDetail::factory()->create([
            'transaction_id' => $customerAppTransaction->id,
            'transaction' => 'Service Connection Fee',
            'amount' => 12000.00,
            'quantity' => 1,
            'total_amount' => 12000.00,
        ]);

        TransactionDetail::factory()->create([
            'transaction_id' => $customerAppTransaction->id,
            'transaction' => 'Meter Deposit',
            'amount' => 3000.00,
            'quantity' => 1,
            'total_amount' => 3000.00,
        ]);

        // Add payment types
        PaymentType::factory()->create([
            'transaction_id' => $customerAppTransaction->id,
            'payment_type' => 'cash',
            'amount' => 10000.00,
        ]);

        PaymentType::factory()->create([
            'transaction_id' => $customerAppTransaction->id,
            'payment_type' => 'check',
            'amount' => 5000.00,
            'bank' => 'BPI Bank',
            'check_number' => 'CHK-123456',
            'check_expiration_date' => now()->addMonths(6),
        ]);

                // Another Customer Application for service-related transaction
        $customerApp2 = $customerApplications->first();
        $serviceTransaction = Transaction::factory()->forCustomerApplication()->create([
            'transactionable_type' => CustomerApplication::class,
            'transactionable_id' => $customerApp2->id,
            'or_number' => 'OR-001002',
            'total_amount' => 5000.00,
            'description' => 'Service reconnection fee',
            'payment_mode' => 'Cash',
            'status' => TransactionStatusEnum::COMPLETED
        ]);

        TransactionDetail::factory()->create([
            'transaction_id' => $serviceTransaction->id,
            'transaction' => 'Reconnection Fee',
            'amount' => 5000.00,
            'quantity' => 1,
            'total_amount' => 5000.00,
        ]);

        PaymentType::factory()->create([
            'transaction_id' => $serviceTransaction->id,
            'payment_type' => 'gcash',
            'amount' => 5000.00,
            'bank_transaction_number' => 'GCASH-987654321',
        ]);

        // Another Customer Application for monthly billing
        $customerApp3 = $customerApplications->skip(1)->first();
        $billingTransaction = Transaction::factory()->forCustomerApplication()->create([
            'transactionable_type' => CustomerApplication::class,
            'transactionable_id' => $customerApp3->id,
            'or_number' => 'OR-001003',
            'total_amount' => 2500.00,
            'description' => 'Monthly electricity bill payment',
            'payment_mode' => 'Full Payment',
            'status' => TransactionStatusEnum::COMPLETED
        ]);

        TransactionDetail::factory()->create([
            'transaction_id' => $billingTransaction->id,
            'transaction' => 'Monthly Bill',
            'amount' => 2.50,
            'unit' => 'kWh',
            'quantity' => 1000,
            'total_amount' => 2500.00,
            'bill_month' => now()->format('Y-m'),
        ]);

        PaymentType::factory()->create([
            'transaction_id' => $billingTransaction->id,
            'payment_type' => 'online_banking',
            'amount' => 2500.00,
            'bank' => 'Metrobank',
            'bank_transaction_number' => 'ONL-456789123',
        ]);

        // Create transactions for remaining customer applications
        foreach ($customerApplications->skip(2) as $customerApp) {
            Transaction::factory()->forCustomerApplication()
                ->has(TransactionDetail::factory()->count(rand(1, 3)))
                ->has(PaymentType::factory()->count(rand(1, 2)))
                ->create([
                    'transactionable_type' => CustomerApplication::class,
                    'transactionable_id' => $customerApp->id,
                ]);
        }

        // Create transactions for remaining FOR_COLLECTION applications
        foreach ($forCollectionApps->skip(1) as $collectionApp) {
            Transaction::factory()->forCollection()
                ->has(TransactionDetail::factory()->count(rand(1, 2)))
                ->has(PaymentType::factory()->count(1))
                ->create([
                    'transactionable_type' => CustomerApplication::class,
                    'transactionable_id' => $collectionApp->id,
                ]);
        }

        // Create a standalone transaction example (miscellaneous payment)
        $standaloneTransaction = Transaction::factory()->standalone()->create([
            'or_number' => 'OR-001004',
            'total_amount' => 1500.00,
            'description' => 'Miscellaneous service fee',
            'payment_mode' => 'Cash',
            'cashier' => 'Jane Doe',
            'status' => TransactionStatusEnum::COMPLETED
        ]);

        // Add details for standalone transaction
        TransactionDetail::factory()->create([
            'transaction_id' => $standaloneTransaction->id,
            'transaction' => 'Document Processing Fee',
            'amount' => 1500.00,
            'quantity' => 1,
            'total_amount' => 1500.00,
        ]);

        PaymentType::factory()->create([
            'transaction_id' => $standaloneTransaction->id,
            'payment_type' => 'cash',
            'amount' => 1500.00,
        ]);
    }
}
