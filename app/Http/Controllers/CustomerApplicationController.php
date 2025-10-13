<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteWizardRequest;
use App\Models\CaAttachment;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use App\Models\CaContactInfo;
use App\Models\CaBillInfo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('cms/applications/index');
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
        $data = $request->validated();

        // \Log::info('ALL REQUEST DATA:', $request->all());
        // \Log::info('FILES RECEIVED:', array_keys($request->allFiles()));
        // \Log::info('ALL FILES DETAILED:', $request->allFiles());

        return \DB::transaction(function () use ($request) {
            $customerType = CustomerType::where('rate_class', $request->rate_class)
                ->where('customer_type', $request->customer_type)
                ->first();

            $custApp = CustomerApplication::create([
                'customer_type_id' => $customerType->id,
                'connected_load' => $request->connected_load,
                'property_ownership' => $request->property_ownership,
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'birth_date' => date('Y-m-d', strtotime($request->birthdate)),
                'nationality'=> $request->nationality,
                'gender'=> $request->sex,
                'marital_status'=> $request->marital_status,
                'email_address' => $request->cp_email,
                'tel_no_1' => $request->cp_tel_no,
                'tel_no_2' => $request->cp_tel_no_2,
                'mobile_1' => $request->cp_mobile_no,
                'mobile_2' => $request->cp_mobile_no_2,
                'landmark'=> $request->landmark,
                'unit_no'=> $request->unit_no,
                'building'=> $request->building,
                'street'=> $request->street,
                'subdivision'=> $request->subdivision,
                'barangay_id'=> $request->barangay,
                'id_type_1'=> $request->id_type,
                'id_type_2'=> $request->id_type_2,
                'id_number_1'=> $request->id_number,
                'id_number_2'=> $request->id_number_2,
                'is_sc'=> $request->is_senior_citizen,
                'sc_from'=> $request->sc_from,
                'sc_number'=> $request->sc_number,
                // 'sketch_lat_long' => $data['sketch_path'],
            ]);

            CaContactInfo::create([
                'customer_application_id' => $custApp->id,
                'last_name' => $request->cp_lastname,
                'first_name' => $request->cp_firstname,
                'middle_name' => $request->cp_middlename,
                'relation' => $request->relationship,
            ]);

            CaBillInfo::create([
                'customer_application_id' => $custApp->id,
                'barangay_id' => $request->barangay,
                'subdivision' => $request->bill_subdivision,
                'unit_no' => $request->bill_house_no,
                'street' => $request->bill_street,
                'building' => $request->bill_building_floor,
                'delivery_mode' => $request->bill_delivery
            ]);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $type => $file) {
                    if ($file->isValid()) {

                        $path = $file->store('attachments', 'public'); //uses storage:link

                        CaAttachment::create([
                            'customer_application_id' => $custApp->id,
                            'type' => $type,
                            'path' => $path,
                        ]);
                    }
                }
            }

            return response()->json([
                'message' => 'success',
                'id' => $custApp->id,
            ]);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(CustomerApplication $customerApplication)
    {
        $customerApplication->load(['barangay.town', 'customerType', 'customerApplicationRequirements.requirement', 'inspections']);
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
            $query->search($searchValue);
        }

        $applications = $query->paginate(10, ['*'], 'page', $page);

        return response()->json($applications);
    }

    public function amendCustomerInfo(Request $request) {
        $request->validate([
            'last_name' => 'string|min:3|nullable',
            'first_name' => 'string|min:3|nullable',
            'middle_name' => 'string|min:3|nullable',
            'suffix' => 'string|min:3|nullable',
        ]);

        return response()->json($request->all());
    }
}


