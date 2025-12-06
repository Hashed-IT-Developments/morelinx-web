<?php

namespace App\Http\Controllers\Reports;

use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustApplnInspection;
use Illuminate\Http\Request;

class InspectionsDailyMonitorReportController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'status' => 'nullable|string|in:all,for_inspection,for_inspection_approval,approved,disapproved,rejected,reassigned',
            'sort_field' => 'nullable|string',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');

        $fromDate = $validated['from_date'] ?? $defaultFromDate;
        $toDate = $validated['to_date'] ?? $defaultToDate;
        $selectedStatus = $validated['status'] ?? 'all';
        $sortField = $validated['sort_field'] ?? 'schedule_date';
        $sortDirection = $validated['sort_direction'] ?? 'asc';

        $baseQuery = $this->buildInspectionsQuery($fromDate, $toDate, $selectedStatus, $sortField, $sortDirection);
        $inspectionsPaginated = (clone $baseQuery)->paginate(20);

        $inspections = collect($inspectionsPaginated->items())->map(function ($inspection) {
            return $this->mapInspectionData($inspection);
        });

        $allInspections = (clone $baseQuery)->get()->map(function ($inspection) {
            return $this->mapInspectionData($inspection);
        });

        return inertia('reports/inspections-daily-monitor/index', [
            'inspections' => $inspections,
            'allInspections' => $allInspections,
            'pagination' => [
                'current_page' => $inspectionsPaginated->currentPage(),
                'last_page' => $inspectionsPaginated->lastPage(),
                'per_page' => $inspectionsPaginated->perPage(),
                'total' => $inspectionsPaginated->total(),
            ],
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'status' => $selectedStatus,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Build the base query for inspections with optimized eager loading and database-level sorting
     */
    private function buildInspectionsQuery(string $fromDate, string $toDate, string $status, string $sortField = 'schedule_date', string $sortDirection = 'asc')
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

        if ($status !== 'all') {
            $statusMap = [
                'for_inspection' => InspectionStatusEnum::FOR_INSPECTION,
                'for_inspection_approval' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
                'approved' => InspectionStatusEnum::APPROVED,
                'disapproved' => InspectionStatusEnum::DISAPPROVED,
                'rejected' => InspectionStatusEnum::REJECTED,
                'reassigned' => InspectionStatusEnum::REASSIGNED,
            ];
            
            if (isset($statusMap[$status])) {
                $query->where('status', $statusMap[$status]);
            }
        }

        if ($sortField === 'schedule_date') {
            $query->orderByRaw("COALESCE(schedule_date, created_at) {$sortDirection}");
        } else {
            $query->orderByRaw("COALESCE(schedule_date, created_at) {$sortDirection}");
        }

        return $query;
    }

    /**
     * Map inspection data to response format
     */
    private function mapInspectionData($inspection): array
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
