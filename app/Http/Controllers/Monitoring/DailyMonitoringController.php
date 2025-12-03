<?php

namespace App\Http\Controllers\Monitoring;

use App\Enums\InspectionStatusEnum;
use App\Enums\RolesEnum;
use App\Http\Controllers\Controller;
use App\Models\CustApplnInspection;
use App\Models\User;
use Illuminate\Http\Request;

class DailyMonitoringController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'inspections_from_date' => 'nullable|date',
            'inspections_to_date' => 'nullable|date|after_or_equal:inspections_from_date',
            'applications_from_date' => 'nullable|date',
            'applications_to_date' => 'nullable|date|after_or_equal:applications_from_date',
            'inspector_id' => 'nullable|exists:users,id',
            'inspections_status' => 'nullable|string|in:pending,completed,all,for_inspection,for_inspection_approval,approved,disapproved,rejected,reassigned',
        ]);

        // Default date range
        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');
        
        // Inspections table date filters
        $inspectionsFromDate = $validated['inspections_from_date'] ?? $validated['from_date'] ?? $defaultFromDate;
        $inspectionsToDate = $validated['inspections_to_date'] ?? $validated['to_date'] ?? $defaultToDate;
        
        // Applications table date filters
        $applicationsFromDate = $validated['applications_from_date'] ?? $validated['from_date'] ?? $defaultFromDate;
        $applicationsToDate = $validated['applications_to_date'] ?? $validated['to_date'] ?? $defaultToDate;
        
        $selectedInspectorId = $validated['inspector_id'] ?? null;
        $selectedInspectionsStatus = $validated['inspections_status'] ?? 'all';
        
        // Fetch all inspectors for dropdown (cached for performance)
        $inspectors = cache()->remember('inspectors_list', 3600, function () {
            return User::role(RolesEnum::INSPECTOR)
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        // Build query for customer inspections with its own date filter and status filter
        $customerInspectionsQuery = $this->buildInspectionsQuery($inspectionsFromDate, $inspectionsToDate, $selectedInspectionsStatus);
        
        // Get ALL inspections for modal (not paginated)
        $allCustomerInspections = $customerInspectionsQuery->get()->map(function ($inspection) {
            return $this->mapInspectionData($inspection);
        });
        
        // Get paginated inspections for table display
        $customerInspectionsPaginated = $this->buildInspectionsQuery($inspectionsFromDate, $inspectionsToDate, $selectedInspectionsStatus)
            ->paginate(5, ['*'], 'inspections_page');
        $customerInspections = collect($customerInspectionsPaginated->items())->map(function ($inspection) {
            return $this->mapInspectionData($inspection);
        });

        // Build query for inspector applications with its own date filter (NO status filter)
        $inspectorApplications = collect([]);
        $allInspectorApplications = collect([]);
        $inspectorApplicationsPagination = null;
        if ($selectedInspectorId) {
            // Applications query uses 'all' for status (no status filter)
            $inspectorApplicationsQuery = $this->buildInspectionsQuery($applicationsFromDate, $applicationsToDate, 'all')
                ->where('inspector_id', $selectedInspectorId);
            
            // Get ALL applications for modal (not paginated)
            $allInspectorApplications = $inspectorApplicationsQuery->get()->map(function ($inspection) {
                return $this->mapInspectionData($inspection, true);
            });
            
            // Get paginated applications for table display
            $inspectorApplicationsPaginated = $this->buildInspectionsQuery($applicationsFromDate, $applicationsToDate, 'all')
                ->where('inspector_id', $selectedInspectorId)
                ->paginate(5, ['*'], 'applications_page');
            $inspectorApplications = collect($inspectorApplicationsPaginated->items())->map(function ($inspection) {
                return $this->mapInspectionData($inspection, true);
            });
            $inspectorApplicationsPagination = [
                'current_page' => $inspectorApplicationsPaginated->currentPage(),
                'last_page' => $inspectorApplicationsPaginated->lastPage(),
                'per_page' => $inspectorApplicationsPaginated->perPage(),
                'total' => $inspectorApplicationsPaginated->total(),
            ];
        }

        return inertia('monitoring/daily-monitoring/index', [
            'customerInspections' => $customerInspections,
            'allCustomerInspections' => $allCustomerInspections,
            'customerInspectionsPagination' => [
                'current_page' => $customerInspectionsPaginated->currentPage(),
                'last_page' => $customerInspectionsPaginated->lastPage(),
                'per_page' => $customerInspectionsPaginated->perPage(),
                'total' => $customerInspectionsPaginated->total(),
            ],
            'inspectorApplications' => $inspectorApplications,
            'allInspectorApplications' => $allInspectorApplications,
            'inspectorApplicationsPagination' => $inspectorApplicationsPagination,
            'inspectors' => $inspectors,
            'filters' => [
                'from_date' => $defaultFromDate,
                'to_date' => $defaultToDate,
                'inspections_from_date' => $inspectionsFromDate,
                'inspections_to_date' => $inspectionsToDate,
                'applications_from_date' => $applicationsFromDate,
                'applications_to_date' => $applicationsToDate,
                'inspector_id' => $selectedInspectorId,
                'inspections_status' => $selectedInspectionsStatus,
            ],
        ]);
    }

    /**
     * Build the base query for inspections with optimized eager loading
     */
    private function buildInspectionsQuery(string $fromDate, string $toDate, string $status)
    {
        $query = CustApplnInspection::query()
            ->with([
                'customerApplication' => function ($query) {
                    $query->select('*'); // Load all fields for modal display
                },
                'customerApplication.barangay:id,name,town_id',
                'customerApplication.barangay.town:id,name',
                'customerApplication.customerType:id,customer_type,rate_class',
                'customerApplication.district:id,name',
                'inspector:id,name,email',
            ])
            ->where(function ($query) use ($fromDate, $toDate) {
                // First check if schedule_date is set and within range
                $query->where(function ($q) use ($fromDate, $toDate) {
                    $q->whereNotNull('schedule_date')
                      ->whereDate('schedule_date', '>=', $fromDate)
                      ->whereDate('schedule_date', '<=', $toDate);
                })
                // If schedule_date is null, fall back to created_at
                ->orWhere(function ($q) use ($fromDate, $toDate) {
                    $q->whereNull('schedule_date')
                      ->whereDate('created_at', '>=', $fromDate)
                      ->whereDate('created_at', '<=', $toDate);
                });
            });

        // Apply status filter
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

        return $query->orderByRaw('COALESCE(schedule_date, created_at) asc');
    }

    /**
     * Map inspection data to response format
     */
    private function mapInspectionData($inspection, bool $includeInspector = false): array
    {
        $customerApp = $inspection->customerApplication;
        
        $data = [
            'id' => $inspection->id,
            'inspection_id' => $inspection->id,
            'customer' => $customerApp?->identity ?? 'N/A',
            'status' => $inspection->status,
            'customer_type' => $customerApp?->customerType?->full_text ?? 'N/A',
            'address' => $customerApp?->full_address ?? 'N/A',
            'schedule_date' => $inspection->schedule_date,
            
            // Extended details for modal
            'customer_application' => $customerApp ? [
                'id' => $customerApp->id,
                'account_number' => $customerApp->account_number,
                'first_name' => $customerApp->first_name,
                'last_name' => $customerApp->last_name,
                'middle_name' => $customerApp->middle_name,
                'suffix' => $customerApp->suffix,
                'full_name' => $customerApp->full_name,
                'identity' => $customerApp->identity,
                'birth_date' => $customerApp->birth_date,
                'nationality' => $customerApp->nationality,
                'gender' => $customerApp->gender,
                'marital_status' => $customerApp->marital_status,
                'email_address' => $customerApp->email_address,
                'mobile_1' => $customerApp->mobile_1,
                'mobile_2' => $customerApp->mobile_2,
                'tel_no_1' => $customerApp->tel_no_1,
                'tel_no_2' => $customerApp->tel_no_2,
                'barangay' => $customerApp->barangay?->name,
                'town' => $customerApp->barangay?->town?->name,
                'district' => $customerApp->district?->name,
                'customer_type' => $customerApp->customerType?->full_text,
                'connected_load' => $customerApp->connected_load,
                'property_ownership' => $customerApp->property_ownership,
                'is_sc' => $customerApp->is_sc,
                'is_isnap' => $customerApp->is_isnap,
                'sitio' => $customerApp->sitio,
                'unit_no' => $customerApp->unit_no,
                'building' => $customerApp->building,
                'street' => $customerApp->street,
                'subdivision' => $customerApp->subdivision,
                'landmark' => $customerApp->landmark,
                'full_address' => $customerApp->full_address,
                'sketch_lat_long' => $customerApp->sketch_lat_long,
            ] : null,
        ];

        if ($includeInspector) {
            $data['inspector'] = $inspection->inspector?->name ?? 'N/A';
        }

        return $data;
    }
}
