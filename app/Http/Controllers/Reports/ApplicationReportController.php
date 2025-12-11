<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\CaBillInfo;
use App\Models\CustomerApplication;
use App\Models\Town;
use Illuminate\Http\Request;

class ApplicationReportController extends Controller
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
            'delivery_mode' => 'nullable|string',
            'sort_field' => 'nullable|string',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        // Default date range
        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');

        $fromDate = $validated['from_date'] ?? $defaultFromDate;
        $toDate = $validated['to_date'] ?? $defaultToDate;
        $selectedStatus = $validated['status'] ?? null;
        $selectedTownId = $validated['town_id'] ?? null;
        $selectedBarangayId = $validated['barangay_id'] ?? null;
        $selectedRateClass = $validated['rate_class'] ?? null;
        $selectedDeliveryMode = $validated['delivery_mode'] ?? null;
        $sortField = $validated['sort_field'] ?? 'date_applied';
        $sortDirection = $validated['sort_direction'] ?? 'desc';

        // Fetch all towns for dropdown (cached for performance)
        $towns = cache()->remember('towns_list', 3600, function () {
            return Town::select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        // Fetch barangays for selected town (cached per town)
        $barangays = $selectedTownId
            ? cache()->remember("barangays_for_town_{$selectedTownId}", 3600, function () use ($selectedTownId) {
                return Barangay::where('town_id', $selectedTownId)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get();
            })
            : collect([]);

        // Build query for customer applications
        $applicationsQuery = $this->buildApplicationsQuery(
            $fromDate,
            $toDate,
            $selectedStatus,
            $selectedTownId,
            $selectedBarangayId,
            $selectedRateClass,
            $selectedDeliveryMode
        );

        $allApplications = $applicationsQuery->get()->map(function ($application) {
            return $this->mapApplicationData($application);
        });

        // Apply sorting to all applications
        $allApplications = $this->applySorting($allApplications, $sortField, $sortDirection);

        // Get paginated applications
        $applicationsPaginated = $applicationsQuery->paginate(20);

        $applications = collect($applicationsPaginated->items())->map(function ($application) {
            return $this->mapApplicationData($application);
        });

        // Apply sorting to paginated applications
        $applications = $this->applySorting($applications, $sortField, $sortDirection);

        $deliveryModes = CaBillInfo::whereNotNull('delivery_mode')
            ->get()
            ->pluck('delivery_mode')
            ->flatten()
            ->filter() // Removes empty values
            ->unique()
            ->values()
            ->toArray();

        return inertia('reports/application-reports/index', [
            'applications' => $applications,
            'allApplications' => $allApplications,
            'pagination' => [
                'current_page' => $applicationsPaginated->currentPage(),
                'last_page' => $applicationsPaginated->lastPage(),
                'per_page' => $applicationsPaginated->perPage(),
                'total' => $applicationsPaginated->total(),
            ],
            'towns' => $towns,
            'barangays' => $barangays,
            'delivery_modes' => $deliveryModes,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'status' => $selectedStatus,
                'town_id' => $selectedTownId,
                'barangay_id' => $selectedBarangayId,
                'rate_class' => $selectedRateClass,
                'delivery_mode' => $selectedDeliveryMode,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Apply sorting to the applications collection
     */
    private function applySorting($applications, string $sortField, string $sortDirection)
    {
        if ($sortDirection === 'asc') {
            return $applications->sortBy($sortField)->values();
        }

        return $applications->sortByDesc($sortField)->values();
    }

    /**
     * Build the base query for applications with optimized eager loading
     */
    private function buildApplicationsQuery(
        string $fromDate,
        string $toDate,
        ?string $status,
        ?int $townId,
        ?int $barangayId,
        ?string $rateClass,
        ?string $deliveryMode
    ) {
        $query = CustomerApplication::query()
            ->with([
                'barangay:id,name,town_id',
                'barangay.town:id,name',
                'customerType:id,customer_type,rate_class',
                'billInfo',
            ])
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate);

        // Apply status filter
        if ($status) {
            $query->where('status', $status);
        }

        // Apply town filter
        if ($townId) {
            $query->whereHas('barangay', function ($q) use ($townId) {
                $q->where('town_id', $townId);
            });
        }

        // Apply barangay filter
        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        // Apply rate class filter
        if ($rateClass) {
            $query->whereHas('customerType', function ($q) use ($rateClass) {
                $q->where('rate_class', $rateClass);
            });
        }

        // Apply delivery mode filter
        if ($deliveryMode) {
            $query->whereHas('billInfo', function ($q) use ($deliveryMode) {
                $q->whereJsonContains('delivery_mode', $deliveryMode);
            });
        }

        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Map application data to response format
     */
    private function mapApplicationData($application): array
    {
        return [
            'id' => $application->id,
            'account_number' => $application->account_number ?? 'N/A',
            'customer_name' => $application->identity ?? 'N/A',
            'identity' => $application->identity ?? 'N/A',
            'rate_class' => $application->customerType?->rate_class ?? 'N/A',
            'status' => $application->status,
            'town' => $application->barangay?->town?->name ?? 'N/A',
            'barangay' => $application->barangay?->name ?? 'N/A',
            'load' => $application->connected_load ?? 0,
            'date_applied' => $application->created_at?->format('Y-m-d') ?? 'N/A',
            'date_installed' => $application->date_installed?->format('Y-m-d') ?? 'N/A',
            'delivery_mode' => $application->billInfo?->delivery_mode ?? 'N/A',
        ];
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
}
