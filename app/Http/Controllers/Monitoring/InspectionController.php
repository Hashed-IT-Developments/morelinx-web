<?php

namespace App\Http\Controllers\Monitoring;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): \Inertia\Response
    {
        $searchTerm = $request->get('search');
        $perPage = $request->get('per_page', 10);
        $applicationStatus = $request->get('application_status');
        $inspectionStatus = $request->get('inspection_status');

        $applications = CustomerApplication::with(['inspections.inspector', 'barangay.town', 'customerType'])
            ->whereHas('inspections', function ($query) use ($inspectionStatus) {
                if ($inspectionStatus) {
                    $query->where('status', $inspectionStatus);
                }
            })
            ->when($applicationStatus, function ($query, $applicationStatus) {
                $query->where('status', $applicationStatus);
            })
            ->when($searchTerm, function ($query, $searchTerm) {
                $query->search($searchTerm);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $inspectors = User::role('inspector')->select('id', 'name')->get();

        return inertia('monitoring/inspections/index', [
            'applications' => $applications,
            'search' => $searchTerm,
            'inspectors' => $inspectors,
            'applicationStatus' => $applicationStatus,
            'inspectionStatus' => $inspectionStatus,
        ]);
    }

    public function assign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_application_id' => 'required|exists:customer_applications,id',
            'inspector_id' => 'required|exists:users,id',
            'schedule_date' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Only update the latest inspection, do not create a new one
        $inspection = CustApplnInspection::where('customer_application_id', $request->customer_application_id)
            ->latest()
            ->first();

        if ($inspection) {
            $inspection->inspector_id = $request->inspector_id;
            $inspection->schedule_date = $request->schedule_date;
            $inspection->status = InspectionStatusEnum::FOR_APPROVAL;
            $inspection->save();
        } else {
            // Optionally, return an error if no inspection exists
            return back()->withErrors(['inspection' => 'No inspection found for this application.'])->withInput();
        }

        return redirect()->back()->with('success', 'Inspector assigned successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
