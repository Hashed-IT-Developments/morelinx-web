<?php

namespace App\Http\Controllers\Monitoring;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\RolesEnum;
use App\Events\MakeLog;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignInspectorRequest;
use App\Models\CustApplnInspection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            InspectionStatusEnum::APPROVED,
            InspectionStatusEnum::DISAPPROVED,
            InspectionStatusEnum::REASSIGNED,
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
        $query = CustApplnInspection::with([
            'customerApplication.barangay:id,name', 
            'customerApplication.approvalState.flow',
            'inspector'
        ]);

        // Apply customer application filters
        $query->whereHas('customerApplication', function ($subQuery) use ($searchTerm) {
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

        $inspection = CustApplnInspection::findOrFail($request->inspection_id);

        // Check if this is a re-assignment for a disapproved inspection
        if ($inspection->status === InspectionStatusEnum::DISAPPROVED) {
            // Mark the old inspection as reassigned
            $inspection->update(['status' => InspectionStatusEnum::REASSIGNED]);
            
            // Create a duplicate inspection for reinspection
            // Exclude relationships that should not be copied
            $newInspection = $inspection->replicate(['approvalState']);
            $newInspection->inspector_id = $request->inspector_id;
            $newInspection->schedule_date = $request->schedule_date;
            $newInspection->status = InspectionStatusEnum::FOR_INSPECTION_APPROVAL;
            // Ensure inspection-specific fields are reset
            $newInspection->inspection_time = null;
            $newInspection->signature = null;
            $newInspection->save();

            return redirect()->back()->with('success', 'Inspector re-assigned successfully. A new inspection record has been created.');
        }

        // For new assignments (status is for_inspection)
        // Only allow assignment if NO inspector has been assigned yet
        if ($inspection->inspector_id !== null) {
            return back()->withErrors(['inspection' => 'An inspector has already been assigned for this inspection.'])->withInput();
        }

        // Load customer application with approval flow data
        $inspection->load('customerApplication.approvalState.flow');
        $application = $inspection->customerApplication;
        
        // Check approval flow requirements
        if ($application && $application->has_approval_flow && $application->approvalState) {
            $approvalState = $application->approvalState;
            
            // If there's an approval flow for Customer Application module
            if ($approvalState->flow && $approvalState->flow->module === 'customer_application') {
                // Only allow assignment if the application is approved
                if ($approvalState->status !== 'approved') {
                    return back()->withErrors([
                        'inspection' => 'Cannot assign inspector. The customer application must be approved first.'
                    ])->withInput();
                }
            }
        }
        
        $inspection->update([
            'inspector_id' => $request->inspector_id,
            'schedule_date' => $request->schedule_date,
            'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
        ]);
        
        // Update ageing timeline - forwarded to inspector
        $inspection->customerApplication->ageingTimeline()->updateOrCreate(
            ['customer_application_id' => $inspection->customer_application_id],
            [
                'forwarded_to_inspector' => now(),
                'inspection_date' => $request->schedule_date
            ]
        );
        
        // Log inspector assignment
        event(new MakeLog(
            'application',
            $inspection->customer_application_id,
            'Inspector Assigned',
            'Inspector ' . $inspection->inspector->name . ' has been assigned to this application for inspection.',
            Auth::id(),
        ));

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
                // Always show records WITH schedule_date first, then those without
                $query->orderByRaw('CASE WHEN schedule_date IS NULL THEN 1 ELSE 0 END')
                      ->orderBy('schedule_date', $direction)
                      ->orderBy('created_at', 'desc');
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

    /**
     * Get calendar data for inspections with for_inspection_approval status in current month
     */
    public function calendar(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);
        $inspectorId = $request->get('inspector_id');

        $inspections = CustApplnInspection::with([
            'customerApplication:id,first_name,middle_name,last_name,suffix,account_number,email_address,mobile_1,created_at,customer_type_id,trade_name',
            'customerApplication.customerType:id,rate_class',
            'inspector:id,name'
        ])
        ->where('status', InspectionStatusEnum::FOR_INSPECTION_APPROVAL)
        ->whereNotNull('schedule_date')
        ->whereYear('schedule_date', $year)
        ->whereMonth('schedule_date', $month)
        ->when($inspectorId, function ($query) use ($inspectorId) {
            $query->where('inspector_id', $inspectorId);
        })
        ->orderBy('schedule_date', 'asc')
        ->get();

        return response()->json([
            'data' => $inspections->map(function ($inspection) {
                return [
                    'id' => $inspection->id,
                    'status' => $inspection->status,
                    'schedule_date' => $inspection->schedule_date,
                    'house_loc' => $inspection->house_loc,
                    'meter_loc' => $inspection->meter_loc,
                    'bill_deposit' => $inspection->bill_deposit,
                    'remarks' => $inspection->remarks,
                    'inspector' => $inspection->inspector,
                    'customer_application' => $inspection->customerApplication ? [
                        'id' => $inspection->customerApplication->id,
                        'first_name' => $inspection->customerApplication->first_name,
                        'middle_name' => $inspection->customerApplication->middle_name,
                        'last_name' => $inspection->customerApplication->last_name,
                        'suffix' => $inspection->customerApplication->suffix,
                        'full_address' => $inspection->customerApplication->full_address,
                        'account_number' => $inspection->customerApplication->account_number,
                        'email_address' => $inspection->customerApplication->email_address,
                        'mobile_1' => $inspection->customerApplication->mobile_1,
                        'created_at' => $inspection->customerApplication->created_at,
                        'identity' => $inspection->customerApplication->identity,
                    ] : null,
                ];
            })
        ]);
    }

    /**
     * Update the schedule date for an inspection (Superadmin only)
     */
    public function updateSchedule(Request $request, CustApplnInspection $inspection)
    {
        // Additional NDOG_SUPERVISOR check (redundant with middleware but good practice)
        if (!$request->user()->hasRole(RolesEnum::NDOG_SUPERVISOR)) {
            return response()->json([
                'message' => 'Unauthorized. Only NDOG_SUPERVISOR users can update inspection schedules.'
            ], 403);
        }

        $request->validate([
            'schedule_date' => 'required|date|after_or_equal:today',
        ], [
            'schedule_date.after_or_equal' => 'Schedule date cannot be in the past.',
        ]);

        try {
            $inspection->update([
                'schedule_date' => $request->schedule_date,
            ]);

            return response()->json([
                'message' => 'Inspection schedule updated successfully.',
                'data' => [
                    'id' => $inspection->id,
                    'schedule_date' => $inspection->schedule_date,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update inspection schedule.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of inspectors for filtering
     */
    public function getInspectors()
    {
        $inspectors = User::role(RolesEnum::INSPECTOR)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $inspectors
        ]);
    }

    /**
     * Get inspection summary details
     */
    public function summary(CustApplnInspection $inspection)
    {
        $inspection->load([
            'customerApplication:id,account_number,first_name,middle_name,last_name,suffix,trade_name,customer_type_id,email_address,mobile_1',
            'customerApplication.customerType:id,rate_class,customer_type',
            'customerApplication.account:id,customer_application_id',
            'inspector:id,name',
            'materialsUsed:id,cust_appln_inspection_id,material_name,unit,quantity,amount',
        ]);

        $payables = [];
        if ($inspection->customerApplication && $inspection->customerApplication->account) {
            $payables = $inspection->customerApplication->account->payables()
                ->select('id', 'type', 'payable_category', 'total_amount_due', 'amount_paid', 'balance', 'status')
                ->get()
                ->toArray();
        }

        $materialsUsed = $inspection->materialsUsed->map(function ($material) {
            return [
                'id' => $material->id,
                'material_name' => $material->material_name,
                'unit' => $material->unit,
                'quantity' => $material->quantity,
                'amount' => $material->amount,
                'total_amount' => $material->quantity * $material->amount,
            ];
        });

        $signatureUrl = null;
        if ($inspection->signature) {
            if (str_starts_with($inspection->signature, 'http') || str_starts_with($inspection->signature, 'data:image')) {
                $signatureUrl = $inspection->signature;
            } else {
                $signaturePath = $inspection->signature;
                if (str_contains($signaturePath, '/storage/app/public/signatures/')) {
                    $signaturePath = substr($signaturePath, strpos($signaturePath, '/storage/app/public/') + strlen('/storage/app/public/'));
                } elseif (str_starts_with($signaturePath, 'signatures/')) {
                    $signaturePath = $signaturePath;
                }
                $signatureUrl = asset('storage/' . $signaturePath);
            }
        }

        return response()->json([
            'id' => $inspection->id,
            'status' => $inspection->status,
            'house_loc' => $inspection->house_loc,
            'meter_loc' => $inspection->meter_loc,
            'schedule_date' => $inspection->schedule_date,
            'inspection_time' => $inspection->inspection_time,
            'sketch_loc' => $inspection->sketch_loc,
            'near_meter_serial_1' => $inspection->near_meter_serial_1,
            'near_meter_serial_2' => $inspection->near_meter_serial_2,
            'feeder' => $inspection->feeder,
            'meter_type' => $inspection->meter_type,
            'service_drop_size' => $inspection->service_drop_size,
            'protection' => $inspection->protection,
            'meter_class' => $inspection->meter_class,
            'connected_load' => $inspection->connected_load,
            'transformer_size' => $inspection->transformer_size,
            'bill_deposit' => $inspection->bill_deposit,
            'material_deposit' => $inspection->material_deposit,
            'labor_cost' => $inspection->labor_cost,
            'total_labor_costs' => $inspection->total_labor_costs,
            'signature' => $signatureUrl,
            'remarks' => $inspection->remarks,
            'created_at' => $inspection->created_at,
            'updated_at' => $inspection->updated_at,
            'inspector' => $inspection->inspector,
            'customer_application' => $inspection->customerApplication ? [
                'id' => $inspection->customerApplication->id,
                'account_number' => $inspection->customerApplication->account_number,
                'full_name' => $inspection->customerApplication->full_name,
                'identity' => $inspection->customerApplication->identity,
                'email_address' => $inspection->customerApplication->email_address,
                'mobile_1' => $inspection->customerApplication->mobile_1,
            ] : null,
            'materials_used' => $materialsUsed,
            'payables' => $payables,
        ]);
    }

    public function decline(CustApplnInspection $inspection, Request $request)
    {
        try {

            $remarks = $request['remarks'];
        
            $inspection->customerApplication->update([
                'status' => ApplicationStatusEnum::FOR_INSTALLATION_APPROVAL,
            ]);

    
            $inspection->update([
                'status' => InspectionStatusEnum::DISAPPROVED,
                'remarks' => $remarks,
            ]);
            

            return redirect()
                ->back()
                ->with('message', 'Inspection has been declined successfully.');
        } catch (\Exception $e) {

            return redirect()
                ->back()
                ->with('error', 'An error occurred while declining the inspection. Please try again.');
        }
    }

}
