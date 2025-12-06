<?php

namespace App\Http\Controllers\Reports;

use App\Enums\RolesEnum;
use App\Http\Controllers\Controller;
use App\Models\CustApplnInspection;
use App\Models\User;
use Illuminate\Http\Request;

class InspectionsApplicationTrackingReportController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'inspector_id' => 'nullable|exists:users,id',
            'sort_field' => 'nullable|string',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');

        $fromDate = $validated['from_date'] ?? $defaultFromDate;
        $toDate = $validated['to_date'] ?? $defaultToDate;
        $selectedInspectorId = $validated['inspector_id'] ?? null;
        $sortField = $validated['sort_field'] ?? 'schedule_date';
        $sortDirection = $validated['sort_direction'] ?? 'asc';

        $inspectors = cache()->remember('inspectors_list', 3600, function () {
            return User::role(RolesEnum::INSPECTOR)
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        $applications = collect([]);
        $allApplications = collect([]);
        
        if ($selectedInspectorId) {
            $baseQuery = $this->buildApplicationsQuery($fromDate, $toDate, $selectedInspectorId, $sortField, $sortDirection);

            $applicationsPaginated = (clone $baseQuery)->paginate(20);

            $applications = collect($applicationsPaginated->items())->map(function ($inspection) {
                return $this->mapApplicationData($inspection);
            });

            $allApplications = (clone $baseQuery)->get()->map(function ($inspection) {
                return $this->mapApplicationData($inspection);
            });

            $pagination = [
                'current_page' => $applicationsPaginated->currentPage(),
                'last_page' => $applicationsPaginated->lastPage(),
                'per_page' => $applicationsPaginated->perPage(),
                'total' => $applicationsPaginated->total(),
            ];
        } else {
            $pagination = [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 20,
                'total' => 0,
            ];
        }

        return inertia('reports/inspections-application-tracking/index', [
            'applications' => $applications,
            'allApplications' => $allApplications,
            'pagination' => $pagination,
            'inspectors' => $inspectors,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'inspector_id' => $selectedInspectorId,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Build the base query for applications with optimized eager loading and database-level sorting
     */
    private function buildApplicationsQuery(string $fromDate, string $toDate, int $inspectorId, string $sortField = 'schedule_date', string $sortDirection = 'asc')
    {
        $query = CustApplnInspection::query()
            ->with([
                'customerApplication' => function ($query) {
                    $query->select('*');
                },
                'customerApplication.barangay:id,name,town_id',
                'customerApplication.barangay.town:id,name',
                'customerApplication.customerType:id,customer_type,rate_class',
                'customerApplication.district:id,name',
                'inspector:id,name,email',
            ])
            ->where('inspector_id', $inspectorId)
            ->where(function ($query) use ($fromDate, $toDate) {
                $query->where(function ($q) use ($fromDate, $toDate) {
                    $q->whereNotNull('schedule_date')
                      ->whereDate('schedule_date', '>=', $fromDate)
                      ->whereDate('schedule_date', '<=', $toDate);
                })
                ->orWhere(function ($q) use ($fromDate, $toDate) {
                    $q->whereNull('schedule_date')
                      ->whereDate('created_at', '>=', $fromDate)
                      ->whereDate('created_at', '<=', $toDate);
                });
            });

        if ($sortField === 'schedule_date') {
            $query->orderByRaw("COALESCE(schedule_date, created_at) {$sortDirection}");
        } else {
            $query->orderByRaw("COALESCE(schedule_date, created_at) {$sortDirection}");
        }

        return $query;
    }

    /**
     * Map application data to response format
     */
    private function mapApplicationData($inspection): array
    {
        $customerApp = $inspection->customerApplication;
        
        return [
            'id' => $inspection->id,
            'inspection_id' => $inspection->id,
            'account_number' => $customerApp?->account_number ?? 'N/A',
            'customer' => $customerApp?->identity ?? 'N/A',
            'customer_name' => $customerApp?->identity ?? 'N/A',
            'status' => $inspection->status,
            'customer_type' => $customerApp?->customerType?->full_text ?? 'N/A',
            'address' => $customerApp?->full_address ?? 'N/A',
            'town' => $customerApp?->barangay?->town?->name ?? 'N/A',
            'barangay' => $customerApp?->barangay?->name ?? 'N/A',
            'schedule_date' => $inspection->schedule_date,
            'inspector' => $inspection->inspector?->name ?? 'N/A',
            'customer_application' => $customerApp ? [
                'id' => $customerApp->id,
            ] : null,
        ];
    }
}
