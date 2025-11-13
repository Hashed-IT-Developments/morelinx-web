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
        ]);

        // Default date range
        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');

        $fromDate = $validated['from_date'] ?? $defaultFromDate;
        $toDate = $validated['to_date'] ?? $defaultToDate;
        $selectedTownId = $validated['town_id'] ?? null;

        // Fetch all towns for dropdown (cached for performance)
        $towns = cache()->remember('towns_list', 3600, function () {
            return Town::select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        // Build query for ISNAP payments
        $paymentsQuery = $this->buildIsnapPaymentsQuery($fromDate, $toDate, $selectedTownId);

        // Get all payments for export
        $allPayments = $paymentsQuery->get()->map(function ($customerAccount) {
            return $this->mapPaymentData($customerAccount);
        });

        // Get paginated payments
        $paymentsPaginated = $paymentsQuery->paginate(20);

        $payments = collect($paymentsPaginated->items())->map(function ($customerAccount) {
            return $this->mapPaymentData($customerAccount);
        });

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
            ],
        ]);
    }

    /**
     * Build the base query for paid ISNAP applications using CustomerAccount
     * Reference: TransactionsController - uses customerAccount->payables relationship
     */
    private function buildIsnapPaymentsQuery(string $fromDate, string $toDate, ?int $townId)
    {
        $query = CustomerAccount::query()
            ->with([
                'application:id,account_number,first_name,last_name,middle_name,barangay_id,customer_type_id,is_isnap,status,created_at',
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
            ->whereHas('application', function ($query) {
                $query->where('is_isnap', true)
                    ->where('status', 'paid');
            })
            ->whereHas('payables', function ($query) {
                // Only accounts with PAID ISNAP payables
                $query->where('type', 'isnap_fee')
                    ->where('status', 'paid');
            })
            ->whereHas('application', function ($query) use ($fromDate, $toDate) {
                $query->whereDate('created_at', '>=', $fromDate)
                    ->whereDate('created_at', '<=', $toDate);
            });

        // Apply town filter
        if ($townId) {
            $query->whereHas('application.barangay', function ($q) use ($townId) {
                $q->where('town_id', $townId);
            });
        }

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
            'customer_name' => $application->full_name ?? 'N/A',
            'rate_class' => $application->customerType?->rate_class ?? 'N/A',
            'town' => $application->barangay?->town?->name ?? 'N/A',
            'barangay' => $application->barangay?->name ?? 'N/A',
            'paid_amount' => $paidAmount, // Only ISNAP payable amount
            'date_paid' => $datePaid,
        ];
    }
}
