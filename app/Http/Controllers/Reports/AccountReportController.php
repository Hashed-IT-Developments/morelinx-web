<?php

namespace App\Http\Controllers\Reports;

use App\Enums\AccountStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustomerAccount;
use App\Models\Town;
use App\Models\Barangay;
use Illuminate\Http\Request;

class AccountReportController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'status' => 'nullable|string',
            'town_id' => 'nullable|exists:towns,id',
            'barangay_id' => 'nullable|exists:barangays,id',
            'rate_class' => 'nullable|string',
            'sort_field' => 'nullable|string',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        $fromDate = $validated['from_date'] ?? null;
        $toDate = $validated['to_date'] ?? null;
        $selectedStatus = $validated['status'] ?? null;
        $selectedTownId = $validated['town_id'] ?? null;
        $selectedBarangayId = $validated['barangay_id'] ?? null;
        $selectedRateClass = $validated['rate_class'] ?? null;
        $sortField = $validated['sort_field'] ?? 'connection_date';
        $sortDirection = $validated['sort_direction'] ?? 'desc';

        $towns = cache()->remember('towns_list', 3600, function () {
            return Town::select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        $barangays = $selectedTownId
            ? cache()->remember("barangays_for_town_{$selectedTownId}", 3600, function () use ($selectedTownId) {
                return Barangay::where('town_id', $selectedTownId)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get();
            })
            : collect([]);

        $accountsQuery = $this->buildAccountsQuery(
            $fromDate,
            $toDate,
            $selectedStatus,
            $selectedTownId,
            $selectedBarangayId,
            $selectedRateClass
        );

        $allAccounts = $accountsQuery->get()->map(function ($account) {
            return $this->mapAccountData($account);
        });

        $allAccounts = $this->applySorting($allAccounts, $sortField, $sortDirection);

        $accountsPaginated = $accountsQuery->paginate(20);

        $accounts = collect($accountsPaginated->items())->map(function ($account) {
            return $this->mapAccountData($account);
        });

        $accounts = $this->applySorting($accounts, $sortField, $sortDirection);

        $statusCounts = [
            'pending'           => CustomerAccount::where('account_status', AccountStatusEnum::PENDING)->count(),
            'active'            => CustomerAccount::where('account_status', AccountStatusEnum::ACTIVE)->count(),
            'suspended'         => CustomerAccount::where('account_status', AccountStatusEnum::SUSPENDED)->count(),
            'disconnected'      => CustomerAccount::where('account_status', AccountStatusEnum::DISCONNECTED)->count(),
            'total'             => CustomerAccount::count(),
        ];


        return inertia('reports/account-reports/index', [
            'accounts' => $accounts,
            'allAccounts' => $allAccounts,
            'pagination' => [
                'current_page' => $accountsPaginated->currentPage(),
                'last_page' => $accountsPaginated->lastPage(),
                'per_page' => $accountsPaginated->perPage(),
                'total' => $accountsPaginated->total(),
            ],
            'towns' => $towns,
            'barangays' => $barangays,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'status' => $selectedStatus,
                'town_id' => $selectedTownId,
                'barangay_id' => $selectedBarangayId,
                'rate_class' => $selectedRateClass,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Apply sorting to the accounts collection
     */
    private function applySorting($accounts, string $sortField, string $sortDirection)
    {
        if ($sortDirection === 'asc') {
            return $accounts->sortBy($sortField)->values();
        }
        return $accounts->sortByDesc($sortField)->values();
    }

    /**
     * Build the base query for accounts with optimized eager loading
     */
    private function buildAccountsQuery(
        ?string $fromDate,
        ?string $toDate,
        ?string $status,
        ?int $townId,
        ?int $barangayId,
        ?string $rateClass
    ) {
        $query = CustomerAccount::query()
            ->with([
                'barangay:id,name,town_id',
                'barangay.town:id,name',
                'customerType:id,customer_type,rate_class',
            ]);

        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }


        if ($status) {
            $query->where('account_status', $status);
        }

        if ($townId) {
            $query->whereHas('barangay', function ($q) use ($townId) {
                $q->where('town_id', $townId);
            });
        }

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        if ($rateClass) {
            $query->whereHas('customerType', function ($q) use ($rateClass) {
                $q->where('rate_class', $rateClass);
            });
        }

        return $query->orderBy('connection_date', 'desc');
    }

    /**
     * Get barangays by town ID for dynamic dropdown
     */
    public function getBarangaysByTown($townId): \Illuminate\Http\JsonResponse
    {
        $barangays = Barangay::where('town_id', $townId)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($barangays);
    }

    /**
     * Map account data to response format
     */
    private function mapAccountData($account): array
    {
        return [
            'id' => $account->id,
            'account_number' => $account->account_number ?? 'N/A',
            'account_name' => $account->account_name ?? 'N/A',
            'customer_type' => $account->customerType?->customer_type ?? 'N/A',
            'rate_class' => $account->customerType?->rate_class ?? 'N/A',
            'account_status' => $account->account_status ?? 'N/A',
            'town' => $account->barangay?->town?->name ?? 'N/A',
            'barangay' => $account->barangay?->name ?? 'N/A',
            'connection_date' => $account->connection_date?->format('Y-m-d') ?? 'N/A',
        ];
    }
}
