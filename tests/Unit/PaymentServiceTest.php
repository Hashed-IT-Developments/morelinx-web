<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\PaymentService;
use App\Models\CustomerAccount;
use App\Models\Payable;
use App\Models\CreditBalance;
use App\Models\TransactionSeries;
use App\Models\User;
use App\Enums\PayableStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PaymentService $paymentService;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user for the transaction series
        $this->user = User::factory()->create();
        
        // Create an active transaction series (global, no user assignment)
        TransactionSeries::create([
            'series_name' => 'Test Series',
            'prefix' => 'CR',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);
        
        // Authenticate the user
        $this->actingAs($this->user);
        
        // Use dependency injection to get PaymentService
        $this->paymentService = app(PaymentService::class);
    }

    /**
     * Test the exact scenario from the user
     * Bill: 14,000
     * Credit Balance: 2,040.62
     * Cash: 5,000
     * Card: 7,000
     * Expected Change: 40.62
     */
    public function test_payment_with_credit_cash_and_card()
    {
        // Create customer account
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-001',
            'account_status' => 'active',
        ]);

        // Create payable with 14,000 bill
        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 14000.00,
            'amount_paid' => 0,
            'balance' => 14000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // Create credit balance
        $creditBalance = CreditBalance::create([
            'customer_account_id' => $customer->id,
            'account_number' => 'TEST-001',
            'credit_balance' => 2040.62,
        ]);

        // Prepare payment data
        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 5000.00,
                ],
                [
                    'type' => 'credit_card',
                    'amount' => 7000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => '12345678901',
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        // Assertions
        $this->assertNotNull($transaction);
        
        // Total combined payment should be 14,040.62 (5000 + 7000 + 2040.62)
        $this->assertEquals(14040.62, round($transaction->total_amount, 2));
        
        // Check new audit fields
        $this->assertEquals(12000.00, round($transaction->amount_paid, 2), 'Amount paid should be cash + card');
        $this->assertEquals(2040.62, round($transaction->credit_applied, 2), 'Credit applied should be 2040.62');
        $this->assertEquals(40.62, round($transaction->change_amount, 2), 'Change amount should be 40.62');
        $this->assertEquals(11959.38, round($transaction->net_collection, 2), 'Net collection should be amount_paid - change_amount');
        
        // Check if overpayment was added back as credit
        $creditBalance->refresh();
        $this->assertEquals(40.62, round($creditBalance->credit_balance, 2), 'Change should be 40.62');
        
        // Check if payable is fully paid
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
        $this->assertEquals(14000.00, $payable->amount_paid);
    }

    /**
     * Test floating point precision issues
     */
    public function test_floating_point_precision()
    {
        $bill = 14000;
        $creditBalance = 2040.62;
        $cash = 5000;
        $card = 7000;

        // Without rounding
        $creditApplied = min($creditBalance, $bill);
        $totalPaymentAmount = $cash + $card;
        $totalCombinedPayment = $totalPaymentAmount + $creditApplied;
        $remainingPayment = $totalCombinedPayment - $bill;

        // This will fail due to floating point precision
        // $this->assertEquals(40.62, $remainingPayment);

        // This should pass with rounding
        $this->assertEquals(40.62, round($remainingPayment, 2));
    }

    /**
     * Test partial payment scenario
     */
    public function test_partial_payment()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-002',
            'account_status' => 'active',
        ]);

        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 10000.00,
            'amount_paid' => 0,
            'balance' => 10000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 5000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(5000.00, $transaction->total_amount);
        
        $payable->refresh();
        $this->assertEquals('partially_paid', $payable->status);
        $this->assertEquals(5000.00, round($payable->balance, 2));
    }

    /**
     * Test exact payment (no change)
     */
    public function test_exact_payment()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-003',
            'account_status' => 'active',
        ]);

        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 5000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(5000.00, $transaction->total_amount);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
    }

    /**
     * Test payment with EWT - transaction details should include EWT fields
     * NEW LOGIC: EWT calculated ONCE on original balance
     */
    public function test_payment_with_ewt_includes_details()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-004',
            'account_status' => 'active',
        ]);

        // Create payable with type that is subject to EWT
        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'type' => 'connection_fee', // Subject to EWT
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 10000.00,
            'amount_paid' => 0,
            'balance' => 10000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // ONE-TIME EWT: Balance 10000 × 5% = 500
        // Net balance = 10000 - 500 = 9500
        // Payment: 9500 (pays full net balance)
        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'ewt_type' => 'commercial',
            'ewt_amount' => 500.00,
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 9500.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(500.00, round($transaction->ewt, 2), 'One-time EWT: 10000 × 0.05');
        $this->assertEquals('commercial', $transaction->ewt_type);

        // Check transaction details have EWT fields
        $transaction->load('transactionDetails');
        $transactionDetails = $transaction->transactionDetails;
        $this->assertCount(1, $transactionDetails);
        
        $detail = $transactionDetails->first();
        $this->assertEquals(500.00, round($detail->ewt, 2), 'Transaction detail should have full EWT amount');
        $this->assertEquals('commercial', $detail->ewt_type, 'Transaction detail should have EWT type');
        
        // Verify payable is fully paid (cash + EWT = total coverage)
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
        $this->assertEquals(10000.00, $payable->amount_paid, 'amount_paid = cash (9500) + EWT (500)');
    }

    /**
     * Test payment with multiple payables - taxable and non-taxable
     * EWT should only apply to taxable payables (one-time calculation)
     */
    public function test_ewt_distribution_across_mixed_payables()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-005',
            'account_status' => 'active',
        ]);

        // Create taxable payable (subject to EWT)
        $connectionFee = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'type' => 'connection_fee', // Subject to EWT
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // Create non-taxable payable (NOT subject to EWT - deposit)
        $meterDeposit = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Meter Deposit',
            'type' => 'meter_deposit', // NOT subject to EWT
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 2500.00,
            'amount_paid' => 0,
            'balance' => 2500.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // ONE-TIME EWT:
        // Connection Fee: 5000 × 0.05 = 250 EWT, Net = 4750
        // Meter Deposit: No EWT, Balance = 2500
        // Total payment needed: 4750 + 2500 = 7250
        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$connectionFee->id, $meterDeposit->id],
            'ewt_type' => 'commercial',
            'ewt_amount' => 250.00,
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 7250.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(250.00, $transaction->ewt, 'EWT only on taxable payable');
        $this->assertEquals('commercial', $transaction->ewt_type);

        // Check transaction details
        $transaction->load('transactionDetails');
        $transactionDetails = $transaction->transactionDetails;
        $this->assertCount(2, $transactionDetails);

        // Connection Fee should have EWT
        $connectionDetail = $transactionDetails->where('transaction_code', 'PAY-' . $connectionFee->id)->first();
        $this->assertNotNull($connectionDetail);
        $this->assertEquals(250.00, $connectionDetail->ewt, 'Connection Fee: 5000 × 0.05');
        $this->assertEquals('commercial', $connectionDetail->ewt_type);

        // Meter Deposit should NOT have EWT (it's a deposit)
        $depositDetail = $transactionDetails->where('transaction_code', 'PAY-' . $meterDeposit->id)->first();
        $this->assertNotNull($depositDetail);
        $this->assertEquals(0, $depositDetail->ewt, 'Meter Deposit: No EWT (deposit exemption)');
        $this->assertNull($depositDetail->ewt_type);
        
        // Verify both fully paid
        $connectionFee->refresh();
        $meterDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $connectionFee->status);
        $this->assertEquals(PayableStatusEnum::PAID, $meterDeposit->status);
    }

    /**
     * Test ONE-TIME EWT calculation across multiple taxable payables
     * NEW LOGIC: EWT calculated once per payable on original balance
     */
    public function test_one_time_ewt_distribution()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-006',
            'account_status' => 'active',
        ]);

        // Create 3 taxable payables with different amounts
        $payable1 = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'type' => 'connection_fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable2 = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Installation Fee',
            'type' => 'installation_fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 3000.00,
            'amount_paid' => 0,
            'balance' => 3000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable3 = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Service Fee',
            'type' => 'service_fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 2000.00,
            'amount_paid' => 0,
            'balance' => 2000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // ONE-TIME EWT for full payment:
        // Payable1: 5000 × 0.05 = 250 EWT, Net = 4750
        // Payable2: 3000 × 0.05 = 150 EWT, Net = 2850
        // Payable3: 2000 × 0.05 = 100 EWT, Net = 1900
        // Total EWT: 500, Total Net: 9500
        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable1->id, $payable2->id, $payable3->id],
            'ewt_type' => 'commercial',
            'ewt_amount' => 500.00,
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 9500.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertEquals(500.00, round($transaction->ewt, 2), 'Total EWT: 250 + 150 + 100');

        $transaction->load('transactionDetails');
        $transactionDetails = $transaction->transactionDetails;
        $this->assertCount(3, $transactionDetails);

        // Verify ONE-TIME EWT per payable (calculated on original balance)
        $detail1 = $transactionDetails->where('transaction_code', 'PAY-' . $payable1->id)->first();
        $this->assertEquals(250.00, round($detail1->ewt, 2), 'Payable 1: 5000 × 0.05');

        $detail2 = $transactionDetails->where('transaction_code', 'PAY-' . $payable2->id)->first();
        $this->assertEquals(150.00, round($detail2->ewt, 2), 'Payable 2: 3000 × 0.05');

        $detail3 = $transactionDetails->where('transaction_code', 'PAY-' . $payable3->id)->first();
        $this->assertEquals(100.00, round($detail3->ewt, 2), 'Payable 3: 2000 × 0.05');

        // Verify sum equals total EWT
        $sumEwt = $detail1->ewt + $detail2->ewt + $detail3->ewt;
        $this->assertEquals(500.00, round($sumEwt, 2), 'Sum of detail EWT should equal transaction EWT');
        
        // Verify all payables are fully paid
        $payable1->refresh();
        $payable2->refresh();
        $payable3->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable1->status);
        $this->assertEquals(PayableStatusEnum::PAID, $payable2->status);
        $this->assertEquals(PayableStatusEnum::PAID, $payable3->status);
    }

    /**
     * Test government EWT (2.5%) with one-time calculation
     */
    public function test_government_ewt_distribution()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-007',
            'account_status' => 'active',
        ]);

        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Service Fee',
            'type' => 'service_fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 10000.00,
            'amount_paid' => 0,
            'balance' => 10000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // ONE-TIME EWT: Balance 10000 × 2.5% = 250
        // Net balance = 10000 - 250 = 9750
        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'ewt_type' => 'government',
            'ewt_amount' => 250.00,
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 9750.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertEquals(250.00, round($transaction->ewt, 2), 'One-time EWT: 10000 × 0.025');
        $this->assertEquals('government', $transaction->ewt_type);

        $transaction->load('transactionDetails');
        $detail = $transaction->transactionDetails->first();
        $this->assertEquals(250.00, round($detail->ewt, 2));
        $this->assertEquals('government', $detail->ewt_type);
        
        // Verify fully paid
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
    }
    
    /**
     * Test partial payment with EWT - Outstanding balance calculation
     * Scenario from user: Pay 1 out of 4 payables
     */
    public function test_partial_payment_with_ewt_balance_calculation()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-008',
            'account_status' => 'active',
        ]);

        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'type' => 'connection_fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 4700.00,
            'amount_paid' => 0,
            'balance' => 4700.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // ONE-TIME EWT: 4700 × 5% = 235
        // Net balance: 4700 - 235 = 4465
        // Payment: 1750
        // Outstanding: 4465 - 1750 = 2715
        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'ewt_type' => 'commercial',
            'ewt_amount' => 235.00,
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 1750.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(235.00, round($transaction->ewt, 2), 'Full EWT displayed even for partial payment');
        $this->assertEquals('commercial', $transaction->ewt_type);

        // Check payable status and balance
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
        $this->assertEquals(2715.00, round($payable->balance, 2), 'Outstanding: Net(4465) - Payment(1750) = 2715');
        $this->assertEquals(1985.00, round($payable->amount_paid, 2), 'Cash payment (1750) + EWT (235) = 1985');
    }
    
    /**
     * Test credit balance only payment (no cash/card/check)
     */
    public function test_credit_balance_only_payment()
    {
        $customer = CustomerAccount::factory()->create([
            'account_number' => 'TEST-009',
            'account_status' => 'active',
        ]);

        $payable = Payable::create([
            'customer_account_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'type' => 'connection_fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 3000.00,
            'amount_paid' => 0,
            'balance' => 3000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // Create credit balance
        $creditBalance = CreditBalance::create([
            'customer_account_id' => $customer->id,
            'account_number' => 'TEST-009',
            'credit_balance' => 2715.00,
        ]);

        // ONE-TIME EWT: 3000 × 5% = 150
        // Net balance: 3000 - 150 = 2850
        // Credit applied: 2715
        // Outstanding: 2850 - 2715 = 135
        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'ewt_type' => 'commercial',
            'ewt_amount' => 150.00,
            'payment_methods' => [], // NO payment methods - credit only
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(2715.00, $transaction->total_amount, 'Total = credit applied');
        $this->assertEquals(0, $transaction->amount_paid, 'No cash payment');
        $this->assertEquals(2715.00, $transaction->credit_applied);
        $this->assertEquals(150.00, round($transaction->ewt, 2));
        
        // Verify credit was deducted
        $creditBalance->refresh();
        $this->assertEquals(0, $creditBalance->credit_balance, 'Credit fully used');
        
        // Verify payable status
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
        $this->assertEquals(135.00, round($payable->balance, 2), 'Outstanding: 2850 - 2715');
    }
}
