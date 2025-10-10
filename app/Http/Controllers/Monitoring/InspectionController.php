<?php

namespace App\Http\Controllers\Monitoring;

use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustomerApplication;
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

        $applications = CustomerApplication::with(['inspections', 'barangay.town', 'customerType'])
            ->whereHas('inspections')
            ->where('status', InspectionStatusEnum::FOR_INSPECTION)
            ->when($searchTerm, function ($query, $searchTerm) {
                $query->search($searchTerm);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return inertia('monitoring/inspections/index', [
            'applications' => $applications,
            'search' => $searchTerm,
        ]);
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
