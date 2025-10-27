<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\CustomerApplication;
use App\Models\Payable;
use App\Models\CreditBalance;
use App\Models\TransactionSeries;
use App\Enums\PayableStatusEnum;
use App\Enums\PaymentTypeEnum;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

class TransactionsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected PaymentService $paymentService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create and authenticate a user
        $this->user = User::factory()->create();
        Auth::login($this->user);
        
        // Create an active transaction series (required for payment processing)
        TransactionSeries::create([
            'series_name' => 'Test Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);
        
        // Use dependency injection to get PaymentService with its dependencies
        $this->paymentService = app(PaymentService::class);
    }

    /**
     * Test payment with cash only - full payment
     */
    public function test_payment_with_cash_only_full_payment()
    {
        $customer = $this->createCustomerWithPayable(5000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 5000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(5000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        // Check new audit fields
        $this->assertEquals(5000.00, $transaction->amount_paid);
        $this->assertEquals(0, $transaction->credit_applied);
        $this->assertEquals(0, $transaction->change_amount);
        $this->assertEquals(5000.00, $transaction->net_collection);
        
        // Check payment types
        $this->assertCount(1, $transaction->paymentTypes);
        $this->assertEquals(PaymentTypeEnum::CASH, $transaction->paymentTypes[0]->payment_type);
        $this->assertEquals(5000.00, $transaction->paymentTypes[0]->amount);
        
        // Check payable status
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
        $this->assertEquals(5000.00, $payable->amount_paid);
    }

    /**
     * Test payment with cash only - partial payment
     */
    public function test_payment_with_cash_only_partial_payment()
    {
        $customer = $this->createCustomerWithPayable(10000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 4000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(4000.00, $transaction->total_amount);
        $this->assertEquals('Partial Payment', $transaction->payment_mode);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
        $this->assertEquals(6000.00, $payable->balance);
        $this->assertEquals(4000.00, $payable->amount_paid);
    }

    /**
     * Test payment with card only - full payment
     */
    public function test_payment_with_card_only_full_payment()
    {
        $customer = $this->createCustomerWithPayable(8000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 8000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'CARD-123456789',
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(8000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        // Check payment types
        $paymentType = $transaction->paymentTypes->first();
        $this->assertEquals(PaymentTypeEnum::CREDIT_CARD, $paymentType->payment_type);
        $this->assertEquals(8000.00, $paymentType->amount);
        $this->assertEquals('BDO', $paymentType->bank);
        $this->assertEquals('CARD-123456789', $paymentType->bank_transaction_number);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test payment with check only - full payment
     */
    public function test_payment_with_check_only_full_payment()
    {
        $customer = $this->createCustomerWithPayable(12000.00);
        $payable = $customer->payables->first();

        $checkIssueDate = now()->format('Y-m-d');
        $checkExpirationDate = now()->addMonths(6)->format('Y-m-d');

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 12000.00,
                    'bank' => 'BPI',
                    'check_number' => 'CHK-987654321',
                    'check_issue_date' => $checkIssueDate,
                    'check_expiration_date' => $checkExpirationDate,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(12000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        // Check payment types
        $paymentType = $transaction->paymentTypes->first();
        $this->assertEquals(PaymentTypeEnum::CHECK, $paymentType->payment_type);
        $this->assertEquals(12000.00, $paymentType->amount);
        $this->assertEquals('BPI', $paymentType->bank);
        $this->assertEquals('CHK-987654321', $paymentType->check_number);
        $this->assertEquals($checkIssueDate, $paymentType->check_issue_date->format('Y-m-d'));
        $this->assertEquals($checkExpirationDate, $paymentType->check_expiration_date->format('Y-m-d'));
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test payment with credit balance only - full payment
     */
    public function test_payment_with_credit_balance_only_full_payment()
    {
        $customer = $this->createCustomerWithPayable(3000.00);
        $payable = $customer->payables->first();
        
        // Create credit balance greater than bill
        $creditBalance = CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 5000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [], // No cash/card/check payment - credit only
        ];

        // This should now succeed - credit-only payments are allowed
        $transaction = $this->paymentService->processPayment($paymentData, $customer);
        
        $this->assertNotNull($transaction);
        $this->assertEquals(0.00, $transaction->amount_paid, 'No cash/check/card payment');
        $this->assertEquals(3000.00, $transaction->credit_applied, 'Full amount paid with credit');
        $this->assertEquals(3000.00, $transaction->total_amount, 'Total equals credit applied');
        
        // Verify credit was deducted
        $creditBalance->refresh();
        $this->assertEquals(2000.00, $creditBalance->credit_balance, '5000 - 3000 = 2000 remaining');
        
        // Verify payable is paid
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test payment with credit balance only - partial coverage
     */
    public function test_payment_with_credit_balance_partial_coverage()
    {
        $customer = $this->createCustomerWithPayable(10000.00);
        $payable = $customer->payables->first();
        
        // Create credit balance less than bill
        $creditBalance = CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 3000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 0.01, // Minimum payment required
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        // Total should be cash + credit applied
        $this->assertEquals(3000.01, round($transaction->total_amount, 2));
        
        // Check that credit was applied
        $creditPayment = $transaction->paymentTypes->where('payment_type', PaymentTypeEnum::CREDIT_BALANCE)->first();
        $this->assertNotNull($creditPayment);
        $this->assertEquals(3000.00, $creditPayment->amount);
        
        // Check remaining credit balance
        $creditBalance->refresh();
        $this->assertEquals(0, round($creditBalance->credit_balance, 2));
        
        // Payable should still be partially paid
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
    }

    /**
     * Test combination: cash + card - full payment
     */
    public function test_payment_cash_and_card_full_payment()
    {
        $customer = $this->createCustomerWithPayable(15000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 8000.00,
                ],
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 7000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'TXN-111222333',
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(15000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        // Check new audit fields
        $this->assertEquals(15000.00, $transaction->amount_paid);
        $this->assertEquals(0, $transaction->credit_applied);
        $this->assertEquals(0, $transaction->change_amount);
        $this->assertEquals(15000.00, $transaction->net_collection);
        
        // Check both payment types exist
        $this->assertCount(2, $transaction->paymentTypes);
        
        $cashPayment = $transaction->paymentTypes->where('payment_type', PaymentTypeEnum::CASH)->first();
        $this->assertEquals(8000.00, $cashPayment->amount);
        
        $cardPayment = $transaction->paymentTypes->where('payment_type', PaymentTypeEnum::CREDIT_CARD)->first();
        $this->assertEquals(7000.00, $cardPayment->amount);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test combination: cash + check - partial payment
     */
    public function test_payment_cash_and_check_partial_payment()
    {
        $customer = $this->createCustomerWithPayable(20000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 5000.00,
                ],
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 8000.00,
                    'bank' => 'METROBANK',
                    'check_number' => 'CHK-555666',
                    'check_issue_date' => now()->format('Y-m-d'),
                    'check_expiration_date' => now()->addMonths(6)->format('Y-m-d'),
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(13000.00, $transaction->total_amount);
        $this->assertEquals('Partial Payment', $transaction->payment_mode);
        
        $this->assertCount(2, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
        $this->assertEquals(7000.00, $payable->balance);
    }

    /**
     * Test combination: card + check - full payment
     */
    public function test_payment_card_and_check_full_payment()
    {
        $customer = $this->createCustomerWithPayable(18000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 10000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'CARD-789',
                ],
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 8000.00,
                    'bank' => 'BPI',
                    'check_number' => 'CHK-789',
                    'check_issue_date' => now()->format('Y-m-d'),
                    'check_expiration_date' => now()->addMonths(6)->format('Y-m-d'),
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(18000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test combination: cash + card + check - full payment
     */
    public function test_payment_cash_card_and_check_full_payment()
    {
        $customer = $this->createCustomerWithPayable(25000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 10000.00,
                ],
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 8000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'CARD-ABC',
                ],
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 7000.00,
                    'bank' => 'BPI',
                    'check_number' => 'CHK-ABC',
                    'check_issue_date' => now()->format('Y-m-d'),
                    'check_expiration_date' => now()->addMonths(6)->format('Y-m-d'),
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(25000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        $this->assertCount(3, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test combination: credit balance + cash - full payment
     */
    public function test_payment_credit_balance_and_cash_full_payment()
    {
        $customer = $this->createCustomerWithPayable(10000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 3000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 7000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        // Total = 7000 (cash) + 3000 (credit)
        $this->assertEquals(10000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        // Should have 2 payment types: cash and credit_balance
        $this->assertCount(2, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test combination: credit balance + card - full payment
     */
    public function test_payment_credit_balance_and_card_full_payment()
    {
        $customer = $this->createCustomerWithPayable(12000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 4000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 8000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'CARD-XYZ',
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(12000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        $this->assertCount(2, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test combination: credit balance + check - partial payment
     */
    public function test_payment_credit_balance_and_check_partial_payment()
    {
        $customer = $this->createCustomerWithPayable(20000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 5000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 8000.00,
                    'bank' => 'BPI',
                    'check_number' => 'CHK-999',
                    'check_issue_date' => now()->format('Y-m-d'),
                    'check_expiration_date' => now()->addMonths(6)->format('Y-m-d'),
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        // Total = 8000 (check) + 5000 (credit)
        $this->assertEquals(13000.00, $transaction->total_amount);
        $this->assertEquals('Partial Payment', $transaction->payment_mode);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
        $this->assertEquals(7000.00, $payable->balance);
    }

    /**
     * Test combination: credit balance + cash + card - full payment with exact scenario
     * Bill: 14,000
     * Credit Balance: 2,040.62
     * Cash: 5,000
     * Card: 7,000
     * Expected Change: 40.62 (as new credit balance)
     */
    public function test_payment_credit_cash_and_card_with_change()
    {
        $customer = $this->createCustomerWithPayable(14000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 2040.62,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 5000.00,
                ],
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 7000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'CARD-CHANGE',
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        // Total combined = 5000 + 7000 + 2040.62 = 14,040.62
        $this->assertEquals(14040.62, round($transaction->total_amount, 2));
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        // Check new audit fields
        $this->assertEquals(12000.00, $transaction->amount_paid); // Cash + Card
        $this->assertEquals(2040.62, round($transaction->credit_applied, 2)); // Credit used
        $this->assertEquals(40.62, round($transaction->change_amount, 2)); // Overpayment
        $this->assertEquals(11959.38, round($transaction->net_collection, 2)); // amount_paid - change_amount
        
        // Should have 3 payment types: cash, card, and credit_balance
        $this->assertCount(3, $transaction->paymentTypes);
        
        // Check change was added back as credit
        $creditBalance = $customer->creditBalance()->first();
        $creditBalance->refresh();
        $this->assertEquals(40.62, round($creditBalance->credit_balance, 2), 'Change should be 40.62');
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
    }

    /**
     * Test combination: credit balance + cash + check - full payment
     */
    public function test_payment_credit_cash_and_check_full_payment()
    {
        $customer = $this->createCustomerWithPayable(18000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 3000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 8000.00,
                ],
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 7000.00,
                    'bank' => 'BPI',
                    'check_number' => 'CHK-COMBO',
                    'check_issue_date' => now()->format('Y-m-d'),
                    'check_expiration_date' => now()->addMonths(6)->format('Y-m-d'),
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(18000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        $this->assertCount(3, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test combination: credit balance + card + check - partial payment
     */
    public function test_payment_credit_card_and_check_partial_payment()
    {
        $customer = $this->createCustomerWithPayable(30000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 6000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 10000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'CARD-PARTIAL',
                ],
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 5000.00,
                    'bank' => 'BPI',
                    'check_number' => 'CHK-PARTIAL',
                    'check_issue_date' => now()->format('Y-m-d'),
                    'check_expiration_date' => now()->addMonths(6)->format('Y-m-d'),
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        // Total = 10000 + 5000 + 6000 = 21000
        $this->assertEquals(21000.00, $transaction->total_amount);
        $this->assertEquals('Partial Payment', $transaction->payment_mode);
        
        $this->assertCount(3, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
        $this->assertEquals(9000.00, $payable->balance);
    }

    /**
     * Test combination: credit balance + cash + card + check - full payment (all methods)
     */
    public function test_payment_all_methods_full_payment()
    {
        $customer = $this->createCustomerWithPayable(35000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 5000.00,
        ]);

        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 10000.00,
                ],
                [
                    'type' => PaymentTypeEnum::CREDIT_CARD,
                    'amount' => 12000.00,
                    'bank' => 'BDO',
                    'bank_transaction_number' => 'CARD-ALL',
                ],
                [
                    'type' => PaymentTypeEnum::CHECK,
                    'amount' => 8000.00,
                    'bank' => 'BPI',
                    'check_number' => 'CHK-ALL',
                    'check_issue_date' => now()->format('Y-m-d'),
                    'check_expiration_date' => now()->addMonths(6)->format('Y-m-d'),
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        // Total = 10000 + 12000 + 8000 + 5000 = 35000
        $this->assertEquals(35000.00, $transaction->total_amount);
        $this->assertEquals('Full Payment', $transaction->payment_mode);
        
        // Should have 4 payment types: cash, card, check, and credit_balance
        $this->assertCount(4, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
    }

    /**
     * Test overpayment creates credit balance
     */
    public function test_overpayment_creates_credit_balance()
    {
        $customer = $this->createCustomerWithPayable(5000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 6500.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(6500.00, $transaction->total_amount);
        
        // Check that overpayment was added as credit balance
        $creditBalance = $customer->creditBalance()->first();
        $this->assertNotNull($creditBalance);
        $this->assertEquals(1500.00, round($creditBalance->credit_balance, 2));
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test multiple payables - partial payment across multiple bills
     */
    public function test_multiple_payables_partial_payment()
    {
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'TEST-MULTI',
            'status' => 'verified',
        ]);

        // Create two payables
        $payable1 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Bill 1',
            'bill_month' => now()->subMonth()->format('Ym'),
            'total_amount_due' => 8000.00,
            'amount_paid' => 0,
            'balance' => 8000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable2 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Bill 2',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 6000.00,
            'amount_paid' => 0,
            'balance' => 6000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable1->id, $payable2->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 10000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(10000.00, $transaction->total_amount);
        
        // PRIORITY ALLOCATION: Pay first payable in full, then apply rest to second
        // Payable 1 (₱8,000) should be FULLY paid
        // Payable 2 (₱6,000) should be PARTIALLY paid with remaining ₱2,000
        $payable1->refresh();
        $payable2->refresh();
        
        // Payable 1 should be fully paid (₱8,000)
        $this->assertEquals(PayableStatusEnum::PAID, $payable1->status, 'First payable should be fully paid');
        $this->assertEquals(8000.00, $payable1->amount_paid);
        $this->assertEquals(0, $payable1->balance);
        
        // Payable 2 should be partially paid (₱2,000 out of ₱6,000)
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable2->status, 'Second payable should be partially paid');
        $this->assertEquals(2000.00, $payable2->amount_paid, 'Second payable should have ₱2,000 paid');
        $this->assertEquals(4000.00, $payable2->balance, 'Second payable should have ₱4,000 remaining');
        
        // Total paid should equal payment amount
        $totalPaid = $payable1->amount_paid + $payable2->amount_paid;
        $this->assertEquals(10000.00, round($totalPaid, 2));
    }

    /**
     * Test payment with government EWT (2.5%)
     */
    public function test_payment_with_government_ewt()
    {
        $customer = $this->createCustomerWithPayable(10000.00);
        $payable = $customer->payables->first();

        // EWT: 10000 * 2.5% = 250
        // Amount to pay: 10000 - 250 = 9750
        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'ewt_type' => 'government',
            'ewt_amount' => 250.00,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 9750.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(9750.00, $transaction->total_amount);
        $this->assertEquals(250.00, $transaction->ewt);
        $this->assertEquals('government', $transaction->ewt_type);
        $this->assertStringContainsString('EWT 2.5%', $transaction->description);
        $this->assertStringContainsString('₱250.00 withheld', $transaction->description);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test payment with commercial EWT (5%)
     */
    public function test_payment_with_commercial_ewt()
    {
        $customer = $this->createCustomerWithPayable(20000.00);
        $payable = $customer->payables->first();

        // EWT: 20000 * 5% = 1000
        // Amount to pay: 20000 - 1000 = 19000
        $paymentData = [
            'use_credit_balance' => false,
            'selected_payable_ids' => [$payable->id],
            'ewt_type' => 'commercial',
            'ewt_amount' => 1000.00,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 19000.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        $this->assertEquals(19000.00, $transaction->total_amount);
        $this->assertEquals(1000.00, $transaction->ewt);
        $this->assertEquals('commercial', $transaction->ewt_type);
        $this->assertStringContainsString('EWT 5%', $transaction->description);
        $this->assertStringContainsString('₱1,000.00 withheld', $transaction->description);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test payment with EWT and credit balance combination
     */
    public function test_payment_with_ewt_and_credit_balance()
    {
        $customer = $this->createCustomerWithPayable(15000.00);
        $payable = $customer->payables->first();
        
        CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 2000.00,
        ]);

        // EWT: 15000 * 5% = 750
        // After EWT: 15000 - 750 = 14250
        // After Credit: 14250 - 2000 = 12250
        $paymentData = [
            'use_credit_balance' => true,
            'selected_payable_ids' => [$payable->id],
            'ewt_type' => 'commercial',
            'ewt_amount' => 750.00,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 12250.00,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        $this->assertNotNull($transaction);
        // Total = cash + credit = 12250 + 2000 = 14250
        $this->assertEquals(14250.00, $transaction->total_amount);
        $this->assertEquals(750.00, $transaction->ewt);
        $this->assertEquals('commercial', $transaction->ewt_type);
        
        // Should have both EWT and credit info in description
        $this->assertStringContainsString('EWT', $transaction->description);
        $this->assertStringContainsString('Credit applied', $transaction->description);
        
        // Should have 2 payment types: cash and credit_balance
        $this->assertCount(2, $transaction->paymentTypes);
        
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
    }

    /**
     * Test validation: fails when no payment method and no credit balance
     */
    public function test_fails_when_no_payment_method_and_no_credit_balance()
    {
        $customer = $this->createCustomerWithPayable(1000.00);
        $payable = $customer->payables->first();

        $paymentData = [
            'selected_payable_ids' => [$payable->id],
            'use_credit_balance' => false,
            'payment_methods' => [],
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Payment amount must be greater than zero, or use credit balance');
        $this->paymentService->processPayment($paymentData, $customer);
    }

    /**
     * Test critical bug fix: Credit balance deduction with overpayment
     * Scenario: Customer has 9,800 PHP credit, owes 3,224.01 PHP, pays 1.00 PHP cash
     * Expected: Deduct 3,224.01 from credit (not entire 9,800), return 1.00 as overpayment
     */
    public function test_credit_deduction_with_overpayment_handling()
    {
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'TEST-CREDIT-BUG',
            'status' => 'verified',
        ]);

        // Create multiple payables totaling 3,224.01
        $payable1 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'amount_paid' => 0,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable2 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Service Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1224.01,
            'amount_paid' => 0,
            'balance' => 1224.01,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable3 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Meter Deposit',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 1000.00,
            'amount_paid' => 0,
            'balance' => 1000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // Create credit balance of 9,800
        $creditBalance = CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 9800.00,
        ]);

        $paymentData = [
            'selected_payable_ids' => [$payable1->id, $payable2->id, $payable3->id],
            'use_credit_balance' => true,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 1.00,
                ]
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        // Verify transaction amounts
        $this->assertEquals(1.00, $transaction->amount_paid, 'Cash payment');
        $this->assertEquals(3224.01, $transaction->credit_applied, 'Credit applied should be exact amount due');
        $this->assertEquals(3225.01, $transaction->total_amount, 'Total = cash + credit');
        $this->assertEquals(1.00, $transaction->change_amount, 'Overpayment returned');

        // Verify credit balance: 9800 - 3224.01 + 1.00 (overpayment back) = 6576.99
        $creditBalance->refresh();
        $this->assertEquals(6576.99, round($creditBalance->credit_balance, 2), 'Credit correctly calculated');
    }

    /**
     * Test: Insufficient credit uses all available credit
     */
    public function test_insufficient_credit_uses_all_available()
    {
        $customer = $this->createCustomerWithPayable(5000.00);
        $payable = $customer->payables->first();

        // Credit balance less than amount due
        $creditBalance = CreditBalance::create([
            'customer_application_id' => $customer->id,
            'account_number' => $customer->account_number,
            'credit_balance' => 1000.00,
        ]);

        $paymentData = [
            'selected_payable_ids' => [$payable->id],
            'use_credit_balance' => true,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 4000.00,
                ]
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        // Should use all 1000 credit + 4000 cash = 5000 total
        $this->assertEquals(5000.00, $transaction->total_amount);
        $this->assertEquals(1000.00, $transaction->credit_applied);
        $this->assertEquals('Full Payment', $transaction->payment_mode);

        // Credit balance should be depleted
        $creditBalance->refresh();
        $this->assertEquals(0, $creditBalance->credit_balance);

        // Payable should be fully paid
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(0, $payable->balance);
    }

    /**
     * Test: User scenario - ACC-477749
     * Scenario:
     * - 4 payables: Connection Fee (5000), Meter Deposit (2700), Installation Fee (4700), Bill Deposit (2800) = 15,200
     * - First payment: Exclude Connection Fee, pay 20,000 cash for other 3 payables (10,200)
     * - Expected: 9,800 credit balance, 3 payables paid, Connection Fee unpaid
     * - Second payment: Pay Connection Fee (5000) using credit balance (9,800)
     * - Expected: 4,800 credit remaining, all payables paid
     * - BUG: After second payment, some payables show as "partially paid" and credit is zero
     */
    public function test_user_scenario_multiple_payables_selective_payment_then_remaining()
    {
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'ACC-477749',
            'status' => 'verified',
        ]);

        // Create 4 payables
        $connectionFee = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $meterDeposit = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Meter Deposit',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 2700.00,
            'amount_paid' => 0,
            'balance' => 2700.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $installationFee = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Installation Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 4700.00,
            'amount_paid' => 0,
            'balance' => 4700.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $billDeposit = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Bill Deposit',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 2800.00,
            'amount_paid' => 0,
            'balance' => 2800.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // FIRST PAYMENT: Exclude Connection Fee, pay 20,000 cash for other 3 payables
        $firstPaymentData = [
            'selected_payable_ids' => [$meterDeposit->id, $installationFee->id, $billDeposit->id],
            'use_credit_balance' => false,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 20000.00,
                ]
            ],
        ];

        $transaction1 = $this->paymentService->processPayment($firstPaymentData, $customer);

        // Verify first payment
        $this->assertEquals(20000.00, $transaction1->total_amount);
        $this->assertEquals(9800.00, $transaction1->change_amount, 'Overpayment should be 9800');
        $this->assertEquals('Full Payment', $transaction1->payment_mode);

        // Verify credit balance created
        $creditBalance = $customer->creditBalance()->first();
        $this->assertNotNull($creditBalance);
        $this->assertEquals(9800.00, $creditBalance->credit_balance, 'Credit balance should be 9800');

        // Verify 3 payables are paid
        $meterDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $meterDeposit->status);
        $this->assertEquals(0, $meterDeposit->balance);

        $installationFee->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $installationFee->status);
        $this->assertEquals(0, $installationFee->balance);

        $billDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $billDeposit->status);
        $this->assertEquals(0, $billDeposit->balance);

        // Connection Fee should still be unpaid
        $connectionFee->refresh();
        $this->assertEquals(PayableStatusEnum::UNPAID, $connectionFee->status);
        $this->assertEquals(5000.00, $connectionFee->balance);

        // SECOND PAYMENT: Pay Connection Fee using credit balance
        $secondPaymentData = [
            'selected_payable_ids' => [$connectionFee->id],
            'use_credit_balance' => true,
            'payment_methods' => [],
        ];

        $transaction2 = $this->paymentService->processPayment($secondPaymentData, $customer);

        // Verify second payment
        $this->assertEquals(5000.00, $transaction2->total_amount, 'Total should be 5000');
        $this->assertEquals(5000.00, $transaction2->credit_applied, 'Credit applied should be 5000');
        $this->assertEquals('Full Payment', $transaction2->payment_mode);

        // Verify credit balance remaining
        $creditBalance->refresh();
        $this->assertEquals(4800.00, $creditBalance->credit_balance, 'Credit balance should be 4800 (9800 - 5000)');

        // Verify ALL payables are paid
        $connectionFee->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $connectionFee->status, 'Connection Fee should be paid');
        $this->assertEquals(0, $connectionFee->balance, 'Connection Fee balance should be 0');

        // VERIFY THE BUG: Other payables should STILL be paid (not partially paid)
        $meterDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $meterDeposit->status, 'Meter Deposit should still be paid');
        $this->assertEquals(0, $meterDeposit->balance, 'Meter Deposit balance should still be 0');

        $installationFee->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $installationFee->status, 'Installation Fee should still be paid');
        $this->assertEquals(0, $installationFee->balance, 'Installation Fee balance should still be 0');

        $billDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $billDeposit->status, 'Bill Deposit should still be paid');
        $this->assertEquals(0, $billDeposit->balance, 'Bill Deposit balance should still be 0');
    }

    /**
     * Test: BUG REPRODUCTION - User accidentally selects PAID payables in second payment
     * This reproduces the exact bug where paid payables get re-paid
     */
    public function test_bug_paid_payables_included_in_second_payment()
    {
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'ACC-BUG-TEST',
            'status' => 'verified',
        ]);

        // Create 4 payables
        $connectionFee = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $meterDeposit = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Meter Deposit',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 2700.00,
            'amount_paid' => 0,
            'balance' => 2700.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $installationFee = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Installation Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 4700.00,
            'amount_paid' => 0,
            'balance' => 4700.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $billDeposit = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Bill Deposit',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 2800.00,
            'amount_paid' => 0,
            'balance' => 2800.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // FIRST PAYMENT: Pay 3 payables (exclude Connection Fee)
        $firstPaymentData = [
            'selected_payable_ids' => [$meterDeposit->id, $installationFee->id, $billDeposit->id],
            'use_credit_balance' => false,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 20000.00,
                ]
            ],
        ];

        $transaction1 = $this->paymentService->processPayment($firstPaymentData, $customer);

        // Verify credit balance created
        $creditBalance = $customer->creditBalance()->first();
        $this->assertEquals(9800.00, $creditBalance->credit_balance);

        // Verify 3 payables are paid
        $meterDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $meterDeposit->status);
        $this->assertEquals(0, $meterDeposit->balance);

        // SECOND PAYMENT: User accidentally selects ALL 4 payables (including the 3 that are already paid)
        // This simulates a UI bug or user error
        $secondPaymentData = [
            'selected_payable_ids' => [$connectionFee->id, $meterDeposit->id, $installationFee->id, $billDeposit->id], // ALL 4!
            'use_credit_balance' => true,
            'payment_methods' => [],
        ];

        $transaction2 = $this->paymentService->processPayment($secondPaymentData, $customer);

        // EXPECTED: System should intelligently only process payables with outstanding balance
        // The credit should ONLY be applied to Connection Fee (5000), not to already-paid payables
        $this->assertEquals(5000.00, $transaction2->total_amount, 'Should only process Connection Fee');
        $this->assertEquals(5000.00, $transaction2->credit_applied, 'Should only apply 5000 credit');

        // Verify credit balance remaining
        $creditBalance->refresh();
        $this->assertEquals(4800.00, $creditBalance->credit_balance, 'Should have 4800 remaining (not 0)');

        // Verify Connection Fee is paid
        $connectionFee->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $connectionFee->status);
        $this->assertEquals(0, $connectionFee->balance);

        // CRITICAL: Verify other payables are STILL paid (not double-paid or partially paid)
        $meterDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $meterDeposit->status, 'Should still be paid');
        $this->assertEquals(2700.00, $meterDeposit->amount_paid, 'Should still show original payment amount');
        $this->assertEquals(0, $meterDeposit->balance, 'Should still have 0 balance');

        $installationFee->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $installationFee->status);
        $this->assertEquals(0, $installationFee->balance);

        $billDeposit->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $billDeposit->status);
        $this->assertEquals(0, $billDeposit->balance);
    }

    /**
     * Test: Priority-based allocation (sequential payment)
     * 4 payables worth ₱5,000 each, customer pays ₱6,000
     * Expected: Payable 1 = paid, Payable 2 = partially paid (₱1,000), Payables 3 & 4 = unpaid
     */
    public function test_priority_based_payment_allocation()
    {
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'ACC-PRIORITY-TEST',
            'status' => 'verified',
        ]);

        // Create 4 payables worth ₱5,000 each
        $payable1 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Connection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable2 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Meter Deposit',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable3 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Installation Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable4 = Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Bill Deposit',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        // Pay with ₱6,000 for all 4 payables (₱20,000 total due)
        $paymentData = [
            'selected_payable_ids' => [$payable1->id, $payable2->id, $payable3->id, $payable4->id],
            'use_credit_balance' => false,
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => 6000.00,
                ]
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customer);

        // Verify transaction
        $this->assertEquals(6000.00, $transaction->total_amount);
        $this->assertEquals('Partial Payment', $transaction->payment_mode);

        // PRIORITY ALLOCATION CHECK:
        // Payable 1 should be FULLY paid (₱5,000)
        $payable1->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable1->status, 'Payable 1 should be fully paid');
        $this->assertEquals(5000.00, $payable1->amount_paid);
        $this->assertEquals(0, $payable1->balance);

        // Payable 2 should be PARTIALLY paid (₱1,000 out of ₱5,000)
        $payable2->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable2->status, 'Payable 2 should be partially paid');
        $this->assertEquals(1000.00, $payable2->amount_paid, 'Payable 2 should have ₱1,000 paid');
        $this->assertEquals(4000.00, $payable2->balance, 'Payable 2 should have ₱4,000 remaining');

        // Payable 3 should be UNPAID (₱0 paid)
        $payable3->refresh();
        $this->assertEquals(PayableStatusEnum::UNPAID, $payable3->status, 'Payable 3 should be unpaid');
        $this->assertEquals(0, $payable3->amount_paid);
        $this->assertEquals(5000.00, $payable3->balance);

        // Payable 4 should be UNPAID (₱0 paid)
        $payable4->refresh();
        $this->assertEquals(PayableStatusEnum::UNPAID, $payable4->status, 'Payable 4 should be unpaid');
        $this->assertEquals(0, $payable4->amount_paid);
        $this->assertEquals(5000.00, $payable4->balance);
    }
    /**
     * Helper method to create customer with a single payable
     */
    protected function createCustomerWithPayable(float $amount): CustomerApplication
    {
        $customer = CustomerApplication::factory()->create([
            'account_number' => 'TEST-' . uniqid(),
            'status' => 'verified',
        ]);

        Payable::create([
            'customer_application_id' => $customer->id,
            'customer_payable' => 'Test Payable',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => $amount,
            'amount_paid' => 0,
            'balance' => $amount,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        return $customer->fresh(['payables']);
    }
}
