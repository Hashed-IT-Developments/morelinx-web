<?php

namespace App\Http\Controllers;

use App\Enums\InspectionStatusEnum;
use App\Http\Requests\CompleteWizardRequest;
use App\Models\CaAttachment;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use App\Models\CaContactInfo;
use App\Models\CaBillInfo;
use App\Models\CustApplnInspection;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CustomerApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): \Inertia\Response
    {
        return inertia('cms/applications/index', [
            'applications' => Inertia::defer(function () use ($request) {
                $search = $request['search'];

                $query = CustomerApplication::with(['barangay.town', 'customerType']);

                if ($search)
                {
                    $query->search($search);

                    if ($query->count() === 0)
                    {
                        return null;
                    }
                }
                return $query->paginate(10);
            }),
            'search' => $request->input('search', null)

        ]);
    }

    /**
     * Display applications that are ready for contract signing.
     */
    public function showContractSigning(Request $request)
    {
        return inertia('contract-signing/index', [
            'applications' => Inertia::defer(function () use ($request) {
                $search = $request['search'];

                $query = CustomerApplication::with(['barangay.town', 'customerType'])
                    ->where('status', 'for_signing');

                if ($search) {
                    $query->search($search);

                    if ($query->count() === 0) {
                        return null;
                    }
                }

                return $query->paginate(10);
            }),
            'search' => $request->input('search', null)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
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
    public function store(CompleteWizardRequest $request): \Illuminate\Http\JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $customerType = CustomerType::where('rate_class', $request->rate_class)
                ->where('customer_type', $request->customer_type)
                ->first();

            $sketchPath = null;
            $thumbnailPath = null;

            if ($request->hasFile('sketch')) {
                $file = $request->file('sketch')[0];
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $uniqueName = $originalName . '_' . uniqid() . '.' . $extension;

                $sketchPath = $file->storeAs('sketches', $uniqueName, 'public');
                $thumbnailPath = dirname($sketchPath) . '/thumb_' . basename($sketchPath);

                Storage::disk('public')->put(
                    $thumbnailPath,
                    Image::read($file)->scaleDown(width: 800)->encode()
                );
            }

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
                'sketch_lat_long' => $sketchPath,
                'cp_last_name' => $request->cp_lastname,
                'cp_first_name' => $request->cp_firstname,
                'cp_middle_name' => $request->cp_middlename,
                'cp_relation' => $request->relationship,
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

            CustApplnInspection::create([
                'customer_application_id' => $custApp->id,
                'status' => InspectionStatusEnum::FOR_INSPECTION()
            ]);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $type => $file) {
                    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $file->getClientOriginalExtension();
                    $uniqueName = $originalName . '_' . uniqid() . '.' . $extension;

                    $originalPath = $file->storeAs('attachments', $uniqueName, 'public');

                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'])) {
                        $thumbnailPath = dirname($originalPath) . '/thumb_' . basename($originalPath);

                        Storage::disk('public')->put(
                            $thumbnailPath,
                            Image::read($file)->scaleDown(width: 800)->encode()
                        );
                    }

                    CaAttachment::create([
                        'customer_application_id' => $custApp->id,
                        'type' => $type,
                        'path' => $originalPath,
                    ]);
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
    public function show(CustomerApplication $customerApplication): \Inertia\Response
    {
        $customerApplication->load(['barangay.town', 'customerType', 'customerApplicationRequirements.requirement', 'inspections','district']);

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

        $query = CustomerApplication::with(['barangay.town', 'customerType', 'billInfo', 'district']);

        if ($searchValue)
        {
            $query->search($searchValue);
        }

        $applications = $query->paginate(10, ['*'], 'page', $page);

        return response()->json($applications);
    }

    /**
     * Get approval status for a customer application
     */
    public function approvalStatus(CustomerApplication $application): \Illuminate\Http\JsonResponse
    {
        // Load the approval flow data with relationships
        $application->load([
            'approvalState.flow.steps.role',
            'approvalState.flow.steps.user',
            'approvals.approver',
            'approvals.approvalFlowStep'
        ]);

        return response()->json([
            'approval_state' => $application->approvalState,
            'approvals' => $application->approvals,
            'has_approval_flow' => $application->has_approval_flow,
            'is_approval_complete' => $application->is_approval_complete,
            'is_approval_pending' => $application->is_approval_pending,
            'is_approval_rejected' => $application->is_approval_rejected,
        ]);
    }
}


