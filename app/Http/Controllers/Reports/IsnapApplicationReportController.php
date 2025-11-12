<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\CustomerApplication;
use App\Models\Town;
use Illuminate\Http\Request;

class IsnapApplicationReportController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'status' => 'nullable|string',
            'town_id' => 'nullable|exists:towns,id',
            'rate_class' => 'nullable|string',
        ]);

        // Default date range
        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');

        $fromDate = $validated['from_date'] ?? $defaultFromDate;
        $toDate = $validated['to_date'] ?? $defaultToDate;
        $selectedStatus = $validated['status'] ?? null;
        $selectedTownId = $validated['town_id'] ?? null;
        $selectedRateClass = $validated['rate_class'] ?? null;

        // Fetch all towns for dropdown (cached for performance)
        $towns = cache()->remember('towns_list', 3600, function () {
            return Town::select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        // Build query for customer applications
        $applicationsQuery = $this->buildApplicationsQuery(
            $fromDate,
            $toDate,
            $selectedStatus,
            $selectedTownId,
            $selectedRateClass
        );

        $allApplications = $applicationsQuery->get()->map(function ($application) {
            return $this->mapApplicationData($application);
        });

        // Get paginated applications
        $applicationsPaginated = $applicationsQuery->paginate(20);

        $applications = collect($applicationsPaginated->items())->map(function ($application) {
            return $this->mapApplicationData($application);
        });

        return inertia('reports/isnap-application-reports/index', [
            'applications' => $applications,
            'allApplications' => $allApplications,
            'pagination' => [
                'current_page' => $applicationsPaginated->currentPage(),
                'last_page' => $applicationsPaginated->lastPage(),
                'per_page' => $applicationsPaginated->perPage(),
                'total' => $applicationsPaginated->total(),
            ],
            'towns' => $towns,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'status' => $selectedStatus,
                'town_id' => $selectedTownId,
                'rate_class' => $selectedRateClass,
            ],
        ]);
    }

    /**
     * Build the base query for applications with optimized eager loading
     */
    private function buildApplicationsQuery(
        string $fromDate,
        string $toDate,
        ?string $status,
        ?int $townId,
        ?string $rateClass
    ) {
        $query = CustomerApplication::query()
            ->with([
                'barangay:id,name,town_id',
                'barangay.town:id,name',
                'customerType:id,customer_type,rate_class',
            ])
            ->where('is_isnap', true)
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

        // Apply rate class filter
        if ($rateClass) {
            $query->whereHas('customerType', function ($q) use ($rateClass) {
                $q->where('rate_class', $rateClass);
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
            'customer_name' => $application->full_name ?? 'N/A',
            'rate_class' => $application->customerType?->rate_class ?? 'N/A',
            'status' => $application->status,
            'town' => $application->barangay?->town?->name ?? 'N/A',
            'barangay' => $application->barangay?->name ?? 'N/A',
            'load' => $application->connected_load ?? 0,
            'date_applied' => $application->created_at?->format('Y-m-d') ?? 'N/A',
            'date_installed'=> $application->date_installed?->format('Y-m-d') ?? 'N/A',
        ];
    }
}
