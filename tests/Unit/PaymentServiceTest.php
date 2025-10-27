<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\PaymentService;
use App\Models\CustomerApplication;
use App\Models\Payable;
use App\Models\CreditBalance;
use App\Enums\PayableStatusEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

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
        // Create customer application
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'TEST-001',
            'status' => 'verified', // Any status should work now
        ]);

        // Create payable with 14,000 bill
        $payable = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Test Bill',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 14000.00,
            'amount_paid' => 0,
            'balance' => 14000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // Create credit balance
        $creditBalance = CreditBalance::create([
            'customer_application_id' => $customer->id,
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

        $service = new PaymentService();
        $transaction = $service->processPayment($paymentData, $customer);

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
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'TEST-002',
            'status' => 'verified',
        ]);

        $payable = Payable::create([
            'customer_application_id' => $customer->id,
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

        $service = new PaymentService();
        $transaction = $service->processPayment($paymentData, $customer);

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
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'TEST-003',
            'status' => 'verified',
        ]);

        $payable = Payable::create([
            'customer_application_id' => $customer->id,
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

        $service = new PaymentService();
        $transaction = $service->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(5000.00, $transaction->total_amount);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
    }
}
