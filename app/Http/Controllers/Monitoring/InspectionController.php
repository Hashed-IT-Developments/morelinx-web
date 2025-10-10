<?php

namespace App\Http\Controllers\Monitoring;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignInspectorRequest;
use App\Models\CustApplnInspection;
use App\Models\User;
use Illuminate\Http\Request;

class InspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): \Inertia\Response
    {
        $searchTerm = $request->get('search');
        $perPage = $request->get('per_page', 10);

        $statuses = [
            'all',
            ApplicationStatusEnum::FOR_INSPECTION,
            InspectionStatusEnum::FOR_APPROVAL,
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

        $inspections = CustApplnInspection::with('customerApplication.barangay:id,name', 'inspector')
            ->whereHas('customerApplication', function ($query) use ($searchTerm) {
                if ($searchTerm) {
                    $query->search($searchTerm);
                }
            })
            ->where('status', $selectedStatus === 'all' ? '!=' : '=', $selectedStatus === 'all' ? '' : $selectedStatus)
            ->orderBy('schedule_date', 'asc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $inspectors = User::role('inspector')->select('id', 'name')->get();

        return inertia('monitoring/inspections/index', [
            'inspections' => $inspections,
            'search' => $searchTerm,
            'inspectors' => $inspectors,
            'statuses' => $statuses,
            'selectedStatus' => $selectedStatus,
            'statusCounts' => $statusCounts,
        ]);
    }

    public function assign(AssignInspectorRequest $request)
    {
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
                'status' => InspectionStatusEnum::FOR_APPROVAL,
            ]);
            
        } else {
            return back()->withErrors(['inspection' => 'No inspection found for this application.'])->withInput();
        }

        return redirect()->back()->with('success', 'Inspector assigned successfully.');
    }
}
