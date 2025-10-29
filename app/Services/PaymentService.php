<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\CustomerAccount;
use App\Models\TransactionDetail;
use App\Models\PaymentType;
use App\Models\CreditBalance;
use App\Enums\ApplicationStatusEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PaymentTypeEnum;
use App\Enums\TransactionStatusEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class PaymentService
{
    protected TransactionNumberService $transactionNumberService;

    public function __construct(TransactionNumberService $transactionNumberService)
    {
        $this->transactionNumberService = $transactionNumberService;
    }
    /**
     * Process payment for customer account payables
     */
    public function processPayment(array $validatedData, CustomerAccount $customerAccount)
    {
        // Get selected payables only (if specified), otherwise all payables
        $payablesQuery = $customerAccount->payables()->with('definitions');
        
        if (!empty($validatedData['selected_payable_ids'])) {
            $payablesQuery->whereIn('id', $validatedData['selected_payable_ids']);
        }
        
        $payables = $payablesQuery->get();
        
        if ($payables->isEmpty()) {
            throw new \Exception('No payables selected for payment.', 400);
        }

        // Calculate total amount due from payables (not individual definitions)
        // CRITICAL: Only use balance, never fall back to total_amount_due for paid items
        $totalAmountDue = 0;
        foreach ($payables as $payable) {
            // Use balance directly - it should always be set and accurate
            // For new/unpaid payables: balance = total_amount_due
            // For paid payables: balance = 0
            // For partially paid: balance = remaining amount
            $remainingBalance = floatval($payable->balance ?? 0);
            $totalAmountDue += $remainingBalance;
        }

        $totalPaymentAmount = collect($validatedData['payment_methods'] ?? [])->sum('amount');

        // Allow credit-only payments if use_credit_balance is true
        // Otherwise, require payment amount > 0
        $useCreditBalance = !empty($validatedData['use_credit_balance']) && $validatedData['use_credit_balance'] === true;
        
        if ($totalPaymentAmount <= 0 && !$useCreditBalance) {
            throw new \Exception('Payment amount must be greater than zero, or use credit balance.', 400);
        }

        // Validate Philippine banks for check and card payments
        foreach ($validatedData['payment_methods'] ?? [] as $payment) {
            if (in_array($payment['type'], [PaymentTypeEnum::CHECK, PaymentTypeEnum::CREDIT_CARD])) {
                if (!PaymentType::isValidPhilippineBank($payment['bank'])) {
                    throw new \Exception('Invalid Philippine bank selected: ' . $payment['bank'], 400);
                }
            }
        }

        return DB::transaction(function () use ($customerAccount, $payables, $validatedData, $totalAmountDue, $totalPaymentAmount) {
            // Get EWT information from validated data
            $ewtAmount = floatval($validatedData['ewt_amount'] ?? 0);
            $ewtType = $validatedData['ewt_type'] ?? null;
            
            // Adjust total amount due after EWT (customer pays less because of withholding tax)
            $totalAmountDueAfterEWT = round($totalAmountDue - $ewtAmount, 2);
            
            // Handle credit balance application if requested
            $creditApplied = 0;
            $creditBalance = null;
            
            if (!empty($validatedData['use_credit_balance']) && $validatedData['use_credit_balance'] === true) {
                // Always fetch fresh credit balance from database to ensure accuracy
                $creditBalance = $customerAccount->creditBalance()->lockForUpdate()->first();
                
                if ($creditBalance && $creditBalance->credit_balance > 0) {
                    // Calculate how much credit to apply based on CURRENT balance and amount due
                    // This ensures we use the most up-to-date balance, even if it changed since frontend loaded
                    $creditApplied = round(min($creditBalance->credit_balance, $totalAmountDueAfterEWT), 2);
                    
                    // Verify we have sufficient credit
                    if ($creditApplied <= 0) {
                        throw new \Exception('Insufficient credit balance available.', 400);
                    }
                    
                    // Note: Credit will be deducted after transaction is created for consistent source tracking
                } else {
                    throw new \Exception('No credit balance available for this customer.', 400);
                }
            }
            
            // Adjust total amount due after applying credit
            $adjustedAmountDue = round($totalAmountDueAfterEWT - $creditApplied, 2);
            // Total combined payment is what's actually collected (not including EWT which is withheld)
            $totalCombinedPayment = round($totalPaymentAmount + $creditApplied, 2);
            
            // Calculate change amount (overpayment that will go to credit balance)
            // Note: This is calculated before allocation, actual change will be known after
            // We'll update this field after allocation if there's remaining payment
            $changeAmount = 0;
            
            // Net collection is amount paid minus change (initially same as amount_paid)
            $netCollection = round($totalPaymentAmount, 2);
            
            // Generate OR number using TransactionNumberService
            $orNumberData = $this->transactionNumberService->generateNextOrNumber();
            $orNumber = $orNumberData['or_number'];
            $seriesId = $orNumberData['series_id'];

            // Create main transaction record
            $transaction = Transaction::create([
                'transactionable_type' => CustomerAccount::class,
                'transactionable_id' => $customerAccount->id,
                'transaction_series_id' => $seriesId,
                'or_number' => $orNumber,
                'is_manual_or_number' => false,
                'or_date' => now(),
                'total_amount' => $totalCombinedPayment, // Include credit applied
                'amount_paid' => $totalPaymentAmount, // Actual cash/check/card collected
                'credit_applied' => $creditApplied, // Credit balance used
                'change_amount' => $changeAmount, // Will be updated if there's overpayment
                'net_collection' => $netCollection, // Will be updated if there's change
                'description' => $this->getPaymentDescription($totalPaymentAmount, $adjustedAmountDue, $creditApplied, $ewtAmount, $ewtType),
                'cashier' => Auth::user()->name ?? 'System',
                'account_number' => $customerAccount->account_number,
                'account_name' => $customerAccount->account_name,
                'meter_number' => null, // To be assigned after energization
                'meter_status' => 'Pending Installation',
                'address' => $customerAccount->barangay ? $customerAccount->barangay->name : 'N/A',
                'payment_mode' => $totalCombinedPayment >= $totalAmountDue ? 'Full Payment' : 'Partial Payment',
                'payment_area' => 'Office',
                'status' => TransactionStatusEnum::COMPLETED,
                'quantity' => $payables->sum(function ($payable) {
                    return $payable->definitions->sum('quantity');
                }),
                'ewt' => $ewtAmount,
                'ewt_type' => $ewtType,
            ]);

            // Deduct credit from customer's balance (now that we have transaction ID)
            if ($creditApplied > 0 && $creditBalance) {
                $creditBalance->deductCredit(
                    $creditApplied,
                    'applied_to_transaction_' . $transaction->id
                );
            }

            // Allocate payment across payables (combined: credit + cash/check/card + EWT)
            // The full amount to allocate includes EWT since it's part of settling the bill
            $totalPaymentForAllocation = round($totalCombinedPayment + $ewtAmount, 2);
            $allocationResult = $this->allocatePaymentToPayables($payables, $totalPaymentForAllocation);
            $remainingPayment = round($allocationResult['remaining_payment'], 2);

            // Create transaction details from payables (not individual definitions)
            foreach ($allocationResult['allocations'] as $allocation) {
                if ($allocation['amount_allocated'] > 0) {
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'transaction' => $allocation['payable']->customer_payable,
                        'transaction_code' => 'PAY-' . $allocation['payable']->id,
                        'amount' => $allocation['payable']->total_amount_due,
                        'unit' => 'item',
                        'quantity' => 1,
                        'total_amount' => $allocation['amount_allocated'], // Amount actually paid for this payable
                        'bill_month' => now()->format('Y-m'),
                    ]);
                }
            }

            // Create payment type records (only for non-zero amounts)
            foreach ($validatedData['payment_methods'] as $payment) {
                // Skip payment methods with zero amount
                if (floatval($payment['amount']) <= 0) {
                    continue;
                }
                
                $paymentData = [
                    'transaction_id' => $transaction->id,
                    'payment_type' => $payment['type'],
                    'amount' => $payment['amount'],
                ];

                if ($payment['type'] === PaymentTypeEnum::CHECK) {
                    $paymentData['bank'] = $payment['bank'];
                    $paymentData['check_number'] = $payment['check_number'];
                    $paymentData['check_issue_date'] = $payment['check_issue_date'];
                    $paymentData['check_expiration_date'] = $payment['check_expiration_date'];
                } elseif ($payment['type'] === PaymentTypeEnum::CREDIT_CARD) {
                    $paymentData['bank'] = $payment['bank'];
                    $paymentData['bank_transaction_number'] = $payment['bank_transaction_number'];
                }

                PaymentType::create($paymentData);
            }

            // Record credit balance usage as a payment type
            if ($creditApplied > 0) {
                PaymentType::create([
                    'transaction_id' => $transaction->id,
                    'payment_type' => PaymentTypeEnum::CREDIT_BALANCE,
                    'amount' => $creditApplied,
                ]);
            }

            // Handle overpayment as credit balance (use threshold to avoid floating point issues)
            if ($remainingPayment > 0.01) {
                // Get or create credit balance record for this customer
                $creditBalance = $customerAccount->creditBalance()->firstOrCreate(
                    ['customer_account_id' => $customerAccount->id],
                    [
                        'account_number' => $customerAccount->account_number,
                        'credit_balance' => 0,
                    ]
                );

                // Add the overpayment as credit
                $creditBalance->addCredit(
                    $remainingPayment,
                    'overpayment_from_transaction_' . $transaction->id
                );
                
                // Update transaction with change amount and net collection
                $transaction->update([
                    'change_amount' => $remainingPayment,
                    'net_collection' => round($totalPaymentAmount - $remainingPayment, 2),
                ]);
            }

            // Update customer account status based on payment completeness
            $this->updateCustomerAccountStatus($customerAccount, $payables);

            return $transaction;
        });
    }

    /**
     * Allocate payment across payables (not individual definitions)
     * PRIORITY-BASED: Pay each payable in full sequentially before moving to the next
     * 
     * Example:
     * - 4 payables worth ₱5,000 each (total ₱20,000)
     * - Customer pays ₱6,000
     * - Result: Payable 1 = paid (₱5,000), Payable 2 = partially paid (₱1,000), Payable 3 & 4 = unpaid
     */
    private function allocatePaymentToPayables($payables, $totalPayment): array
    {
        $allocations = [];
        $remainingPayment = $totalPayment;

        // Build list of payables with outstanding balances
        $payableItems = [];
        
        foreach ($payables as $payable) {
            // CRITICAL FIX: Only use balance for determining outstanding amount
            // If balance is 0 or not set, the payable is either fully paid or new
            // For new payables, balance should equal total_amount_due
            // For paid payables, balance should be 0
            // Never fall back to total_amount_due if balance is 0, as this would re-pay already paid items
            $outstandingAmount = floatval($payable->balance ?? 0);
            
            if ($outstandingAmount > 0) {
                $payableItems[] = [
                    'payable' => $payable,
                    'outstanding' => $outstandingAmount
                ];
            }
        }

        // PRIORITY-BASED ALLOCATION: Pay each payable in full before moving to the next
        foreach ($payableItems as $item) {
            if ($remainingPayment <= 0) {
                break; // No more payment to allocate
            }
            
            // Pay as much as possible for this payable (up to its outstanding amount)
            $amountToPay = min($remainingPayment, $item['outstanding']);
            $amountToPay = round($amountToPay, 2);
            
            if ($amountToPay > 0) {
                $allocations[] = [
                    'payable' => $item['payable'],
                    'amount_allocated' => $amountToPay
                ];
                
                // Update the payable
                $this->updatePayable($item['payable'], $amountToPay);
                $remainingPayment = round($remainingPayment - $amountToPay, 2);
            }
        }

        return [
            'allocations' => $allocations,
            'remaining_payment' => round(max(0, $remainingPayment), 2) // Ensure non-negative and rounded
        ];
    }

    /**
     * Update payable with payment (simplified - just update the payable record)
     */
    private function updatePayable($payable, $paymentAmount): void
    {
        $currentPaid = floatval($payable->amount_paid ?? 0);
        $totalAmount = floatval($payable->total_amount_due ?? 0);
        $newAmountPaid = round($currentPaid + $paymentAmount, 2);
        $newBalance = round(max(0, $totalAmount - $newAmountPaid), 2);

        $status = PayableStatusEnum::UNPAID;
        if ($newAmountPaid > 0 && $newBalance > 0) {
            $status = PayableStatusEnum::PARTIALLY_PAID;
        } elseif ($newBalance <= 0.01) { // Use threshold for floating point comparison
            $status = PayableStatusEnum::PAID;
            $newBalance = 0; // Ensure it's exactly 0
        }

        $payable->update([
            'amount_paid' => $newAmountPaid,
            'balance' => $newBalance,
            'status' => $status,
        ]);
    }

    /**
     * Update customer account status based on payment completeness
     */
    private function updateCustomerAccountStatus($customerAccount, $payables): void
    {
        $allPaid = true;
        
        foreach ($payables as $payable) {
            if ($payable->fresh()->status !== PayableStatusEnum::PAID) {
                $allPaid = false;
                break;
            }
        }

        if ($allPaid) {
            // Update related customer application if needed
            $customerApplication = $customerAccount->application;
            if ($customerApplication) {
                $customerApplication->update([
                    'status' => ApplicationStatusEnum::ACTIVE, // Or next appropriate status
                ]);
            }
        }
        // If not all paid, keep current status (still FOR_COLLECTION)
    }

    /**
     * Generate payment description based on payment type
     * 
     * @param float $cashPaymentAmount The actual cash/check/card payment amount (not including credit)
     * @param float $adjustedAmountDue The amount due after credit has been applied
     * @param float $creditApplied The amount of credit balance applied
     * @param float $ewtAmount The EWT amount deducted
     * @param string|null $ewtType The type of EWT (government or commercial)
     */
    private function getPaymentDescription($cashPaymentAmount, $adjustedAmountDue, $creditApplied = 0, $ewtAmount = 0, $ewtType = null): string
    {
        $description = "Payment for energization charges";
        
        if ($ewtAmount > 0 && $ewtType) {
            $ewtRate = $ewtType === 'government' ? '2.5%' : '5%';
            $description .= " (EWT {$ewtRate}: ₱" . number_format($ewtAmount, 2) . " withheld)";
        }
        
        if ($creditApplied > 0) {
            $description .= " (Credit applied: ₱" . number_format($creditApplied, 2) . ")";
        }
        
        // Check if cash payment covers the adjusted amount due
        if ($cashPaymentAmount >= $adjustedAmountDue) {
            if ($cashPaymentAmount > $adjustedAmountDue) {
                $overpayment = $cashPaymentAmount - $adjustedAmountDue;
                $description .= " (Overpayment: ₱" . number_format($overpayment, 2) . " credited)";
            }
            return $description;
        }
        
        // Partial payment
        $remaining = $adjustedAmountDue - $cashPaymentAmount;
        return "Partial payment for energization charges (Remaining: ₱" . number_format($remaining, 2) . ")" . 
               ($creditApplied > 0 ? " (Credit applied: ₱" . number_format($creditApplied, 2) . ")" : "") .
               ($ewtAmount > 0 ? " (EWT: ₱" . number_format($ewtAmount, 2) . " withheld)" : "");
    }

    /**
     * Get validation rules for payment processing
     */
    public function getValidationRules(): array
    {
        return [
            'selected_payable_ids' => 'nullable|array',
            'selected_payable_ids.*' => 'integer|exists:payables,id',
            'use_credit_balance' => 'nullable|boolean',
            'ewt_type' => 'nullable|string|in:government,commercial',
            'ewt_amount' => 'nullable|numeric|min:0',
            // Payment methods are required unless using credit balance only
            'payment_methods' => 'nullable|array',
            'payment_methods.*.type' => ['required', Rule::in([PaymentTypeEnum::CASH, PaymentTypeEnum::CHECK, PaymentTypeEnum::CREDIT_CARD])],
            'payment_methods.*.amount' => 'required|numeric|min:0',
            'payment_methods.*.bank' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|required_if:payment_methods.*.type,' . PaymentTypeEnum::CREDIT_CARD,
            'payment_methods.*.check_number' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK,
            'payment_methods.*.check_issue_date' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|date',
            'payment_methods.*.check_expiration_date' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|date|after:check_issue_date',
            'payment_methods.*.bank_transaction_number' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CREDIT_CARD,
        ];
    }
}