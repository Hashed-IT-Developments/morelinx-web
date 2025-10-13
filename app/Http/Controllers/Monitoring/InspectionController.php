<?php

namespace App\Http\Controllers\Monitoring;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\RolesEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignInspectorRequest;
use App\Models\CustApplnInspection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): \Inertia\Response
    {
        $searchTerm = $request->get('search');
        $perPage = $request->get('per_page', 10);
        $sortField = $request->get('sort', 'schedule_date');
        $sortDirection = $request->get('direction', 'asc');

        $statuses = [
            'all',
            InspectionStatusEnum::FOR_INSPECTION,
            InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
        ];

        $selectedStatus = $request->get('status', 'all');

        // Get counts for each status in a single query
        $statusCounts = CustApplnInspection::select('status')
            ->selectRaw('count(*) as count')
            ->whereIn('status', array_filter($statuses, fn($s) => $s !== 'all'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $statusCounts['all'] = CustApplnInspection::count();

        // Start building the query
        $query = CustApplnInspection::with('customerApplication.barangay:id,name', 'inspector');

        // Apply customer application filters
        $query->whereHas('customerApplication', function ($subQuery) use ($searchTerm) {
            $subQuery->noPendingApproval();
            
            if ($searchTerm) {
                $subQuery->search($searchTerm);
            }
        });

        // Apply status filter with qualified column name
        if ($selectedStatus !== 'all') {
            $query->where('cust_appln_inspections.status', $selectedStatus);
        }

        // Handle sorting based on the field
        $this->applySorting($query, $sortField, $sortDirection);

        $inspections = $query->paginate($perPage)->withQueryString();

        $inspectors = User::role(RolesEnum::INSPECTOR)->select('id', 'name')->get();

        return inertia('monitoring/inspections/index', [
            'inspections' => $inspections,
            'search' => $searchTerm,
            'inspectors' => $inspectors,
            'statuses' => $statuses,
            'selectedStatus' => $selectedStatus,
            'statusCounts' => $statusCounts,
            'currentSort' => [
                'field' => $sortField !== 'schedule_date' ? $sortField : null, // Don't show default sort
                'direction' => $sortField !== 'schedule_date' ? $sortDirection : null,
            ],
        ]);
    }

    public function assign(AssignInspectorRequest $request)
    {
        $inspector = User::where('id', $request->inspector_id)
            ->role(RolesEnum::INSPECTOR)
            ->exists();

        if (!$inspector) {
            return back()->withErrors(['inspector_id' => 'The selected inspector is invalid.'])->withInput();
        }

        // Only allow assignment if NO inspection for this application has an inspector_id
        $existingInspection = CustApplnInspection::where('id', $request->inspection_id)
            ->whereNotNull('inspector_id')
            ->exists();

        if ($existingInspection) {
            return back()->withErrors(['inspection' => 'An inspector has already been assigned for this application. Assignment is only allowed once.'])->withInput();
        }

        $inspection = CustApplnInspection::findOrFail($request->inspection_id);

        if ($inspection) {
            $inspection->update([
                'inspector_id' => $request->inspector_id,
                'schedule_date' => $request->schedule_date,
                'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            ]);
            
        } else {
            return back()->withErrors(['inspection' => 'No inspection found for this application.'])->withInput();
        }

        return redirect()->back()->with('success', 'Inspector assigned successfully.');
    }

    /**
     * Apply sorting to the inspection query based on the field and direction
     */
    private function applySorting($query, string $sortField, string $sortDirection): void
    {
        // Validate sort direction
        $direction = in_array(strtolower($sortDirection), ['asc', 'desc']) ? $sortDirection : 'asc';

        switch ($sortField) {
            case 'id':
                $query->orderBy('id', $direction);
                break;

            case 'status':
                $query->orderBy('status', $direction);
                break;

            case 'schedule_date':
                $query->orderBy('schedule_date', $direction);
                break;

            case 'customer_application.account_number':
                $query->orderBy(
                    DB::table('customer_applications')
                        ->select('account_number')
                        ->whereColumn('customer_applications.id', 'cust_appln_inspections.customer_application_id')
                        ->limit(1),
                    $direction
                );
                break;

            case 'customer_application.full_name':
                $query->orderBy(
                    DB::table('customer_applications')
                        ->selectRaw("CONCAT_WS(' ', COALESCE(first_name,''), COALESCE(middle_name,''), COALESCE(last_name,''), COALESCE(suffix,''))")
                        ->whereColumn('customer_applications.id', 'cust_appln_inspections.customer_application_id')
                        ->limit(1),
                    $direction
                );
                break;

            case 'customer_application.customer_type.name':
                $query->orderBy(
                    DB::table('customer_applications')
                        ->join('customer_types', 'customer_applications.customer_type_id', '=', 'customer_types.id')
                        ->select('customer_types.name')
                        ->whereColumn('customer_applications.id', 'cust_appln_inspections.customer_application_id')
                        ->limit(1),
                    $direction
                );
                break;

            case 'customer_application.created_at':
                $query->orderBy(
                    DB::table('customer_applications')
                        ->select('created_at')
                        ->whereColumn('customer_applications.id', 'cust_appln_inspections.customer_application_id')
                        ->limit(1),
                    $direction
                );
                break;

            case 'customer_application.full_address':
                // Note: full_address is a computed field, using street as primary sort field
                $query->orderBy(
                    DB::table('customer_applications')
                        ->select('street')
                        ->whereColumn('customer_applications.id', 'cust_appln_inspections.customer_application_id')
                        ->limit(1),
                    $direction
                );
                break;

            case 'inspector.name':
                $query->orderBy(
                    DB::table('users')
                        ->select('name')
                        ->whereColumn('users.id', 'cust_appln_inspections.inspector_id')
                        ->limit(1),
                    $direction
                );
                break;

            default:
                // Default sorting: schedule_date first, then created_at
                $query->orderBy('schedule_date', 'asc')
                    ->orderBy('created_at', 'desc');
                break;
        }
    }
}
