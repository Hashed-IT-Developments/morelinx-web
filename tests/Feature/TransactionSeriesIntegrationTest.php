<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\TransactionSeries;
use App\Models\Transaction;
use App\Models\CustomerAccount;
use App\Models\Payable;
use App\Models\User;
use App\Models\OrNumberGeneration;
use App\Services\PaymentService;
use App\Services\TransactionNumberService;
use App\Enums\PayableStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransactionSeriesIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected TransactionSeries $series;
    protected PaymentService $paymentService;
    protected TransactionNumberService $transactionNumberService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        
        $this->transactionNumberService = app(TransactionNumberService::class);
        $this->paymentService = app(PaymentService::class);
        
        // Create an active transaction series (global, no user assignment)
        $this->series = TransactionSeries::create([
            'series_name' => '2025 Main Series',
            'prefix' => 'OR',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);
    }

    /**
     * Test that payments automatically get OR numbers from active series.
     */
    public function test_payment_generates_or_number_from_active_series()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-001',
        ]);

        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'amount_paid' => 0,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $paymentData = [
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 1000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertNotNull($transaction->or_number);
        $this->assertStringStartsWith('OR', $transaction->or_number);
        $this->assertEquals($this->series->id, $transaction->transaction_series_id);
        $this->assertFalse($transaction->is_manual_or_number);
        
        // Verify generation record was created
        $this->assertNotNull($transaction->generation_id);
        $generation = OrNumberGeneration::find($transaction->generation_id);
        $this->assertNotNull($generation);
        $this->assertEquals('used', $generation->status);
        $this->assertEquals($this->user->id, $generation->generated_by_user_id);
        $this->assertEquals(1, $generation->actual_number);
    }

    /**
     * Test sequential OR number generation in multiple payments.
     */
    public function test_multiple_payments_generate_sequential_or_numbers()
    {
        $customer = CustomerAccount::factory()->create();
        
        $transactions = [];
        
        // Process 5 payments
        for ($i = 1; $i <= 5; $i++) {
            $payable = Payable::create([
                'customer_account_id' => $customer->id,
                'customer_payable' => "Bill $i",
                'bill_month' => now()->format('Ym'),
                'total_amount_due' => 1000.00,
                'amount_paid' => 0,
                'balance' => 1000.00,
                'status' => PayableStatusEnum::UNPAID,
            ]);

            $paymentData = [
                'selected_payable_ids' => [$payable->id],
                'payment_methods' => [
                    ['type' => 'cash', 'amount' => 1000.00],
                ],
            ];

            $transactions[] = $this->paymentService->processPayment($paymentData, $customer);
        }

        // Verify all transactions have sequential OR numbers
        $this->assertCount(5, $transactions);
        
        foreach ($transactions as $index => $transaction) {
            $expectedNumber = str_pad($index + 1, 12, '0', STR_PAD_LEFT);
            $this->assertStringContainsString($expectedNumber, $transaction->or_number);
            
            // Verify generation record exists
            $this->assertNotNull($transaction->generation_id);
        }

        // Verify all generation records were created
        $this->assertEquals(5, OrNumberGeneration::where('generated_by_user_id', $this->user->id)->count());
        
        // Verify they are sequential
        $generations = OrNumberGeneration::where('generated_by_user_id', $this->user->id)
            ->orderBy('actual_number')
            ->pluck('actual_number')
            ->toArray();
        $this->assertEquals([1, 2, 3, 4, 5], $generations);
    }

    /**
     * Test switching series mid-operation.
     */
    public function test_switching_series_affects_next_transaction()
    {
        $customer = CustomerAccount::factory()->create();
        
        // Create first payment with series 1
        $payable1 = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Bill 1',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $transaction1 = $this->paymentService->processPayment([
            'selected_payable_ids' => [$payable1->id],
            'payment_methods' => [['type' => 'cash', 'amount' => 1000.00]],
        ], $customer);

        // Create and activate a new series with immediate effective date
        $newSeries = TransactionSeries::create([
            'series_name' => '2026 New Series',
            'prefix' => 'OR2',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => false,
            'effective_from' => now(), // Use current date instead of future date
            'created_by' => $this->user->id,
        ]);

        $this->transactionNumberService->activateSeries($newSeries);

        // Create second payment with series 2
        $payable2 = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Bill 2',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $transaction2 = $this->paymentService->processPayment([
            'selected_payable_ids' => [$payable2->id],
            'payment_methods' => [['type' => 'cash', 'amount' => 1000.00]],
        ], $customer);

        // Verify first transaction uses old series
        $this->assertEquals($this->series->id, $transaction1->transaction_series_id);
        $this->assertStringStartsWith('OR', $transaction1->or_number);

        // Verify second transaction uses new series
        $this->assertEquals($newSeries->id, $transaction2->transaction_series_id);
        $this->assertStringStartsWith('OR2', $transaction2->or_number);
    }

    /**
     * Test that payment fails when no active series exists.
     */
    public function test_payment_fails_without_active_series()
    {
        // Deactivate the series
        $this->transactionNumberService->deactivateSeries($this->series);

        $customer = CustomerAccount::factory()->create();
        
        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No active transaction series found');

        $this->paymentService->processPayment([
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [['type' => 'cash', 'amount' => 1000.00]],
        ], $customer);
    }

    /**
     * Test that series respects its limit settings and throws exception when exhausted.
     */
    public function test_series_respects_limit()
    {
        // Set a series with small limit
        $this->series->start_number = 1;
        $this->series->end_number = 3;
        $this->series->save();
        
        // Generate the 3 allowed ORs
        $this->transactionNumberService->setCashierOffset($this->user->id, 1);
        $result1 = $this->transactionNumberService->generateNextOrNumber($this->user->id);
        $result2 = $this->transactionNumberService->generateNextOrNumber($this->user->id);
        $result3 = $this->transactionNumberService->generateNextOrNumber($this->user->id);
        
        // Verify ORs are within limits
        $this->assertStringContainsString('000000000001', $result1['or_number']);
        $this->assertStringContainsString('000000000002', $result2['or_number']);
        $this->assertStringContainsString('000000000003', $result3['or_number']);
        
        // Fourth attempt should throw exception as series is exhausted
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('has reached its limit');
        
        $this->transactionNumberService->generateNextOrNumber($this->user->id);
    }

    /**
     * Test manual OR number entry (currently auto-generated).
     * Note: Manual OR number feature is documented but not yet implemented in PaymentService.
     * This test verifies current behavior - OR numbers are always auto-generated.
     */
    public function test_or_numbers_are_auto_generated()
    {
        $customer = CustomerAccount::factory()->create();
        
        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $paymentData = [
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                ['type' => 'cash', 'amount' => 1000.00],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        // Verify OR number was auto-generated
        $this->assertNotNull($transaction->or_number);
        $this->assertStringStartsWith('OR', $transaction->or_number);
        $this->assertStringContainsString('000000000001', $transaction->or_number);
        $this->assertFalse($transaction->is_manual_or_number);
        
        // Verify generation record was created
        $this->assertNotNull($transaction->generation_id);
        $generation = OrNumberGeneration::find($transaction->generation_id);
        $this->assertEquals('used', $generation->status);
        $this->assertEquals(1, $generation->actual_number);
    }

    /**
     * Test duplicate manual OR numbers are prevented.
     */
    public function test_duplicate_manual_or_numbers_prevented()
    {
        $manualOrNumber = 'OR-202510-123456';

        // Create first transaction with manual OR
        Transaction::factory()->create([
            'or_number' => $manualOrNumber,
            'is_manual_or_number' => true,
        ]);

        // Verify validation fails for duplicate
        $isValid = $this->transactionNumberService->validateManualOrNumber($manualOrNumber);
        $this->assertFalse($isValid);
    }

    /**
     * Test transaction series relationship is maintained.
     */
    public function test_transaction_series_relationship()
    {
        $customer = CustomerAccount::factory()->create();
        
        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $transaction = $this->paymentService->processPayment([
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [['type' => 'cash', 'amount' => 1000.00]],
        ], $customer);

        // Test transaction -> series relationship
        $this->assertNotNull($transaction->transactionSeries);
        $this->assertEquals($this->series->id, $transaction->transactionSeries->id);
        $this->assertEquals('2025 Main Series', $transaction->transactionSeries->series_name);

        // Test series -> transactions relationship
        $this->series->refresh();
        $this->assertCount(1, $this->series->transactions);
        $this->assertEquals($transaction->id, $this->series->transactions->first()->id);
    }

    /**
     * Test concurrent payment processing with database locking.
     */
    public function test_concurrent_payment_processing()
    {
        $customer = CustomerAccount::factory()->create();
        
        $transactions = [];
        
        // Simulate concurrent payments
        \Illuminate\Support\Facades\DB::transaction(function () use ($customer, &$transactions) {
            for ($i = 1; $i <= 3; $i++) {
                $payable = Payable::create([
                    'customer_account_id' => $customer->id,
                    'customer_payable' => "Concurrent Bill $i",
                    'bill_month' => now()->format('Ym'),
                    'total_amount_due' => 1000.00,
                    'balance' => 1000.00,
                    'status' => PayableStatusEnum::UNPAID,
                ]);

                $transactions[] = $this->paymentService->processPayment([
                    'selected_payable_ids' => [$payable->id],
                    'payment_methods' => [['type' => 'cash', 'amount' => 1000.00]],
                ], $customer);
            }
        });

        // Verify all OR numbers are unique
        $orNumbers = array_map(fn($t) => $t->or_number, $transactions);
        $uniqueOrNumbers = array_unique($orNumbers);
        
        $this->assertCount(3, $uniqueOrNumbers, 'All OR numbers should be unique');
    }

    /**
     * Test OR number format consistency.
     * The formatNumber method replaces {PREFIX} and {NUMBER:X} placeholders.
     */
    public function test_or_number_format_consistency()
    {
        $customer = CustomerAccount::factory()->create();

        // Generate multiple OR numbers for the authenticated user
        for ($i = 0; $i < 3; $i++) {
            $payable = Payable::create([
                'customer_account_id' => $customer->id,
                'customer_payable' => "Test Bill $i",
                'bill_month' => now()->format('Ym'),
                'total_amount_due' => 1000.00,
                'balance' => 1000.00,
                'status' => PayableStatusEnum::UNPAID,
            ]);

            $result = $this->transactionNumberService->generateNextOrNumber($this->user->id);
            
            // Verify format is consistent with {PREFIX}{NUMBER:12} format
            $this->assertStringStartsWith('OR', $result['or_number']);
            
            // Verify the number part is correctly formatted (12 digits with padding)
            $expectedNumber = str_pad($i + 1, 12, '0', STR_PAD_LEFT);
            $this->assertStringContainsString($expectedNumber, $result['or_number']);
            
            // Verify generation record was created
            $this->assertArrayHasKey('generation_id', $result);
        }
    }

    /**
     * Test series statistics accuracy after multiple transactions.
     */
    public function test_series_statistics_after_transactions()
    {
        $customer = CustomerAccount::factory()->create();
        
        // Process 10 transactions
        for ($i = 1; $i <= 10; $i++) {
            $payable = Payable::create([
                'customer_account_id' => $customer->id,
                'customer_payable' => "Bill $i",
                'bill_month' => now()->format('Ym'),
                'total_amount_due' => 1000.00,
                'balance' => 1000.00,
                'status' => PayableStatusEnum::UNPAID,
            ]);

            $this->paymentService->processPayment([
                'selected_payable_ids' => [$payable->id],
                'payment_methods' => [['type' => 'cash', 'amount' => 1000.00]],
            ], $customer);
        }

        $this->series->refresh();
        $stats = $this->transactionNumberService->getSeriesStatistics($this->series);

        $this->assertEquals(10, $stats['transactions_count']);
        $this->assertEquals(999989, $stats['remaining_numbers']);
        $this->assertFalse($stats['is_near_limit']);
        $this->assertFalse($stats['has_reached_limit']);
        
        // Verify all generation records exist
        $this->assertEquals(10, OrNumberGeneration::where('generated_by_user_id', $this->user->id)->count());
    }

    /**
     * Test multi-cashier OR generation with stateless offsets.
     */
    public function test_multi_cashier_or_generation_with_offsets()
    {
        $cashier1 = User::factory()->create(['name' => 'Cashier 1']);
        $cashier2 = User::factory()->create(['name' => 'Cashier 2']);
        
        // Cashier 1 starts naturally (no offset)
        $result1 = $this->transactionNumberService->generateNextOrNumber($cashier1->id);
        $this->assertStringContainsString('000000000001', $result1['or_number']);
        
        // Cashier 2 uses stateless offset to start at 100
        $result2 = $this->transactionNumberService->generateNextOrNumber($cashier2->id, 100);
        $this->assertStringContainsString('000000000100', $result2['or_number']);
        
        // Cashier 1 continues from their last (2)
        $result3 = $this->transactionNumberService->generateNextOrNumber($cashier1->id);
        $this->assertStringContainsString('000000000002', $result3['or_number']);
        
        // Cashier 2 continues from their last (101)
        $result4 = $this->transactionNumberService->generateNextOrNumber($cashier2->id);
        $this->assertStringContainsString('000000000101', $result4['or_number']);
        
        // Verify generation records
        $this->assertEquals(2, OrNumberGeneration::where('generated_by_user_id', $cashier1->id)->count());
        $this->assertEquals(2, OrNumberGeneration::where('generated_by_user_id', $cashier2->id)->count());
    }

    /**
     * Test preview functionality with stateless offsets.
     */
    public function test_get_cashier_info()
    {
        // Generate with stateless offset=50
        $this->transactionNumberService->generateNextOrNumber($this->user->id, 50);
        
        // Generate again (should auto-continue to 51)
        $result = $this->transactionNumberService->generateNextOrNumber($this->user->id);
        $this->assertStringContainsString('000000000051', $result['or_number']);
        
        // Preview next (should show 52)
        $preview = $this->transactionNumberService->previewNextOrNumber($this->user->id);
        $this->assertStringContainsString('000000000052', $preview['or_number']);
        
        // Verify generation count
        $this->assertEquals(2, OrNumberGeneration::where('generated_by_user_id', $this->user->id)->count());
    }

    /**
     * Test offset conflict detection.
     */
    public function test_check_offset_for_conflicts()
    {
        $cashier1 = User::factory()->create(['name' => 'Cashier 1']);
        $cashier2 = User::factory()->create(['name' => 'Cashier 2']);
        
        // Cashier 1 sets offset to 100
        $this->transactionNumberService->setCashierOffset($cashier1->id, 100);
        
        // Cashier 2 tries to set offset to 120 (within ±50 range)
        $result = $this->transactionNumberService->checkOffsetBeforeSetting($cashier2->id, 120);
        
        $this->assertTrue($result['has_conflicts']);
        $this->assertNotEmpty($result['warnings']);
        $this->assertStringContainsString('Cashier 1', $result['warnings'][0]);
    }

    /**
     * Test that no conflict is detected with sufficient spacing.
     */
    public function test_no_conflict_with_sufficient_spacing()
    {
        $cashier1 = User::factory()->create(['name' => 'Cashier 1']);
        $cashier2 = User::factory()->create(['name' => 'Cashier 2']);
        
        // Cashier 1 sets offset to 100
        $this->transactionNumberService->setCashierOffset($cashier1->id, 100);
        
        // Cashier 2 tries to set offset to 200 (outside ±50 range)
        $result = $this->transactionNumberService->checkOffsetBeforeSetting($cashier2->id, 200);
        
        $this->assertFalse($result['has_conflicts']);
        $this->assertEmpty($result['warnings']);
    }

    /**
     * Test auto-refresh: getCashierInfo should be called after payment.
     */
    public function test_cashier_info_available_after_payment()
    {
        $customer = CustomerAccount::factory()->create();
        
        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // Process payment
        $transaction = $this->paymentService->processPayment([
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [['type' => 'cash', 'amount' => 1000.00]],
        ], $customer);

        // Verify generation record was created
        $this->assertEquals(1, OrNumberGeneration::where('generated_by_user_id', $this->user->id)->count());
        
        // Verify preview shows next number
        $preview = $this->transactionNumberService->previewNextOrNumber($this->user->id);
        $this->assertStringContainsString('000000000002', $preview['or_number']);
    }
}

