<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\CustomerAccount;
use App\Models\Town;
use Illuminate\Http\Request;

class IsnapPaymentReportController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'town_id' => 'nullable|exists:towns,id',
            'sort_field' => 'nullable|string|in:account_number,customer_name,rate_class,town,barangay,paid_amount,date_paid',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        // Default date range
        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');

        $fromDate = $validated['from_date'] ?? $defaultFromDate;
        $toDate = $validated['to_date'] ?? $defaultToDate;
        $selectedTownId = $validated['town_id'] ?? null;
        $sortField = $validated['sort_field'] ?? 'date_paid';
        $sortDirection = $validated['sort_direction'] ?? 'desc';

        // Fetch all towns for dropdown (cached for performance)
        $towns = cache()->remember('towns_list', 3600, function () {
            return Town::select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        // Build query for ISNAP payments
        $paymentsQuery = $this->buildIsnapPaymentsQuery($fromDate, $toDate, $selectedTownId, $sortField, $sortDirection);

        // Get all payments for export
        $allPayments = $paymentsQuery->get()->map(function ($customerAccount) {
            return $this->mapPaymentData($customerAccount);
        });

        // Apply sorting to all payments collection
        $allPayments = $this->applySorting($allPayments, $sortField, $sortDirection);

        // Get paginated payments
        $paymentsPaginated = $paymentsQuery->paginate(20);

        $payments = collect($paymentsPaginated->items())->map(function ($customerAccount) {
            return $this->mapPaymentData($customerAccount);
        });

        // Apply sorting to paginated payments
        $payments = $this->applySorting($payments, $sortField, $sortDirection);

        return inertia('reports/isnap-payment-reports/index', [
            'payments' => $payments,
            'allPayments' => $allPayments,
            'pagination' => [
                'current_page' => $paymentsPaginated->currentPage(),
                'last_page' => $paymentsPaginated->lastPage(),
                'per_page' => $paymentsPaginated->perPage(),
                'total' => $paymentsPaginated->total(),
            ],
            'towns' => $towns,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'town_id' => $selectedTownId,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Build the base query for paid ISNAP applications using CustomerAccount
     * Reference: TransactionsController - uses customerAccount->payables relationship
     */
    private function buildIsnapPaymentsQuery(string $fromDate, string $toDate, ?int $townId, string $sortField = 'date_paid', string $sortDirection = 'desc')
    {
        $query = CustomerAccount::query()
            ->with([
                'application:id,account_number,first_name,last_name,middle_name,barangay_id,customer_type_id,is_isnap,status,created_at,updated_at',
                'application.barangay:id,name,town_id',
                'application.barangay.town:id,name',
                'application.customerType:id,customer_type,rate_class',
                'payables' => function ($query) {
                    // Get only PAID ISNAP payables
                    $query->where('type', 'isnap_fee')
                        ->where('status', 'paid')
                        ->select('id', 'customer_account_id', 'customer_payable', 'type', 'total_amount_due', 'amount_paid', 'balance', 'status', 'updated_at');
                },
            ])
            ->whereHas('customerApplication', function ($query) {
                $query->where('is_isnap', true);
                // Remove status filter - ISNAP applications may not have 'paid' status
            })
            ->whereHas('payables', function ($query) {
                // Only accounts with PAID ISNAP payables
                $query->where('type', 'isnap_fee')
                    ->where('status', 'paid');
            })
            ->whereHas('customerApplication', function ($query) use ($fromDate, $toDate) {
                $query->whereDate('created_at', '>=', $fromDate)
                    ->whereDate('created_at', '<=', $toDate);
            });

        // Apply town filter
        if ($townId) {
            $query->whereHas('customerApplication.barangay', function ($q) use ($townId) {
                $q->where('town_id', $townId);
            });
        }

        // Apply sorting - Note: Sorting happens after data mapping in the controller
        // For now, default to created_at ordering
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Map payment data to response format
     * Only includes the ISNAP payable amount, not the entire application payables
     */
    private function mapPaymentData($customerAccount): array
    {
        $application = $customerAccount->application;
        
        // Get the ISNAP payable - there should only be one ISNAP fee per account
        $isnapPayable = $customerAccount->payables->firstWhere('type', 'isnap_fee');
        
        // Calculate paid amount from ISNAP payable only (not entire application payables)
        $paidAmount = $isnapPayable ? $isnapPayable->amount_paid : 0;
        
        // Get the date from updated_at of the payable (when it was marked as paid)
        $datePaid = $isnapPayable && $isnapPayable->updated_at
            ? $isnapPayable->updated_at->format('Y-m-d')
            : ($application->updated_at ? $application->updated_at->format('Y-m-d') : 'N/A');

        return [
            'id' => $application->id,
            'account_number' => $application->account_number ?? 'N/A',
            'customer_name' => $application->identity ?? 'N/A',
            'identity' => $application->identity ?? 'N/A',
            'rate_class' => $application->customerType?->rate_class ?? 'N/A',
            'status' => $application->status,
            'town' => $application->barangay?->town?->name ?? 'N/A',
            'barangay' => $application->barangay?->name ?? 'N/A',
            'paid_amount' => $paidAmount, // Only ISNAP payable amount
            'date_applied' => $application->created_at?->format('Y-m-d') ?? 'N/A',
            'date_installed' => $application->date_installed?->format('Y-m-d') ?? 'N/A',
            'date_paid' => $datePaid,
        ];
    }

    /**
     * Apply sorting to the payments collection
     */
    private function applySorting($payments, string $sortField, string $sortDirection)
    {
        return $payments->sortBy(function ($payment) use ($sortField) {
            return $payment[$sortField];
        }, SORT_REGULAR, $sortDirection === 'desc');
    }
}
