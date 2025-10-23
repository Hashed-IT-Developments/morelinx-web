<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\CustomerApplication;
use App\Models\TransactionDetail;
use App\Models\PaymentType;
use App\Models\CreditBalance;
use App\Enums\ApplicationStatusEnum;
use App\Enums\PaymentTypeEnum;
use App\Enums\TransactionStatusEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class PaymentService
{
    /**
     * Process payment for customer application payables
     */
    public function processPayment(array $validatedData, CustomerApplication $customerApplication)
    {
        // Validate that customer application has payables
        if ($customerApplication->status !== ApplicationStatusEnum::FOR_COLLECTION) {
            throw new \Exception('Customer application is not ready for collection.', 400);
        }

        // Get selected payables only (if specified), otherwise all payables
        $payablesQuery = $customerApplication->payables()->with('definitions');
        
        if (!empty($validatedData['selected_payable_ids'])) {
            $payablesQuery->whereIn('id', $validatedData['selected_payable_ids']);
        }
        
        $payables = $payablesQuery->get();
        
        if ($payables->isEmpty()) {
            throw new \Exception('No payables selected for payment.', 400);
        }

        // Calculate total amount due from payables (not individual definitions)
        $totalAmountDue = 0;
        foreach ($payables as $payable) {
            $remainingBalance = $payable->balance > 0 
                ? $payable->balance 
                : floatval($payable->total_amount_due ?? 0);
            $totalAmountDue += $remainingBalance;
        }

        $totalPaymentAmount = collect($validatedData['payment_methods'])->sum('amount');

        // Allow partial payments and overpayments - no strict validation
        if ($totalPaymentAmount <= 0) {
            throw new \Exception('Payment amount must be greater than zero.', 400);
        }

        // Validate Philippine banks for check and card payments
        foreach ($validatedData['payment_methods'] as $payment) {
            if (in_array($payment['type'], [PaymentTypeEnum::CHECK, PaymentTypeEnum::CREDIT_CARD])) {
                if (!PaymentType::isValidPhilippineBank($payment['bank'])) {
                    throw new \Exception('Invalid Philippine bank selected: ' . $payment['bank'], 400);
                }
            }
        }

        return DB::transaction(function () use ($customerApplication, $payables, $validatedData, $totalAmountDue, $totalPaymentAmount) {
            // Handle credit balance application if requested
            $creditApplied = 0;
            $creditBalance = null;
            
            if (!empty($validatedData['use_credit_balance']) && $validatedData['use_credit_balance'] === true) {
                $creditBalance = $customerApplication->creditBalance;
                
                if ($creditBalance && $creditBalance->credit_balance > 0) {
                    // Calculate how much credit to apply (min of available credit or amount due)
                    $creditApplied = min($creditBalance->credit_balance, $totalAmountDue);
                    
                    // Deduct the credit from customer's balance
                    $creditBalance->deductCredit(
                        $creditApplied,
                        'applied_to_transaction_' . time()
                    );
                }
            }
            
            // Adjust total amount due after applying credit
            $adjustedAmountDue = $totalAmountDue - $creditApplied;
            $totalCombinedPayment = $totalPaymentAmount + $creditApplied;
            
            // Generate OR number
            $orNumber = 'OR-' . str_pad(Transaction::count() + 1, 6, '0', STR_PAD_LEFT);

            // Create main transaction record
            $transaction = Transaction::create([
                'transactionable_type' => CustomerApplication::class,
                'transactionable_id' => $customerApplication->id,
                'or_number' => $orNumber,
                'or_date' => now(),
                'total_amount' => $totalCombinedPayment, // Include credit applied
                'description' => $this->getPaymentDescription($totalPaymentAmount, $adjustedAmountDue, $creditApplied),
                'cashier' => Auth::user()->name ?? 'System',
                'account_number' => $customerApplication->account_number,
                'account_name' => $customerApplication->full_name,
                'meter_number' => null, // To be assigned after energization
                'meter_status' => 'Pending Installation',
                'address' => $customerApplication->full_address,
                'payment_mode' => $totalPaymentAmount >= $adjustedAmountDue ? 'Full Payment' : 'Partial Payment',
                'payment_area' => 'Office',
                'status' => TransactionStatusEnum::COMPLETED,
                'quantity' => $payables->sum(function ($payable) {
                    return $payable->definitions->sum('quantity');
                }),
            ]);

            // Allocate payment across payables (combined: credit + cash/check/card)
            $remainingPayment = $totalCombinedPayment;
            $allocationResult = $this->allocatePaymentToPayables($payables, $remainingPayment);
            $remainingPayment = $allocationResult['remaining_payment'];

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

            // Create payment type records
            foreach ($validatedData['payment_methods'] as $payment) {
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

            // Handle overpayment as credit balance
            if ($remainingPayment > 0) {
                // Get or create credit balance record for this customer
                $creditBalance = $customerApplication->creditBalance()->firstOrCreate(
                    ['customer_application_id' => $customerApplication->id],
                    [
                        'account_number' => $customerApplication->account_number,
                        'credit_balance' => 0,
                    ]
                );

                // Add the overpayment as credit
                $creditBalance->addCredit(
                    $remainingPayment,
                    'overpayment_from_transaction_' . $transaction->id
                );
            }

            // Update customer application status based on payment completeness
            $this->updateCustomerApplicationStatus($customerApplication, $payables);

            return $transaction;
        });
    }

    /**
     * Allocate payment across payables (not individual definitions)
     */
    private function allocatePaymentToPayables($payables, $totalPayment): array
    {
        $allocations = [];
        $remainingPayment = $totalPayment;

        // First, calculate total outstanding amount from payables
        $totalOutstanding = 0;
        $payableItems = [];
        
        foreach ($payables as $payable) {
            $outstandingAmount = $payable->balance > 0 
                ? $payable->balance 
                : floatval($payable->total_amount_due ?? 0);
            
            if ($outstandingAmount > 0) {
                $payableItems[] = [
                    'payable' => $payable,
                    'outstanding' => $outstandingAmount
                ];
                $totalOutstanding += $outstandingAmount;
            }
        }

        // If total payment is greater than or equal to total outstanding, pay everything in full
        if ($remainingPayment >= $totalOutstanding) {
            foreach ($payableItems as $item) {
                $amountToPay = $item['outstanding'];
                $allocations[] = [
                    'payable' => $item['payable'],
                    'amount_allocated' => $amountToPay
                ];
                
                // Update the payable
                $this->updatePayable($item['payable'], $amountToPay);
                $remainingPayment -= $amountToPay;
            }
        } else {
            // Proportional allocation across payables
            foreach ($payableItems as $item) {
                $proportion = $item['outstanding'] / $totalOutstanding;
                $amountToPay = min($remainingPayment * $proportion, $item['outstanding']);
                
                // Round to 2 decimal places to avoid floating point issues
                $amountToPay = round($amountToPay, 2);
                
                if ($amountToPay > 0) {
                    $allocations[] = [
                        'payable' => $item['payable'],
                        'amount_allocated' => $amountToPay
                    ];
                    
                    // Update the payable
                    $this->updatePayable($item['payable'], $amountToPay);
                    $remainingPayment -= $amountToPay;
                }
            }
        }

        return [
            'allocations' => $allocations,
            'remaining_payment' => max(0, $remainingPayment) // Ensure non-negative
        ];
    }

    /**
     * Update payable with payment (simplified - just update the payable record)
     */
    private function updatePayable($payable, $paymentAmount): void
    {
        $currentPaid = floatval($payable->amount_paid ?? 0);
        $totalAmount = floatval($payable->total_amount_due ?? 0);
        $newAmountPaid = $currentPaid + $paymentAmount;
        $newBalance = max(0, $totalAmount - $newAmountPaid);

        $status = 'unpaid';
        if ($newAmountPaid > 0 && $newBalance > 0) {
            $status = 'partially_paid';
        } elseif ($newBalance == 0) {
            $status = 'paid';
        }

        $payable->update([
            'amount_paid' => $newAmountPaid,
            'balance' => $newBalance,
            'status' => $status,
        ]);
    }

    /**
     * Update customer application status based on payment completeness
     */
    private function updateCustomerApplicationStatus($customerApplication, $payables): void
    {
        $allPaid = true;
        foreach ($payables as $payable) {
            if ($payable->fresh()->status !== 'paid') {
                $allPaid = false;
                break;
            }
        }

        if ($allPaid) {
            $customerApplication->update([
                'status' => ApplicationStatusEnum::ACTIVE, // Or next appropriate status
            ]);
        }
        // If not all paid, keep current status (still FOR_COLLECTION)
    }

    /**
     * Generate payment description based on payment type
     * 
     * @param float $cashPaymentAmount The actual cash/check/card payment amount (not including credit)
     * @param float $adjustedAmountDue The amount due after credit has been applied
     * @param float $creditApplied The amount of credit balance applied
     */
    private function getPaymentDescription($cashPaymentAmount, $adjustedAmountDue, $creditApplied = 0): string
    {
        $description = "Payment for energization charges";
        
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
               ($creditApplied > 0 ? " (Credit applied: ₱" . number_format($creditApplied, 2) . ")" : "");
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
            'payment_methods' => 'required|array|min:1',
            'payment_methods.*.type' => ['required', Rule::in([PaymentTypeEnum::CASH, PaymentTypeEnum::CHECK, PaymentTypeEnum::CREDIT_CARD])],
            'payment_methods.*.amount' => 'required|numeric|min:0.01',
            'payment_methods.*.bank' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|required_if:payment_methods.*.type,' . PaymentTypeEnum::CREDIT_CARD,
            'payment_methods.*.check_number' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK,
            'payment_methods.*.check_issue_date' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|date',
            'payment_methods.*.check_expiration_date' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|date|after:check_issue_date',
            'payment_methods.*.bank_transaction_number' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CREDIT_CARD,
        ];
    }
}