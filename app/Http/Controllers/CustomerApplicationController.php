<?php

namespace App\Http\Controllers;

use App\Enums\RateClass;
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
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $rateClassesWithCustomerTypes = CustomerType::hierarchicalData();
        $rateClasses = CustomerType::getRateClasses();

        return Inertia::render('cms/applications/create',[
            'rateClasses' => $rateClasses,
            'rateClassesWithCustomerTypes' => $rateClassesWithCustomerTypes,
        ]);
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
    public function show(CustomerApplication $customerApplication)
    {
        //
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
}
