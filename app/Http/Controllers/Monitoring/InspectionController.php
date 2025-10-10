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

        $statuses = [
            ApplicationStatusEnum::FOR_INSPECTION,
            ApplicationStatusEnum::FOR_VERIFICATION,
            ApplicationStatusEnum::IN_PROCESS,
        ];

        $selectedStatus = $request->get('status', ApplicationStatusEnum::FOR_INSPECTION);

        // Get counts for the three statuses and all applications
        $statusCounts = [];
        foreach ($statuses as $status) {
            $statusCounts[$status] = CustomerApplication::where('status', $status)->count();
        }
        $statusCounts['ALL'] = CustomerApplication::count();

        $applications = CustomerApplication::with(['inspections.inspector', 'barangay.town', 'customerType'])
            ->when($selectedStatus, function ($query, $selectedStatus) {
                $query->where('status', $selectedStatus);
            })
            ->when($searchTerm, function ($query, $searchTerm) {
                $query->search($searchTerm);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $inspectors = User::role('inspector')->select('id', 'name')->get();

        return inertia('monitoring/inspections/index', [
            'applications' => $applications,
            'search' => $searchTerm,
            'inspectors' => $inspectors,
            'statuses' => $statuses,
            'selectedStatus' => $selectedStatus,
            'statusCounts' => $statusCounts,
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

    // Only allow assignment if NO inspection for this application has an inspector_id
    $existingInspection = CustApplnInspection::where('customer_application_id', $request->customer_application_id)
        ->whereNotNull('inspector_id')
        ->first();

    if ($existingInspection) {
        return back()->withErrors(['inspection' => 'An inspector has already been assigned for this application. Assignment is only allowed once.'])->withInput();
    }

    // Get the latest inspection (should be the one to assign)
    $inspection = CustApplnInspection::where('customer_application_id', $request->customer_application_id)
        ->latest()
        ->first();

    if ($inspection) {
        $inspection->inspector_id = $request->inspector_id;
        $inspection->schedule_date = $request->schedule_date;
        $inspection->status = InspectionStatusEnum::FOR_APPROVAL;
        $inspection->save();
    } else {
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
