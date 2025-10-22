<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\CustomerApplication;
use App\Models\TransactionDetail;
use App\Models\PaymentType;
use App\Models\Payable;
use App\Enums\ApplicationStatusEnum;
use App\Enums\PaymentTypeEnum;
use App\Enums\TransactionStatusEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TransactionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $customerApplication = null;
        $payableDetails = collect();
        $subtotal = 0;
        $qty = 0;
        $latestTransaction = null;

        // Only search if search parameter is provided
        if ($search) {
            // Search for CustomerApplication by account_number that's ready for collection
            $customerApplication = CustomerApplication::where('account_number', 'like', "%{$search}%")
                ->with(['payables.definitions', 'barangay.town', 'customerType'])
                ->first();

            if ($customerApplication) {
                // Get all payables for this customer application
                $payables = $customerApplication->payables;
                
                // Transform payables definitions into transaction detail format
                foreach ($payables as $payable) {
                    foreach ($payable->definitions as $definition) {
                        $payableDetails->push([
                            'id' => $definition->id,
                            'bill_month' => $definition->billing_month, // Keep for compatibility, but could be renamed
                            'transaction_code' => $definition->transaction_code,
                            'transaction_name' => $definition->transaction_name,
                            'quantity' => $definition->quantity,
                            'unit' => $definition->unit,
                            'amount' => $definition->amount,
                            'total_amount' => $definition->total_amount,
                        ]);
                        
                        $subtotal += floatval($definition->total_amount ?? 0);
                        $qty += intval($definition->quantity ?? 0);
                    }
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
                ];
            }
        }
        
        return inertia('transactions/index', [
            'search' => $search,
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
    public function processPayment(Request $request, CustomerApplication $customerApplication)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'payment_methods' => 'required|array|min:1',
                'payment_methods.*.type' => ['required', Rule::in([PaymentTypeEnum::CASH, PaymentTypeEnum::CHECK, PaymentTypeEnum::CREDIT_CARD])],
                'payment_methods.*.amount' => 'required|numeric|min:0.01',
                'payment_methods.*.bank' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|required_if:payment_methods.*.type,' . PaymentTypeEnum::CREDIT_CARD,
                'payment_methods.*.check_number' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK,
                'payment_methods.*.check_issue_date' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|date',
                'payment_methods.*.check_expiration_date' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CHECK . '|date|after:check_issue_date',
                'payment_methods.*.bank_transaction_number' => 'required_if:payment_methods.*.type,' . PaymentTypeEnum::CREDIT_CARD,
            ]);

            // Validate that customer application has payables
            if ($customerApplication->status !== ApplicationStatusEnum::FOR_COLLECTION) {
                return response()->json([
                    'message' => 'Customer application is not ready for collection.',
                    'error' => 'INVALID_STATUS'
                ], 400);
            }

            $payables = $customerApplication->payables()->with('definitions')->get();
            if ($payables->isEmpty()) {
                return response()->json([
                    'message' => 'No payables found for this customer application.',
                    'error' => 'NO_PAYABLES'
                ], 400);
            }

            // Calculate total amount due from payables definitions
            $totalAmountDue = 0;
            foreach ($payables as $payable) {
                foreach ($payable->definitions as $definition) {
                    $totalAmountDue += floatval($definition->total_amount ?? 0);
                }
            }

            $totalPaymentAmount = collect($validated['payment_methods'])->sum('amount');

            // Validate payment amount
            if (abs($totalPaymentAmount - $totalAmountDue) > 0.01) { // Allow for small floating point differences
                return response()->json([
                    'message' => 'Payment amount does not match total amount due.',
                    'error' => 'AMOUNT_MISMATCH',
                    'expected' => $totalAmountDue,
                    'received' => $totalPaymentAmount
                ], 400);
            }

            // Validate Philippine banks for check and card payments
            foreach ($validated['payment_methods'] as $payment) {
                if (in_array($payment['type'], [PaymentTypeEnum::CHECK, PaymentTypeEnum::CREDIT_CARD])) {
                    if (!PaymentType::isValidPhilippineBank($payment['bank'])) {
                        return response()->json([
                            'message' => 'Invalid Philippine bank selected.',
                            'error' => 'INVALID_BANK',
                            'bank' => $payment['bank']
                        ], 400);
                    }
                }
            }

            return DB::transaction(function () use ($customerApplication, $payables, $validated, $totalAmountDue) {
                // Generate OR number
                $orNumber = 'OR-' . str_pad(Transaction::count() + 1, 6, '0', STR_PAD_LEFT);

                // Create main transaction record
                $transaction = Transaction::create([
                    'transactionable_type' => CustomerApplication::class,
                    'transactionable_id' => $customerApplication->id,
                    'or_number' => $orNumber,
                    'or_date' => now(),
                    'total_amount' => $totalAmountDue,
                    'description' => 'Payment for energization charges',
                    'cashier' => Auth::user()->name ?? 'System',
                    'account_number' => $customerApplication->account_number,
                    'account_name' => $customerApplication->full_name,
                    'meter_number' => null, // To be assigned after energization
                    'meter_status' => 'Pending Installation',
                    'address' => $customerApplication->full_address,
                    'payment_mode' => 'Full Payment',
                    'payment_area' => 'Office',
                    'status' => TransactionStatusEnum::COMPLETED,
                    'quantity' => $payables->sum(function ($payable) {
                        return $payable->definitions->sum('quantity');
                    }),
                ]);

                // Create transaction details from payables definitions
                foreach ($payables as $payable) {
                    foreach ($payable->definitions as $definition) {
                        TransactionDetail::create([
                            'transaction_id' => $transaction->id,
                            'transaction' => $definition->transaction_name,
                            'transaction_code' => $definition->transaction_code,
                            'amount' => $definition->amount,
                            'unit' => $definition->unit,
                            'quantity' => $definition->quantity,
                            'total_amount' => $definition->total_amount,
                            'bill_month' => $definition->billing_month,
                        ]);
                    }
                }

                // Create payment type records
                foreach ($validated['payment_methods'] as $payment) {
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

                // Update payables status to paid
                foreach ($payables as $payable) {
                    $payable->update([
                        'status' => 'paid',
                        'amount_paid' => $payable->total_amount_due,
                        'balance' => 0,
                    ]);
                }

                // Update customer application status
                $customerApplication->update([
                    'status' => ApplicationStatusEnum::VERIFIED, // Or next appropriate status
                ]);

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
            });

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'customer_application_id' => $customerApplication->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Payment processing failed. Please try again.');
        }
    }
}
