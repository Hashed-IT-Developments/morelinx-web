<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Models\CustomerAccount;
use App\Models\Payable;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentPreviewController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Preview payment allocation and EWT calculation without processing
     */
    public function preview(Request $request, int $customerAccountId)
    {
        try {
            $validated = $request->validate([
                'payment_methods' => 'nullable|array',
                'payment_methods.*.type' => 'required|in:cash,credit_card,check',
                'payment_methods.*.amount' => 'required|numeric|min:0',
                'selected_payable_ids' => 'required|array|min:1',
                'selected_payable_ids.*' => 'required|integer',
                'use_credit_balance' => 'nullable|boolean',
                'credit_amount' => 'nullable|numeric|min:0',
                'ewt_type' => 'nullable|in:government,commercial',
                'ewt_amount' => 'nullable|numeric|min:0',
            ]);
            
            // Validate that either payment methods or credit balance is provided
            $hasPaymentMethods = !empty($validated['payment_methods']) && collect($validated['payment_methods'])->sum('amount') > 0;
            $hasCreditBalance = ($validated['use_credit_balance'] ?? false) && floatval($validated['credit_amount'] ?? 0) > 0;
            
            if (!$hasPaymentMethods && !$hasCreditBalance) {
                return response()->json([
                    'error' => 'Either payment methods or credit balance must be provided'
                ], 422);
            }

            // Get customer account
            $customerAccount = CustomerAccount::findOrFail($customerAccountId);

            // Get selected payables (order by created_at to allocate to oldest first)
            $payables = Payable::whereIn('id', $validated['selected_payable_ids'])
                ->where('customer_account_id', $customerAccountId)
                ->where('status', '!=', 'paid')
                ->orderBy('bill_month', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            if ($payables->isEmpty()) {
                return response()->json([
                    'error' => 'No valid payables found for payment'
                ], 422);
            }

            // Calculate total payment from payment methods
            $cashPaymentAmount = collect($validated['payment_methods'] ?? [])
                ->sum(fn($method) => floatval($method['amount']));

            // Get credit amount
            $creditAmount = $validated['use_credit_balance'] ?? false 
                ? floatval($validated['credit_amount'] ?? 0) 
                : 0;

            // Get EWT info from request
            $ewtType = $validated['ewt_type'] ?? null;
            $frontendEwtEstimate = floatval($validated['ewt_amount'] ?? 0);

            // Total combined payment (cash + credit)
            $totalCombinedPayment = $cashPaymentAmount + $creditAmount;

            // Use PaymentService allocation method for consistent calculation
            $allocationResult = $this->paymentService->allocatePayment(
                $payables,
                $totalCombinedPayment,
                $ewtType
            );
            
            $allocations = $allocationResult['allocations'];
            $totalEwtGenerated = $allocationResult['total_ewt'];
            $remainingPayment = $allocationResult['remaining_payment'];

            // Total taxable balance paid (sum of cash payments to taxable payables)
            $actualTaxableBalancePaid = 0;
            foreach ($allocations as $allocation) {
                if ($allocation['is_taxable']) {
                    $actualTaxableBalancePaid += $allocation['cash_payment'];
                }
            }

            $actualEwtAmount = $totalEwtGenerated;
            
            // Get EWT rate for response
            $ewtRate = $this->paymentService->getEwtRate($ewtType);

            // Calculate total allocated (cash + credit + EWT)
            $totalAllocated = array_sum(array_column($allocations, 'amount'));

            // Calculate subtotal before EWT
            $subtotalBeforeEwt = $payables->sum(fn($p) => floatval($p->balance ?? 0));

            // Calculate subtotal after EWT
            $subtotalAfterEwt = $subtotalBeforeEwt - $actualEwtAmount;

            // Calculate what's needed after credit
            $amountNeededAfterCredit = $subtotalAfterEwt - $creditAmount;

            // Calculate change or balance due
            $difference = $totalCombinedPayment - $subtotalAfterEwt;

            // Format allocations for clearer display
            $formattedAllocations = array_map(function($allocation) {
                return [
                    'payable_id' => $allocation['payable_id'],
                    'type' => $allocation['type'],
                    'is_taxable' => $allocation['is_taxable'],
                    
                    // Original payable balance (before any payment)
                    'original_balance' => round($allocation['original_balance'], 2),
                    'current_balance' => round($allocation['current_balance'], 2),
                    
                    // Payment breakdown
                    'ewt_withheld' => round($allocation['ewt_withheld'], 2),
                    'cash_payment' => round($allocation['cash_payment'], 2),
                    'total_amount_covered' => round($allocation['total_amount_covered'], 2),
                    
                    // Result
                    'remaining_balance' => round($allocation['remaining_balance'], 2),
                    'is_fully_paid' => $allocation['is_fully_paid'],
                    
                    // Backward compatibility
                    'amount' => round($allocation['total_amount_covered'], 2),
                ];
            }, $allocations);

            return response()->json([
                'preview' => [
                    // Payment methods breakdown
                    'cash_payment' => round($cashPaymentAmount, 2),
                    'credit_applied' => round($creditAmount, 2),
                    'total_payment' => round($totalCombinedPayment, 2),
                    
                    // EWT calculation
                    'ewt_type' => $ewtType,
                    'ewt_rate' => $ewtRate,
                    'ewt_rate_percentage' => $ewtRate * 100,
                    'frontend_ewt_estimate' => round($frontendEwtEstimate, 2),
                    'actual_ewt_amount' => round($actualEwtAmount, 2),
                    'taxable_balance_paid' => round($actualTaxableBalancePaid, 2),
                    
                    // Subtotals
                    'subtotal_before_ewt' => round($subtotalBeforeEwt, 2),
                    'subtotal_after_ewt' => round($subtotalAfterEwt, 2),
                    
                    // What's needed
                    'amount_needed_after_credit' => round($amountNeededAfterCredit, 2),
                    
                    // Result
                    'difference' => round($difference, 2),
                    'is_overpayment' => $difference >= 0,
                    'change_or_balance' => round(abs($difference), 2),
                    
                    // Allocation details (formatted for clearer display)
                    'allocations' => $formattedAllocations,
                    'total_allocated' => round($totalAllocated, 2),
                ],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Payment preview validation failed', [
                'customer_account_id' => $customerAccountId,
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'error' => 'Validation failed',
                'message' => 'Please check your input data',
                'details' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Payment preview - customer not found', [
                'customer_account_id' => $customerAccountId,
            ]);

            return response()->json([
                'error' => 'Customer account not found',
                'message' => 'The specified customer account does not exist',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Payment preview failed', [
                'customer_account_id' => $customerAccountId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['_token']),
            ]);

            return response()->json([
                'error' => 'Failed to generate payment preview',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
