<?php

namespace App\Services;

use App\Enums\PayableCategoryEnum;
use App\Models\Payable;
use App\Models\PayablesDefinition;
use App\Models\CustomerAccount;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class PayableService
{
    protected ?int $customerAccountId = null;
    protected ?string $type = null;
    protected ?string $customerPayable = null;
    protected ?string $billMonth = null;
    protected ?float $totalAmountDue = null;
    protected ?string $status = null;
    protected float $amountPaid = 0;
    protected ?float $balance = null;
    protected array $definitions = [];
    protected ?string $payableCategory = null;

    /**
     * Create a new payable builder instance
     */
    public static function createPayable(): self
    {
        return new self();
    }

    /**
     * Set the customer account to bill
     */
    public function billTo(int $customerAccountId): self
    {
        $this->customerAccountId = $customerAccountId;
        return $this;
    }

    /**
     * Alias for billTo()
     */
    public function forCustomer(int $customerAccountId): self
    {
        return $this->billTo($customerAccountId);
    }

    /**
     * Set connection fee type
     */
    public function connectionFee(): self
    {
        $this->type = PayableTypeEnum::CONNECTION_FEE;
        $this->customerPayable = $this->customerPayable ?? 'Connection Fee';
        return $this;
    }

    /**
     * Set service fee type
     */
    public function serviceFee(): self
    {
        $this->type = PayableTypeEnum::SERVICE_FEE;
        $this->customerPayable = $this->customerPayable ?? 'Service Fee';
        return $this;
    }

    /**
     * Set meter deposit type
     */
    public function meterDeposit(): self
    {
        $this->type = PayableTypeEnum::METER_DEPOSIT;
        $this->customerPayable = $this->customerPayable ?? 'Meter Deposit';
        return $this;
    }

    /**
     * Set bill deposit type
     */
    public function billDeposit(): self
    {
        $this->type = PayableTypeEnum::BILL_DEPOSIT;
        $this->customerPayable = $this->customerPayable ?? 'Bill Deposit';
        return $this;
    }

    /**
     * Set security deposit type
     */
    public function securityDeposit(): self
    {
        $this->type = PayableTypeEnum::SECURITY_DEPOSIT;
        $this->customerPayable = $this->customerPayable ?? 'Security Deposit';
        return $this;
    }

    /**
     * Set monthly bill type
     */
    public function monthlyBill(): self
    {
        $this->type = PayableTypeEnum::MONTHLY_BILL;
        $this->customerPayable = $this->customerPayable ?? 'Monthly Bill';
        return $this;
    }

    /**
     * Set reconnection fee type
     */
    public function reconnectionFee(): self
    {
        $this->type = PayableTypeEnum::RECONNECTION_FEE;
        $this->customerPayable = $this->customerPayable ?? 'Reconnection Fee';
        return $this;
    }

    /**
     * Set installation fee type
     */
    public function installationFee(): self
    {
        $this->type = PayableTypeEnum::INSTALLATION_FEE;
        $this->customerPayable = $this->customerPayable ?? 'Installation Fee';
        return $this;
    }

    /**
     * Set inspection fee type
     */
    public function inspectionFee(): self
    {
        $this->type = PayableTypeEnum::INSPECTION_FEE;
        $this->customerPayable = $this->customerPayable ?? 'Inspection Fee';
        return $this;
    }

    /**
     * Set disconnection fee type
     */
    public function disconnectionFee(): self
    {
        $this->type = PayableTypeEnum::DISCONNECTION_FEE;
        $this->customerPayable = $this->customerPayable ?? 'Disconnection Fee';
        return $this;
    }

    /**
     * Set material cost type
     */
    public function materialCost(): self
    {
        $this->type = PayableTypeEnum::MATERIAL_COST;
        $this->customerPayable = $this->customerPayable ?? 'Material Cost';
        return $this;
    }

    /**
     * Set labor cost type
     */
    public function laborCost(): self
    {
        $this->type = PayableTypeEnum::LABOR_COST;
        $this->customerPayable = $this->customerPayable ?? 'Labor Cost';
        return $this;
    }

    /**
     * Set penalty type
     */
    public function penalty(): self
    {
        $this->type = PayableTypeEnum::PENALTY;
        $this->customerPayable = $this->customerPayable ?? 'Penalty';
        return $this;
    }

    /**
     * Set surcharge type
     */
    public function surcharge(): self
    {
        $this->type = PayableTypeEnum::SURCHARGE;
        $this->customerPayable = $this->customerPayable ?? 'Surcharge';
        return $this;
    }

    /**
     * Set ISNAP fee type
     */
    public function isnapFee(): self
    {
        $this->type = PayableTypeEnum::ISNAP_FEE;
        $this->customerPayable = $this->customerPayable ?? 'ISNAP Fee';
        return $this;
    }

    /**
     * Set other type
     */
    public function other(): self
    {
        $this->type = PayableTypeEnum::OTHER;
        $this->customerPayable = $this->customerPayable ?? 'Other';
        return $this;
    }

    /**
     * Set a custom payable type
     */
    public function type(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    /**
     * Set a custom payable name/description
     */
    public function customPayable(string $name): self
    {
        $this->customerPayable = $name;
        return $this;
    }

    /**
     * Set the payable category
     */
    public function category(string $category): self
    {
        // Validate that category is a valid PayableCategoryEnum value
        if (!in_array($category, [
            PayableCategoryEnum::ENERGIZATION,
            PayableCategoryEnum::MONTHLY_BILLING,
            PayableCategoryEnum::RECONNECTION,
            PayableCategoryEnum::ISNAP,
            PayableCategoryEnum::OTHER,
        ])) {
            throw new \InvalidArgumentException(
                "Invalid category '{$category}'. Must be one of: " . implode(', ', [
                    PayableCategoryEnum::ENERGIZATION,
                    PayableCategoryEnum::MONTHLY_BILLING,
                    PayableCategoryEnum::RECONNECTION,
                    PayableCategoryEnum::ISNAP,
                    PayableCategoryEnum::OTHER,
                ])
            );
        }

        $this->payableCategory = $category;
        return $this;
    }

    /**
     * Set category to energization
     */
    public function energization(): self
    {
        $this->payableCategory = PayableCategoryEnum::ENERGIZATION;
        return $this;
    }

    /**
     * Set category to monthly billing
     */
    public function monthlyBilling(): self
    {
        $this->payableCategory = PayableCategoryEnum::MONTHLY_BILLING;
        return $this;
    }

    /**
     * Set category to reconnection
     */
    public function reconnectionCategory(): self
    {
        $this->payableCategory = PayableCategoryEnum::RECONNECTION;
        return $this;
    }

    /**
     * Set category to ISNAP
     */
    public function isnapCategory(): self
    {
        $this->payableCategory = PayableCategoryEnum::ISNAP;
        return $this;
    }

    /**
     * Set the total amount due
     */
    public function totalAmountDue(float $amount): self
    {
        $this->totalAmountDue = $amount ?? 0.00;
        return $this;
    }

    /**
     * Alias for totalAmountDue()
     */
    public function amount(float $amount): self
    {
        return $this->totalAmountDue($amount);
    }

    /**
     * Alias for totalAmountDue()
     */
    public function total(float $amount): self
    {
        return $this->totalAmountDue($amount);
    }

    /**
     * Set bill month relative to current month
     * @param int $monthsAhead 1 = current month (default), 2 = next month, 3 = 2 months ahead, etc.
     */
    public function billMonth(?int $monthsAhead = 1): self
    {
        $monthsAhead = $monthsAhead ?? 1;
        $date = Carbon::now()->addMonths($monthsAhead - 1);
        $this->billMonth = $date->format('Ym');
        return $this;
    }

    /**
     * Set bill month to exact YYYYMM format
     */
    public function billMonthExact(string $yyyymm): self
    {
        $this->billMonth = $yyyymm;
        return $this;
    }

    /**
     * Alias for billMonth()
     */
    public function dueIn(?int $monthsAhead = 1): self
    {
        return $this->billMonth($monthsAhead);
    }

    /**
     * Alias for billMonth()
     */
    public function monthsAhead(?int $monthsAhead = 1): self
    {
        return $this->billMonth($monthsAhead);
    }

    /**
     * Set the payable status
     */
    public function status($status): self
    {
        // Validate that status is a valid PayableStatusEnum value
        if (!in_array($status, [
            PayableStatusEnum::UNPAID,
            PayableStatusEnum::PARTIALLY_PAID,
            PayableStatusEnum::PAID,
            PayableStatusEnum::CANCELLED,
            PayableStatusEnum::REFUNDED,
        ])) {
            throw new \InvalidArgumentException(
                "Invalid status '{$status}'. Must be one of: " . implode(', ', [
                    PayableStatusEnum::UNPAID,
                    PayableStatusEnum::PARTIALLY_PAID,
                    PayableStatusEnum::PAID,
                    PayableStatusEnum::CANCELLED,
                    PayableStatusEnum::REFUNDED,
                ])
            );
        }

        $this->status = $status;
        return $this;
    }

    /**
     * Set amount paid (optional, defaults to 0)
     */
    public function amountPaid(float $amount): self
    {
        $this->amountPaid = $amount;
        return $this;
    }

    /**
     * Add a single payable definition
     */
    public function addDefinition(array $definition): self
    {
        $this->definitions[] = $definition;
        return $this;
    }

    /**
     * Add multiple payable definitions
     */
    public function addDefinitions(array $definitions): self
    {
        $this->definitions = array_merge($this->definitions, $definitions);
        return $this;
    }

    /**
     * Validate the payable data without saving
     */
    public function validate(): bool
    {
        $data = $this->toArray();
        
        $validator = Validator::make($data, [
            'customer_account_id' => 'required|integer|exists:customer_accounts,id',
            'customer_payable' => 'required|string|max:255',
            'type' => 'nullable|string',
            'bill_month' => 'required|string|regex:/^\d{6}$/',
            'total_amount_due' => 'required|numeric|min:0|max:9999999999.99',
            'status' => 'required|string|in:' . implode(',', [
                PayableStatusEnum::UNPAID,
                PayableStatusEnum::PARTIALLY_PAID,
                PayableStatusEnum::PAID,
            ]),
            'amount_paid' => 'required|numeric|min:0',
            'balance' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Validate definitions if present
        if (!empty($this->definitions)) {
            foreach ($this->definitions as $index => $definition) {
                $defValidator = Validator::make($definition, [
                    'transaction_name' => 'required|string|max:255',
                    'transaction_code' => 'nullable|string|max:50',
                    'billing_month' => 'nullable|date',
                    'quantity' => 'required|integer|min:1',
                    'unit' => 'required|string|max:50',
                    'amount' => 'required|numeric|min:0',
                    'total_amount' => 'nullable|numeric|min:0', // Allow auto-calculation
                ]);

                if ($defValidator->fails()) {
                    throw new ValidationException($defValidator);
                }
            }
        }

        return true;
    }

    /**
     * Convert builder state to array
     */
    public function toArray(): array
    {
        // Apply defaults
        $billMonth = $this->billMonth ?? Carbon::now()->format('Ym');
        $status = $this->status ?? PayableStatusEnum::UNPAID;
        $totalAmountDue = $this->totalAmountDue ?? 0;
        $amountPaid = $this->amountPaid;
        $balance = $this->balance ?? ($totalAmountDue - $amountPaid);

        // Auto-assign type from customer_payable if not set
        $type = $this->type;
        if (!$type && $this->customerPayable) {
            $type = PayableTypeEnum::guessFromName($this->customerPayable);
        }

        return [
            'customer_account_id' => $this->customerAccountId,
            'customer_payable' => $this->customerPayable,
            'type' => $type,
            'payable_category' => $this->payableCategory,
            'bill_month' => $billMonth,
            'total_amount_due' => $totalAmountDue,
            'status' => $status,
            'amount_paid' => $amountPaid,
            'balance' => $balance,
        ];
    }

    /**
     * Save the payable to the database
     */
    public function save(): ?Payable
    {
        $this->validate();

        // Do not create payable if total_amount_due is 0 or less than 1
        if (($this->totalAmountDue ?? 0) < 1) {
            return null;
        }

        return DB::transaction(function () {
            $data = $this->toArray();
            
            // Create the payable
            $payable = Payable::create($data);

            // Create definitions if any
            if (!empty($this->definitions)) {
                foreach ($this->definitions as $definition) {
                    // Set default billing_month if not provided
                    if (!isset($definition['billing_month'])) {
                        $definition['billing_month'] = Carbon::createFromFormat('Ym', $data['bill_month'])->startOfMonth();
                    }

                    // Calculate total_amount if not provided
                    if (!isset($definition['total_amount']) && isset($definition['quantity'], $definition['amount'])) {
                        $definition['total_amount'] = $definition['quantity'] * $definition['amount'];
                    }

                    PayablesDefinition::create([
                        'payable_id' => $payable->id,
                        'billing_month' => $definition['billing_month'],
                        'quantity' => $definition['quantity'],
                        'unit' => $definition['unit'],
                        'amount' => $definition['amount'],
                        'total_amount' => $definition['total_amount'],
                    ]);
                }

                // Reload to get definitions
                $payable->load('definitions');
            }

            return $payable;
        });
    }

    /**
     * Alias for save()
     */
    public function saveAndReturn(): Payable
    {
        return $this->save();
    }

    /**
     * Create multiple payables in bulk for a customer
     */
    public static function createBulk(int $customerAccountId, callable $callback): array
    {
        $bulkHelper = new PayableBulkHelper($customerAccountId);
        
        // Call the callback to build multiple payables
        $callback($bulkHelper);

        // Save all payables in a transaction
        return DB::transaction(function () use ($bulkHelper) {
            $payables = [];
            foreach ($bulkHelper->getBuilders() as $builder) {
                $payables[] = $builder->save();
            }
            return $payables;
        });
    }
}

/**
 * Helper class for bulk payable creation
 */
class PayableBulkHelper
{
    protected int $customerAccountId;
    protected array $builders = [];

    public function __construct(int $customerAccountId)
    {
        $this->customerAccountId = $customerAccountId;
    }

    public function getBuilders(): array
    {
        return $this->builders;
    }

    public function __call($method, $args)
    {
        $builder = PayableService::createPayable()->billTo($this->customerAccountId);
        $builder->$method(...$args);
        $this->builders[] = $builder;
        return $builder;
    }
}
