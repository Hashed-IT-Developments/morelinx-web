<?php

namespace App\Http\Controllers\Transactions;

use App\Enums\PayableStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustomerAccount;
use App\Models\PaymentType;
use App\Services\PaymentService;
use App\Services\TransactionNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TransactionsController extends Controller
{
    /**
     * TransactionNumberService instance for OR number management
     */
    protected TransactionNumberService $transactionNumberService;

    /**
     * Inject TransactionNumberService
     */
    public function __construct(TransactionNumberService $transactionNumberService)
    {
        $this->transactionNumberService = $transactionNumberService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $billMonth = now()->format('Ym'); // Always use current month in YYYYMM format
        $customerAccount = null;
        $payableDetails = collect();
        $subtotal = 0;
        $qty = 0;
        $latestTransaction = null;

        // Only search if search parameter is provided
        if ($search) {
            // Search for CustomerAccount by account_number or account_name
            $customerAccount = CustomerAccount::where(function ($query) use ($search) {
                $query->where('account_number', 'like', "%{$search}%")
                      ->orWhere('account_name', 'like', "%{$search}%");
            })
                ->with(['payables.definitions', 'barangay.town', 'customerType', 'creditBalance'])
                ->first();

            if ($customerAccount) {
                // Get payables for this customer account:
                // 1. Current month payables, OR
                // 2. Previous months payables that are not fully paid (status != 'paid' or balance > 0)
                $payables = $customerAccount->payables()
                    ->where(function ($query) use ($billMonth) {
                        $query->where('bill_month', $billMonth) // Current month
                            ->orWhere(function ($q) use ($billMonth) {
                                $q->where('bill_month', '<', $billMonth) // Previous months
                                    ->where(function ($balanceQuery) {
                                        $balanceQuery->where("status", "!=", PayableStatusEnum::PAID)
                                            ->orWhere('balance', '>', 0);
                                    });
                            });
                    })
                    ->orderBy('bill_month', 'asc') // Show oldest first
                    ->get();
                
                // Calculate EWT information and transform payables
                $taxableSubtotal = 0;
                $nonTaxableSubtotal = 0;
                
                // Transform payables into transaction detail format (not individual definitions)
                foreach ($payables as $payable) {
                    $remainingBalance = $payable->balance > 0 ? $payable->balance : $payable->total_amount_due;
                    $isSubjectToEWT = $payable->isSubjectToEWT();
                    
                    // Track taxable vs non-taxable amounts
                    if ($isSubjectToEWT) {
                        $taxableSubtotal += floatval($remainingBalance);
                    } else {
                        $nonTaxableSubtotal += floatval($remainingBalance);
                    }
                    
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
                        'type' => $payable->type,
                        'type_label' => $payable->getTypeLabel(),
                        'is_subject_to_ewt' => $isSubjectToEWT,
                        'ewt_exclusion_reason' => $payable->getEWTExclusionReason(),
                    ]);
                    
                    $subtotal += floatval($remainingBalance);
                    $qty += 1; // Each payable is one item
                }
                
                // Calculate EWT (for now, use 0 until admin sets customer's rate)
                // TODO: Get EWT rate from customer_account when that field is added
                $ewtRate = 0; // Will be set by admin (0.025 for gov, 0.05 for commercial)
                $ewtAmount = round($taxableSubtotal * $ewtRate, 2);

                // Create latestTransaction structure from CustomerAccount data
                $latestTransaction = [
                    'id' => $customerAccount->id,
                    'account_number' => $customerAccount->account_number,
                    'account_name' => $customerAccount->account_name,
                    'address' => $customerAccount->barangay ? $customerAccount->barangay->name : 'N/A',
                    'meter_number' => null, // Will be set after energization
                    'meter_status' => 'Pending Installation',
                    'status' => $customerAccount->account_status ?? 'active',
                    'ewt' => $ewtAmount,
                    'ewt_rate' => $ewtRate,
                    'taxable_subtotal' => $taxableSubtotal,
                    'non_taxable_subtotal' => $nonTaxableSubtotal,
                    'credit_balance' => $customerAccount->creditBalance?->credit_balance,
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
            'ewtRates' => config('tax.ewt_rates'),
        ]);
    }

    /**
     * Process payment for customer account payables
     */
    public function processPayment(Request $request, CustomerAccount $customerAccount, PaymentService $paymentService)
    {
        try {
            // Validate the request
            $validated = $request->validate($paymentService->getValidationRules());

            // Process the payment using the service
            $transaction = $paymentService->processPayment($validated, $customerAccount);

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
                'customer_account_id' => $customerAccount->id,
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

    /**
     * Get payment queue - customers with unpaid or partially paid payables
     */
    public function getPaymentQueue(Request $request)
    {
        try {
            $billMonth = now()->format('Ym'); // Current month in YYYYMM format
            $perPage = $request->input('per_page', 15); // Default to 15 per page

            // Get customer accounts with unpaid payables only
            $query = CustomerAccount::whereHas('payables', function ($query) use ($billMonth) {
                $query->where(function ($q) use ($billMonth) {
                    // Current month unpaid OR previous months with unpaid/partial payment
                    $q->where(function ($currentMonth) use ($billMonth) {
                        $currentMonth->where('bill_month', $billMonth)
                            ->where(function ($statusCheck) {
                                $statusCheck->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    })
                    ->orWhere(function ($previousMonths) use ($billMonth) {
                        $previousMonths->where('bill_month', '<', $billMonth)
                            ->where(function ($balanceQuery) {
                                $balanceQuery->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    });
                });
            })
            ->withCount(['payables as unpaid_count' => function ($query) use ($billMonth) {
                $query->where(function ($q) use ($billMonth) {
                    $q->where(function ($currentMonth) use ($billMonth) {
                        // Current month - count all unpaid
                        $currentMonth->where('bill_month', $billMonth)
                            ->where(function ($statusCheck) {
                                $statusCheck->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    })
                    ->orWhere(function ($subQuery) use ($billMonth) {
                        // Previous months - only unpaid/partial
                        $subQuery->where('bill_month', '<', $billMonth)
                            ->where(function ($balanceQuery) {
                                $balanceQuery->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    });
                });
            }])
            ->with(['payables' => function ($query) use ($billMonth) {
                $query->where(function ($q) use ($billMonth) {
                    // Current month payables OR previous months with unpaid/partial payment
                    $q->where(function ($currentMonth) use ($billMonth) {
                        // Current month - only unpaid
                        $currentMonth->where('bill_month', $billMonth)
                            ->where(function ($statusCheck) {
                                $statusCheck->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    })
                    ->orWhere(function ($subQuery) use ($billMonth) {
                        // Previous months - only unpaid/partial
                        $subQuery->where('bill_month', '<', $billMonth)
                            ->where(function ($balanceQuery) {
                                $balanceQuery->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    });
                })
                ->orderBy('bill_month', 'desc') // Get most recent payables first
                ->select('id', 'customer_account_id', 'balance', 'total_amount_due', 'bill_month', 'created_at', 'status');
            }])
            ->orderBy('id', 'desc'); // Most recent customer accounts first

            // Paginate the results
            $paginated = $query->paginate($perPage);
            
            $queue = $paginated->getCollection()->map(function ($customerAccount) {
                $unpaidPayables = $customerAccount->payables;
                $totalUnpaid = $unpaidPayables->sum(function ($payable) {
                    return $payable->balance > 0 ? $payable->balance : $payable->total_amount_due;
                });
                
                // Get the most recent payable for this customer
                $latestPayable = $unpaidPayables->first();

                return [
                    'id' => $customerAccount->id,
                    'account_number' => $customerAccount->account_number,
                    'full_name' => $customerAccount->account_name,
                    'total_unpaid' => $totalUnpaid,
                    'unpaid_count' => $customerAccount->unpaid_count,
                    'latest_bill_month' => $latestPayable?->bill_month,
                ];
            });

            return response()->json([
                'queue' => $queue,
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'from' => $paginated->firstItem(),
                    'to' => $paginated->lastItem(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch payment queue', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch payment queue.',
                'queue' => [],
            ], 500);
        }
    }

    // ============================================================
    // MULTI-CASHIER OR NUMBER MANAGEMENT (SELF-SERVICE)
    // ============================================================

    /**
     * Preview the next OR number for the current cashier.
     * This is an ESTIMATE and may change when actually generating.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function previewOrNumber()
    {
        try {
            $preview = $this->transactionNumberService->previewNextOrNumber(Auth::id());

            return response()->json([
                'preview' => $preview,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to preview OR number', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current cashier's counter information (position, stats, etc.).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyCounterInfo()
    {
        try {
            $info = $this->transactionNumberService->getCashierInfo(Auth::id());

            if (!$info) {
                return response()->json([
                    'message' => 'No active transaction series found.',
                ], 404);
            }

            return response()->json($info);

        } catch (\Exception $e) {
            Log::error('Failed to get cashier counter info', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to retrieve cashier information.',
            ], 500);
        }
    }

    /**
     * Check offset conflicts before setting (for confirmation prompt).
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkOffset(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'offset' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $offset = (int) $request->input('offset');

            // Check for conflicts
            $result = $this->transactionNumberService->checkOffsetBeforeSetting(Auth::id(), $offset);

            return response()->json([
                'has_conflicts' => $result['has_conflicts'],
                'warnings' => $result['warnings'] ?? [],
                'info_messages' => $result['info'] ?? [],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to check offset', [
                'user_id' => Auth::id(),
                'offset' => $request->input('offset'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to check offset.',
            ], 500);
        }
    }

    /**
     * Set or update the current cashier's starting offset (self-service).
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setMyOffset(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'offset' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $offset = (int) $request->input('offset');

            // Set cashier offset
            $result = $this->transactionNumberService->setCashierOffset(Auth::id(), $offset);

            if (!$result['success']) {
                return response()->json([
                    'message' => $result['message'],
                    'info_messages' => $result['info'] ?? [],
                ], 422);
            }

            return response()->json([
                'message' => $result['message'],
                'next_or_number' => $result['counter'] ? $this->transactionNumberService->getCashierInfo(Auth::id())['next_or_number'] ?? null : null,
                'info_messages' => $result['info'] ?? [],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to set cashier offset', [
                'user_id' => Auth::id(),
                'offset' => $request->input('offset'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to set cashier offset.',
            ], 500);
        }
    }
}
