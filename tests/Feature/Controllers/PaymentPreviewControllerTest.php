<?php

namespace Tests\Feature\Controllers;

use App\Models\CustomerAccount;
use App\Models\Payable;
use App\Models\TransactionSeries;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class PaymentPreviewControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected CustomerAccount $customerAccount;

    protected function setUp(): void
    {
        parent::setUp();

        // Bypass middleware for these tests (we're testing calculation logic, not authorization)
        $this->withoutMiddleware();

        // Create and authenticate a user
        $this->user = User::factory()->create();
        Auth::login($this->user);

        // Create an active transaction series assigned to the user
        TransactionSeries::create([
            'series_name' => 'Test Series',
            'prefix' => 'CR',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'assigned_to_user_id' => $this->user->id,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        // Create a customer account
        $this->customerAccount = CustomerAccount::factory()->create([
            'account_number' => 'ACC-TEST-001',
        ]);
    }

    public function test_payment_preview_returns_correct_calculation_for_full_payment(): void
    {
        // Create taxable payables
        $payable1 = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Connection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'type' => 'connection_fee',
            'status' => 'unpaid',
        ]);

        $payable2 = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Reconnection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 3000.00,
            'amount_paid' => 0,
            'balance' => 3000.00,
            'type' => 'reconnection_fee',
            'status' => 'unpaid',
        ]);

        // ONE-TIME EWT:
        // Payable1: 5000 × 0.05 = 250 EWT, Net = 4750
        // Payable2: 3000 × 0.05 = 150 EWT, Net = 2850
        // Total EWT: 400, Total Net: 7600
        $response = $this->actingAs($this->user)->postJson(
            route('transactions.payment-preview', $this->customerAccount->id),
            [
                'payment_methods' => [
                    ['type' => 'cash', 'amount' => 7600.00],
                ],
                'selected_payable_ids' => [$payable1->id, $payable2->id],
                'use_credit_balance' => false,
                'credit_amount' => 0,
                'ewt_type' => 'commercial',
                'ewt_amount' => 400.00,
            ]
        );

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'preview' => [
                'cash_payment',
                'credit_applied',
                'total_payment',
                'ewt_type',
                'ewt_rate',
                'actual_ewt_amount',
                'taxable_balance_paid',
                'subtotal_before_ewt',
                'subtotal_after_ewt',
                'difference',
                'is_overpayment',
                'change_or_balance',
            ],
        ]);

        $preview = $response->json('preview');

        // Verify ONE-TIME EWT calculation
        $this->assertEquals(7600.00, $preview['cash_payment']);
        $this->assertEquals(0, $preview['credit_applied']);
        $this->assertEquals(7600.00, $preview['total_payment']);
        $this->assertEquals('commercial', $preview['ewt_type']);
        $this->assertEquals(0.05, $preview['ewt_rate']);
        $this->assertEquals(7600.00, $preview['taxable_balance_paid'], 'Sum of cash payments');
        $this->assertEquals(400.00, $preview['actual_ewt_amount'], 'Total EWT: 250 + 150');
        $this->assertEquals(8000.00, $preview['subtotal_before_ewt']);
        $this->assertEquals(7600.00, $preview['subtotal_after_ewt'], '8000 - 400 EWT');
        $this->assertTrue($preview['is_overpayment'] || $preview['difference'] == 0, 'Exact payment');
        $this->assertEquals(0, round($preview['change_or_balance'], 2), 'No change, exact payment');
    }

    public function test_payment_preview_recalculates_ewt_for_partial_payment(): void
    {
        // Create 4 payables totaling 15,200
        $payable1 = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Connection Fee 1',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 4700.00,
            'amount_paid' => 0,
            'balance' => 4700.00,
            'type' => 'connection_fee',
            'status' => 'unpaid',
        ]);

        $payable2 = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Reconnection Fee 1',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 3500.00,
            'amount_paid' => 0,
            'balance' => 3500.00,
            'type' => 'reconnection_fee',
            'status' => 'unpaid',
        ]);

        $payable3 = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Connection Fee 2',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 4000.00,
            'amount_paid' => 0,
            'balance' => 4000.00,
            'type' => 'connection_fee',
            'status' => 'unpaid',
        ]);

        $payable4 = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Reconnection Fee 2',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 3000.00,
            'amount_paid' => 0,
            'balance' => 3000.00,
            'type' => 'reconnection_fee',
            'status' => 'unpaid',
        ]);

        // ONE-TIME EWT: 
        // Payable1: 4700 × 0.05 = 235 EWT, Net = 4465
        // Payment of 5000 covers: Payable1 fully (4465) + 535 to Payable2
        // Total EWT displayed: 235 (full EWT from Payable1)
        // Total EWT for ALL payables: 760 (but only showing what's being paid)
        $response = $this->actingAs($this->user)->postJson(
            route('transactions.payment-preview', $this->customerAccount->id),
            [
                'payment_methods' => [
                    ['type' => 'cash', 'amount' => 5000.00],
                ],
                'selected_payable_ids' => [$payable1->id, $payable2->id, $payable3->id, $payable4->id],
                'use_credit_balance' => false,
                'credit_amount' => 0,
                'ewt_type' => 'commercial',
                'ewt_amount' => 760.00, // Frontend estimate for all payables
            ]
        );

        $response->assertStatus(200);

        $preview = $response->json('preview');

        // Verify ONE-TIME EWT calculation
        $this->assertEquals(5000.00, $preview['cash_payment']);
        $this->assertEquals('commercial', $preview['ewt_type']);
        // Payment covers Payable1 (4700) fully + partial Payable2 (3500)
        // Payable1 EWT: 235, Payable2 EWT: 175
        // But payment only covers Payable1 fully + 535 of Payable2
        // Display FULL EWT for both being paid: 235 + 175 = 410
        $this->assertGreaterThanOrEqual(235.00, round($preview['actual_ewt_amount'], 2), 'At least Payable1 EWT');
        $this->assertEquals(15200.00, $preview['subtotal_before_ewt'], 'Total of all 4 payables');
        $this->assertFalse($preview['is_overpayment'], 'Partial payment');
        $this->assertGreaterThan(0, $preview['change_or_balance'], 'Has balance due');
    }

    public function test_payment_preview_handles_credit_balance(): void
    {
        $payable = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Connection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'type' => 'connection_fee',
            'status' => 'unpaid',
        ]);

        // ONE-TIME EWT: 5000 × 0.05 = 250 EWT
        // Net balance: 5000 - 250 = 4750
        // Payment: 2000 cash + 2750 credit = 4750 (exact payment)
        $response = $this->actingAs($this->user)->postJson(
            route('transactions.payment-preview', $this->customerAccount->id),
            [
                'payment_methods' => [
                    ['type' => 'cash', 'amount' => 2000.00],
                ],
                'selected_payable_ids' => [$payable->id],
                'use_credit_balance' => true,
                'credit_amount' => 2750.00,
                'ewt_type' => 'commercial',
                'ewt_amount' => 250.00,
            ]
        );

        $response->assertStatus(200);

        $preview = $response->json('preview');

        $this->assertEquals(2000.00, $preview['cash_payment']);
        $this->assertEquals(2750.00, $preview['credit_applied']);
        $this->assertEquals(4750.00, $preview['total_payment']);
        $this->assertEquals(250.00, $preview['actual_ewt_amount'], 'One-time EWT: 5000 × 0.05');
        $this->assertEquals(4750.00, $preview['subtotal_after_ewt'], '5000 - 250 EWT');
        $this->assertTrue($preview['is_overpayment'] || $preview['difference'] == 0, 'Exact payment');
        $this->assertEquals(0, round($preview['change_or_balance'], 2), 'No balance due');
    }
    
    /**
     * Test payment preview with credit balance only (no cash/card/check)
     */
    public function test_payment_preview_with_credit_balance_only(): void
    {
        $payable = Payable::create([
            'customer_account_id' => $this->customerAccount->id,
            'customer_payable' => 'Connection Fee',
            'bill_month' => now()->format('Ym'),
            'total_amount_due' => 5000.00,
            'amount_paid' => 0,
            'balance' => 5000.00,
            'type' => 'connection_fee',
            'status' => 'unpaid',
        ]);

        // ONE-TIME EWT: 5000 × 0.05 = 250 EWT
        // Net balance: 5000 - 250 = 4750
        // Credit only: 3000 (partial payment)
        // Remaining: 4750 - 3000 = 1750
        $response = $this->actingAs($this->user)->postJson(
            route('transactions.payment-preview', $this->customerAccount->id),
            [
                'payment_methods' => [], // NO payment methods
                'selected_payable_ids' => [$payable->id],
                'use_credit_balance' => true,
                'credit_amount' => 3000.00,
                'ewt_type' => 'commercial',
                'ewt_amount' => 250.00,
            ]
        );

        $response->assertStatus(200);

        $preview = $response->json('preview');

        $this->assertEquals(0, $preview['cash_payment'], 'No cash payment');
        $this->assertEquals(3000.00, $preview['credit_applied']);
        $this->assertEquals(3000.00, $preview['total_payment']);
        $this->assertEquals(250.00, $preview['actual_ewt_amount'], 'Full EWT displayed');
        $this->assertFalse($preview['is_overpayment'], 'Partial payment');
        $this->assertEquals(1750.00, round($preview['change_or_balance'], 2), 'Balance due: 4750 - 3000');
    }
}
