<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteWizardRequest;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('cms/applications/index', [

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $rateClassesWithCustomerTypes = CustomerType::hierarchicalData();
        $rateClasses = CustomerType::getRateClasses();

        return Inertia::render('cms/applications/create', [
            'rateClasses' => $rateClasses,
            'rateClassesWithCustomerTypes' => $rateClassesWithCustomerTypes,
            'idTypes' => config('data.id_types'),
            'attachmentsList' => config('data.attachments')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CompleteWizardRequest $request)
    {
        dd($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(CustomerApplication $customerApplication)
    {
        $customerApplication->load(['barangay.town', 'customerType', 'customerApplicationRequirements.requirement']);
        return inertia('cms/applications/show', [
            'application' => $customerApplication
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CustomerApplication $customerApplication)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CustomerApplication $customerApplication)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CustomerApplication $customerApplication)
    {
        //
    }


    public function fetch(Request $request)
    {
        $searchValue = $request->input('search_value');
        $page = $request->input('page', 1);

        $query = CustomerApplication::with(['barangay.town', 'customerType']);

        if ($searchValue)
        {
            $query->where(function ($q) use ($searchValue) {
                $q->where('first_name', 'like', "%{$searchValue}%")
                    ->orWhere('last_name', 'like', "%{$searchValue}%")
                    ->orWhere('email_address', 'like', "%{$searchValue}%");
            });
        }

        $applications = $query->paginate(10, ['*'], 'page', $page);

        return response()->json($applications);
    }
}


