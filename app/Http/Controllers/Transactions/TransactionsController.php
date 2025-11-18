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
        $billMonth = now()->format('Ym');
        $customerAccount = null;
        $payableDetails = collect();
        $subtotal = 0;
        $qty = 0;
        $latestTransaction = null;


        if ($search) {
            
            $customerAccount = CustomerAccount::where(function ($query) use ($search) {
                $query->where('account_number', $search)
                      ->orWhere('account_name', 'like', "%{$search}%");
            })
                ->with(['payables.definitions', 'barangay.town', 'customerType', 'creditBalance'])
                ->first();

            if ($customerAccount) {
               
                $payables = $customerAccount->payables()
                    ->where(function ($query) use ($billMonth) {
                        
                        $query->where(function ($currentMonth) use ($billMonth) {
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
                    })
                    ->orderBy('bill_month', 'asc') 
                    ->orderBy('id', 'asc') 
                    ->get();
        
                $taxableSubtotal = 0;
                $nonTaxableSubtotal = 0;
                
               
                foreach ($payables as $payable) {
                    $remainingBalance = $payable->balance > 0 ? $payable->balance : $payable->total_amount_due;
                    $isSubjectToEWT = $payable->isSubjectToEWT();
                    
                 
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
                        'total_amount' => $remainingBalance,
                        'amount_paid' => $payable->amount_paid,
                        'balance' => $payable->balance,
                        'status' => $payable->status,
                        'definitions_count' => $payable->definitions->count(), 
                        'type' => $payable->type,
                        'type_label' => $payable->getTypeLabel(),
                        'is_subject_to_ewt' => $isSubjectToEWT,
                        'ewt_exclusion_reason' => $payable->getEWTExclusionReason(),
                    ]);
                    
                    $subtotal += floatval($remainingBalance);
                    $qty += 1;
                }
                
               
                $ewtRate = 0;
                $ewtAmount = round($taxableSubtotal * $ewtRate, 2);

             
                $latestTransaction = [
                    'id' => $customerAccount->id,
                    'account_number' => $customerAccount->account_number,
                    'account_name' => $customerAccount->account_name,
                    'address' => $customerAccount->barangay ? $customerAccount->barangay->name : 'N/A',
                    'meter_number' => null, 
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

            // Calculate next OR if offset was used
            $redirectParams = [];
            if (!empty($validated['or_offset'])) {
                // Extract numeric part from OR number (e.g., "OR-202510-000050" -> 50)
                if (preg_match('/(\d+)$/', $transaction->or_number, $matches)) {
                    $currentOrNumber = intval($matches[1]);
                    $redirectParams['next_or'] = $currentOrNumber + 1;
                }
            }

            // Return Inertia response for better frontend integration
            return redirect()->route('transactions.index', $redirectParams)->with([
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

            // Return error in Inertia format so it can be caught by onError handler
            // This allows the frontend to show the error without a full page reload
            return back()->withErrors(['message' => $e->getMessage()])->with('error', $e->getMessage());
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
            $billMonth = now()->format('Ym'); 
            $perPage = $request->input('per_page', 15);

          
            $query = CustomerAccount::whereHas('payables', function ($query) use ($billMonth) {
                $query->where(function ($q) use ($billMonth) {
                  
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
                      
                        $currentMonth->where('bill_month', $billMonth)
                            ->where(function ($statusCheck) {
                                $statusCheck->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    })
                    ->orWhere(function ($subQuery) use ($billMonth) {
                        
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
                 
                    $q->where(function ($currentMonth) use ($billMonth) {
                       
                        $currentMonth->where('bill_month', $billMonth)
                            ->where(function ($statusCheck) {
                                $statusCheck->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    })
                    ->orWhere(function ($subQuery) use ($billMonth) {
                       
                        $subQuery->where('bill_month', '<', $billMonth)
                            ->where(function ($balanceQuery) {
                                $balanceQuery->where("status", "!=", PayableStatusEnum::PAID)
                                    ->orWhere('balance', '>', 0);
                            });
                    });
                })
                ->orderBy('bill_month', 'desc')
                ->select('id', 'customer_account_id', 'balance', 'total_amount_due', 'bill_month', 'created_at', 'status');
            }])
            ->with('application:id')
            ->orderBy('id', 'desc');

        
            $paginated = $query->paginate($perPage);
            
            $queue = $paginated->getCollection()->map(function ($customerAccount) {
                $unpaidPayables = $customerAccount->payables;
                $totalUnpaid = $unpaidPayables->sum(function ($payable) {
                    return $payable->balance > 0 ? $payable->balance : $payable->total_amount_due;
                });
                
               
                $latestPayable = $unpaidPayables->first();

                return [
                    'id' => $customerAccount->id,
                    'account_number' => $customerAccount->account_number,
                    'full_name' => $customerAccount->account_name ?: ($customerAccount->application?->identity ?? 'N/A'),
                    'identity' => $customerAccount->application?->identity ?? 'N/A',
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
                'error' => $e,
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
     * Get current cashier's next OR preview and generation history.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMyCounterInfo()
    {
        try {
            $series = $this->transactionNumberService->getActiveSeries();
            
            if (!$series) {
                return response()->json([
                    'message' => 'No active transaction series found.',
                ], 404);
            }

            // Get preview of next OR (without offset)
            $preview = $this->transactionNumberService->previewNextOrNumber(Auth::id());
            
            // Get user's generation history
            $totalGenerated = \App\Models\OrNumberGeneration::where('generated_by_user_id', Auth::id())
                ->where('transaction_series_id', $series->id)
                ->where('status', '!=', 'voided')
                ->count();
                
            $lastGeneration = \App\Models\OrNumberGeneration::where('generated_by_user_id', Auth::id())
                ->where('transaction_series_id', $series->id)
                ->where('status', '!=', 'voided')
                ->orderBy('generated_at', 'desc')
                ->first();

            return response()->json([
                'series_name' => $series->series_name,
                'next_or_number' => $preview['or_number'],
                'next_or_preview' => $preview,
                'total_generated' => $totalGenerated,
                'last_generated_number' => $lastGeneration?->actual_number,
                'last_generated_or' => $lastGeneration?->or_number,
                'last_generated_at' => $lastGeneration?->generated_at,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get cashier info', [
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
     * Preview OR with stateless offset (no longer checks conflicts - just shows preview).
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

            // Preview what OR number would be generated with this offset
            $preview = $this->transactionNumberService->previewNextOrNumber(Auth::id(), $offset);

            return response()->json([
                'has_conflicts' => false, // Stateless system doesn't have "conflicts" - just auto-jumps
                'warnings' => [$preview['warning'] ?? ''],
                'info_messages' => [
                    "Next OR will be: {$preview['or_number']}",
                    "This offset will be used one-time. Subsequent ORs will auto-continue from this number.",
                ],
                'preview_or_number' => $preview['or_number'],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to preview offset', [
                'user_id' => Auth::id(),
                'offset' => $request->input('offset'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to preview offset.',
            ], 500);
        }
    }

    /**
     * Store cashier's preferred offset (stateless - just for UI preference storage).
     * The actual offset will be passed as parameter during transaction creation.
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

            // Preview what the next OR would be with this offset
            $preview = $this->transactionNumberService->previewNextOrNumber(Auth::id(), $offset);

            // In stateless system, we don't "set" offset in DB
            // Just return preview so UI can use this offset when creating next transaction
            return response()->json([
                'message' => "Offset {$offset} is ready to use. Your next transaction will generate OR {$preview['or_number']}.",
                'next_or_number' => $preview['or_number'],
                'offset' => $offset,
                'info_messages' => [
                    "This offset is not stored. Pass it when creating your next transaction.",
                    "After first use, system will auto-continue from that number.",
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to preview cashier offset', [
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
