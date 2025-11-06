<?php

namespace Tests\Unit;

use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Models\CustomerAccount;
use App\Models\Payable;
use App\Models\PayablesDefinition;
use App\Services\PayableService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PayableServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CustomerAccount $customerAccount;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a customer account for testing
        $this->customerAccount = CustomerAccount::factory()->create();
    }

    public function test_it_can_create_a_simple_payable()
    {
        $payable = PayableService::createPayable()
            ->billTo($this->customerAccount->id)
            ->connectionFee()
            ->totalAmountDue(2500.00)
            ->save();

        $this->assertInstanceOf(Payable::class, $payable);
        $this->assertEquals($this->customerAccount->id, $payable->customer_account_id);
        $this->assertEquals('Connection Fee', $payable->customer_payable);
        $this->assertEquals(PayableTypeEnum::CONNECTION_FEE, $payable->type);
        $this->assertEquals(2500.00, $payable->total_amount_due);
        $this->assertEquals(PayableStatusEnum::UNPAID, $payable->status);
        $this->assertEquals(0, $payable->amount_paid);
        $this->assertEquals(2500.00, $payable->balance);
    }

    public function test_it_uses_payable_helper_function()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->meterDeposit()
            ->totalAmountDue(2700.00)
            ->save();

        $this->assertInstanceOf(Payable::class, $payable);
        $this->assertEquals(PayableTypeEnum::METER_DEPOSIT, $payable->type);
        $this->assertEquals(2700.00, $payable->total_amount_due);
    }

    public function test_it_sets_default_bill_month_to_current_month()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->connectionFee()
            ->totalAmountDue(2500.00)
            ->save();

        $expectedBillMonth = now()->format('Ym');
        $this->assertEquals($expectedBillMonth, $payable->bill_month);
    }

    public function test_it_can_set_bill_month_for_next_month()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->monthlyBill()
            ->totalAmountDue(1500.00)
            ->billMonth(2) // Next month
            ->save();

        $expectedBillMonth = now()->addMonth()->format('Ym');
        $this->assertEquals($expectedBillMonth, $payable->bill_month);
    }

    public function test_it_can_set_exact_bill_month()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->monthlyBill()
            ->totalAmountDue(1500.00)
            ->billMonthExact('202601')
            ->save();

        $this->assertEquals('202601', $payable->bill_month);
    }

    public function test_it_can_create_payable_with_custom_name()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->other()
            ->customPayable('Special Assessment Fee')
            ->totalAmountDue(500.00)
            ->save();

        $this->assertEquals('Special Assessment Fee', $payable->customer_payable);
        $this->assertEquals(PayableTypeEnum::OTHER, $payable->type);
    }

    public function test_it_validates_status_enum()
    {
        $this->expectException(\InvalidArgumentException::class);

        payable()
            ->billTo($this->customerAccount->id)
            ->connectionFee()
            ->totalAmountDue(2500.00)
            ->status('invalid_status')
            ->save();
    }

    public function test_it_can_create_payable_with_definitions()
    {
        $definitions = [
            [
                'transaction_name' => 'Labor',
                'transaction_code' => 'LAB001',
                'quantity' => 8,
                'unit' => 'hours',
                'amount' => 150.00,
                'total_amount' => 1200.00,
            ],
            [
                'transaction_name' => 'Materials',
                'transaction_code' => 'MAT001',
                'quantity' => 1,
                'unit' => 'lot',
                'amount' => 3500.00,
                'total_amount' => 3500.00,
            ],
        ];

        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->installationFee()
            ->totalAmountDue(4700.00)
            ->addDefinitions($definitions)
            ->save();

        $this->assertCount(2, $payable->definitions);
        $this->assertEquals('Labor', $payable->definitions[0]->transaction_name);
        $this->assertEquals('Materials', $payable->definitions[1]->transaction_name);
    }

    public function test_it_can_add_single_definition()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->materialCost()
            ->totalAmountDue(1500.00)
            ->addDefinition([
                'transaction_name' => 'Wire',
                'transaction_code' => 'WIRE001',
                'quantity' => 10,
                'unit' => 'meters',
                'amount' => 150.00,
                'total_amount' => 1500.00,
            ])
            ->save();

        $this->assertCount(1, $payable->definitions);
        $this->assertEquals('Wire', $payable->definitions[0]->transaction_name);
    }

    public function test_it_creates_all_payable_types()
    {
        $types = [
            ['method' => 'connectionFee', 'type' => PayableTypeEnum::CONNECTION_FEE],
            ['method' => 'serviceFee', 'type' => PayableTypeEnum::SERVICE_FEE],
            ['method' => 'meterDeposit', 'type' => PayableTypeEnum::METER_DEPOSIT],
            ['method' => 'billDeposit', 'type' => PayableTypeEnum::BILL_DEPOSIT],
            ['method' => 'securityDeposit', 'type' => PayableTypeEnum::SECURITY_DEPOSIT],
            ['method' => 'monthlyBill', 'type' => PayableTypeEnum::MONTHLY_BILL],
            ['method' => 'reconnectionFee', 'type' => PayableTypeEnum::RECONNECTION_FEE],
            ['method' => 'installationFee', 'type' => PayableTypeEnum::INSTALLATION_FEE],
            ['method' => 'inspectionFee', 'type' => PayableTypeEnum::INSPECTION_FEE],
            ['method' => 'disconnectionFee', 'type' => PayableTypeEnum::DISCONNECTION_FEE],
            ['method' => 'materialCost', 'type' => PayableTypeEnum::MATERIAL_COST],
            ['method' => 'laborCost', 'type' => PayableTypeEnum::LABOR_COST],
            ['method' => 'penalty', 'type' => PayableTypeEnum::PENALTY],
            ['method' => 'surcharge', 'type' => PayableTypeEnum::SURCHARGE],
            ['method' => 'isnapFee', 'type' => PayableTypeEnum::ISNAP_FEE],
            ['method' => 'other', 'type' => PayableTypeEnum::OTHER],
        ];

        foreach ($types as $typeData) {
            $payable = payable()
                ->billTo($this->customerAccount->id)
                ->{$typeData['method']}()
                ->totalAmountDue(1000.00)
                ->save();

            $this->assertEquals($typeData['type'], $payable->type);
        }
    }

    public function test_it_can_create_bulk_payables()
    {
        $payables = PayableService::createBulk($this->customerAccount->id, function($builder) {
            $builder->connectionFee()->totalAmountDue(2500.00);
            $builder->meterDeposit()->totalAmountDue(2700.00);
            $builder->installationFee()->totalAmountDue(4700.00);
        });

        $this->assertCount(3, $payables);
        $this->assertEquals(PayableTypeEnum::CONNECTION_FEE, $payables[0]->type);
        $this->assertEquals(PayableTypeEnum::METER_DEPOSIT, $payables[1]->type);
        $this->assertEquals(PayableTypeEnum::INSTALLATION_FEE, $payables[2]->type);
    }

    public function test_it_creates_bulk_payables_in_transaction()
    {
        // This should rollback if any payable fails
        $this->expectException(ValidationException::class);

        PayableService::createBulk(99999, function($builder) { // Invalid customer account
            $builder->connectionFee()->totalAmountDue(2500.00);
            $builder->meterDeposit()->totalAmountDue(2700.00);
        });

        // No payables should be created due to transaction rollback
        $this->assertEquals(0, Payable::count());
    }

    public function test_it_can_use_method_aliases()
    {
        $payable = payable()
            ->forCustomer($this->customerAccount->id) // Alias for billTo
            ->connectionFee()
            ->amount(2500.00) // Alias for totalAmountDue
            ->save();

        $this->assertEquals($this->customerAccount->id, $payable->customer_account_id);
        $this->assertEquals(2500.00, $payable->total_amount_due);

        $payable2 = payable()
            ->billTo($this->customerAccount->id)
            ->monthlyBill()
            ->total(1500.00) // Another alias for totalAmountDue
            ->dueIn(3) // Alias for billMonth(3)
            ->save();

        $expectedBillMonth = now()->addMonths(2)->format('Ym');
        $this->assertEquals($expectedBillMonth, $payable2->bill_month);
    }

    public function test_it_validates_customer_account_exists()
    {
        $this->expectException(ValidationException::class);

        payable()
            ->billTo(99999) // Non-existent customer account
            ->connectionFee()
            ->totalAmountDue(2500.00)
            ->save();
    }

    public function test_it_validates_required_fields()
    {
        $this->expectException(ValidationException::class);

        payable()
            // Missing billTo() - customer_account_id is required
            ->connectionFee()
            ->totalAmountDue(2500.00)
            ->save();
    }

    public function test_it_can_convert_to_array_without_saving()
    {
        $builder = payable()
            ->billTo($this->customerAccount->id)
            ->connectionFee()
            ->totalAmountDue(2500.00);

        $data = $builder->toArray();

        $this->assertIsArray($data);
        $this->assertEquals($this->customerAccount->id, $data['customer_account_id']);
        $this->assertEquals(PayableTypeEnum::CONNECTION_FEE, $data['type']);
        $this->assertEquals(2500.00, $data['total_amount_due']);
        $this->assertEquals(PayableStatusEnum::UNPAID, $data['status']);
    }

    public function test_it_calculates_balance_automatically()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->connectionFee()
            ->totalAmountDue(2500.00)
            ->amountPaid(500.00)
            ->save();

        $this->assertEquals(2000.00, $payable->balance);
    }

    public function test_it_auto_assigns_type_from_payable_name()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->customPayable('Connection Fee Payment')
            ->totalAmountDue(2500.00)
            ->save();

        // Should auto-detect as CONNECTION_FEE from the name
        $this->assertEquals(PayableTypeEnum::CONNECTION_FEE, $payable->type);
    }

    public function test_it_creates_definitions_with_auto_calculated_total()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->materialCost()
            ->totalAmountDue(1500.00)
            ->addDefinition([
                'transaction_name' => 'Wire',
                'transaction_code' => 'WIRE001', // transaction_code is required
                'quantity' => 10,
                'unit' => 'meters',
                'amount' => 150.00,
                // total_amount will be auto-calculated
            ])
            ->save();

        $this->assertEquals(1500.00, $payable->definitions[0]->total_amount);
    }

    public function test_it_sets_default_billing_month_for_definitions()
    {
        $payable = payable()
            ->billTo($this->customerAccount->id)
            ->materialCost()
            ->totalAmountDue(1500.00)
            ->billMonthExact('202601')
            ->addDefinition([
                'transaction_name' => 'Wire',
                'transaction_code' => 'WIRE001', // transaction_code is required
                'quantity' => 10,
                'unit' => 'meters',
                'amount' => 150.00,
                'total_amount' => 1500.00,
            ])
            ->save();

        $expectedDate = \Carbon\Carbon::createFromFormat('Ym', '202601')->startOfMonth();
        $this->assertEquals(
            $expectedDate->format('Y-m-d'),
            $payable->definitions[0]->billing_month->format('Y-m-d')
        );
    }

    public function test_bulk_creation_allows_chaining_with_definitions()
    {
        $materialDefinitions = [
            [
                'transaction_name' => 'Wire',
                'transaction_code' => 'WIRE001',
                'quantity' => 10,
                'unit' => 'meters',
                'amount' => 150.00,
                'total_amount' => 1500.00,
            ],
        ];

        $payables = PayableService::createBulk($this->customerAccount->id, function($builder) use ($materialDefinitions) {
            $builder->billDeposit()->totalAmountDue(1000.00);
            $builder->materialCost()->totalAmountDue(1500.00)->addDefinitions($materialDefinitions);
            $builder->laborCost()->totalAmountDue(1200.00);
        });

        $this->assertCount(3, $payables);
        $this->assertCount(1, $payables[1]->definitions);
        $this->assertEquals('Wire', $payables[1]->definitions[0]->transaction_name);
    }

    public function test_it_validates_definition_fields()
    {
        $this->expectException(ValidationException::class);

        payable()
            ->billTo($this->customerAccount->id)
            ->materialCost()
            ->totalAmountDue(1500.00)
            ->addDefinition([
                'transaction_name' => 'Wire',
                // Missing required fields: quantity, unit, amount, total_amount
            ])
            ->save();
    }
}
