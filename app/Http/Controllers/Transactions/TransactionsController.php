<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Models\CustomerApplication;
use App\Models\PaymentType;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TransactionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $billMonth = now()->format('Ym'); // Always use current month in YYYYMM format
        $customerApplication = null;
        $payableDetails = collect();
        $subtotal = 0;
        $qty = 0;
        $latestTransaction = null;

        // Only search if search parameter is provided
        if ($search) {
            // Search for CustomerApplication by exact account_number
            $customerApplication = CustomerApplication::where('account_number', $search)
                ->with(['payables.definitions', 'barangay.town', 'customerType', 'creditBalance'])
                ->first();

            if ($customerApplication) {
                // Get payables for this customer application:
                // 1. Current month payables, OR
                // 2. Previous months payables that are not fully paid (status != 'paid' or balance > 0)
                $payables = $customerApplication->payables()
                    ->where(function ($query) use ($billMonth) {
                        $query->where('bill_month', $billMonth) // Current month
                            ->orWhere(function ($q) use ($billMonth) {
                                $q->where('bill_month', '<', $billMonth) // Previous months
                                    ->where(function ($balanceQuery) {
                                        $balanceQuery->where('status', '!=', 'paid')
                                            ->orWhere('balance', '>', 0);
                                    });
                            });
                    })
                    ->orderBy('bill_month', 'asc') // Show oldest first
                    ->get();
                
                // Transform payables into transaction detail format (not individual definitions)
                foreach ($payables as $payable) {
                    $remainingBalance = $payable->balance > 0 ? $payable->balance : $payable->total_amount_due;
                    
                    $payableDetails->push([
                        'id' => $payable->id,
                        'bill_month' => $payable->bill_month,
                        'transaction_code' => 'PAY-' . $payable->id,
                        'transaction_name' => $payable->customer_payable,
                        'quantity' => 1,
                        'unit' => 'item',
                        'amount' => $payable->total_amount_due,
                        'total_amount' => $remainingBalance, // Show remaining balance
                        'amount_paid' => $payable->amount_paid,
                        'balance' => $payable->balance,
                        'status' => $payable->status,
                        'definitions_count' => $payable->definitions->count(), // For "View Details" button
                    ]);
                    
                    $subtotal += floatval($remainingBalance);
                    $qty += 1; // Each payable is one item
                }

                // Create latestTransaction structure from CustomerApplication data
                $latestTransaction = [
                    'id' => $customerApplication->id,
                    'account_number' => $customerApplication->account_number,
                    'account_name' => $customerApplication->full_name,
                    'address' => $customerApplication->full_address,
                    'meter_number' => null, // Will be set after energization
                    'meter_status' => 'Pending Installation',
                    'status' => $customerApplication->status,
                    'ft' => 0, // Franchise Tax
                    'ewt' => 0, // Expanded Withholding Tax
                    'credit_balance' => $customerApplication->creditBalance?->credit_balance,
                ];
            }
        }
        
        return inertia('transactions/index', [
            'search' => $search,
            'bill_month' => $billMonth,
            'latestTransaction' => $latestTransaction,
            'transactionDetails' => $payableDetails,
            'subtotal' => $subtotal,
            'qty' => $qty,
            'philippineBanks' => PaymentType::getPhilippineBanksFormatted(),
        ]);
    }

    /**
     * Process payment for customer application payables
     */
    public function processPayment(Request $request, CustomerApplication $customerApplication, PaymentService $paymentService)
    {
        try {
            // Validate the request
            $validated = $request->validate($paymentService->getValidationRules());

            // Process the payment using the service
            $transaction = $paymentService->processPayment($validated, $customerApplication);

            // Return Inertia response for better frontend integration
            return redirect()->route('transactions.index')->with([
                'success' => 'Payment processed successfully.',
                'transaction' => [
                    'id' => $transaction->id,
                    'or_number' => $transaction->or_number,
                    'total_amount' => $transaction->total_amount,
                    'status' => $transaction->status,
                ],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'customer_application_id' => $customerApplication->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Handle specific error codes for better user feedback
            if ($e->getCode() === 400) {
                return back()->with('error', $e->getMessage());
            }

            return back()->with('error', 'Payment processing failed. Please try again.');
        }
    }

    /**
     * Get payable definitions for a specific payable (for the details dialog)
     */
    public function getPayableDefinitions($payableId)
    {
        try {
            $payable = \App\Models\Payable::with('definitions')->findOrFail($payableId);
            
            $definitions = $payable->definitions->map(function ($definition) {
                return [
                    'id' => $definition->id,
                    'transaction_name' => $definition->transaction_name,
                    'transaction_code' => $definition->transaction_code,
                    'billing_month' => $definition->billing_month,
                    'quantity' => $definition->quantity,
                    'unit' => $definition->unit,
                    'amount' => $definition->amount,
                    'total_amount' => $definition->total_amount,
                ];
            });

            return response()->json([
                'payable' => [
                    'id' => $payable->id,
                    'customer_payable' => $payable->customer_payable,
                    'total_amount_due' => $payable->total_amount_due,
                    'amount_paid' => $payable->amount_paid,
                    'balance' => $payable->balance,
                    'status' => $payable->status,
                ],
                'definitions' => $definitions,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payable not found.',
            ], 404);
        }
    }
}
