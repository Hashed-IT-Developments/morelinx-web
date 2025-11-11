<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Http\Requests\CompleteWizardRequest;
use App\Models\ApplicationContract;
use App\Models\CaAttachment;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use App\Models\CaBillInfo;
use App\Models\CustApplnInspection;
use App\Models\CustomerAccount;
use App\Services\IDAttachmentService;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Exception;

class CustomerApplicationController extends Controller
{
    protected $idAttachmentService;

    public function __construct(IDAttachmentService $idAttachmentService)
    {
        $this->idAttachmentService = $idAttachmentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): \Inertia\Response
    {
        return inertia('cms/applications/index', [
            'applications' => Inertia::defer(function () use ($request) {
                $search = $request['search'];

                $query = CustomerApplication::with(['barangay.town', 'customerType', 'billInfo']);

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
            'primaryIdTypes' => config('data.primary_ids'),
            'secondaryIdTypes' => config('data.secondary_ids'),
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

            // Properly handle is_isnap as boolean (handles string "false" or "0" correctly)
            $isIsnap = filter_var($request->is_isnap, FILTER_VALIDATE_BOOLEAN);
            $status = $isIsnap ? ApplicationStatusEnum::ISNAP_PENDING : ApplicationStatusEnum::IN_PROCESS;

            $custApp = CustomerApplication::create([
                'status' => $status,
                'customer_type_id' => $customerType->id,
                'connected_load' => $request->connected_load,
                'property_ownership' => $request->property_ownership,
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'suffix' => $request->suffix,
                'birth_date' => date('Y-m-d', strtotime($request->birthdate)),
                'nationality' => $request->nationality,
                'gender' => $request->sex,
                'marital_status' => $request->marital_status,
                'email_address' => $request->cp_email,
                'tel_no_1' => $request->cp_tel_no,
                'tel_no_2' => $request->cp_tel_no_2,
                'mobile_1' => $request->cp_mobile_no,
                'mobile_2' => $request->cp_mobile_no_2,
                'landmark' => $request->landmark,
                'unit_no' => $request->unit_no,
                'building' => $request->building,
                'street' => $request->street,
                'subdivision' => $request->subdivision,
                'barangay_id' => $request->barangay,
                'id_type_1' => $request->id_category === 'primary' ? $request->primary_id_type : ($request->id_category === 'secondary' ? $request->secondary_id_1_type : null),
                'id_type_2' => $request->id_category === 'secondary' ? $request->secondary_id_2_type : null,
                'id_number_1' => $request->id_category === 'primary' ? $request->primary_id_number : ($request->id_category === 'secondary' ? $request->secondary_id_1_number : null),
                'id_number_2' => $request->id_category === 'secondary' ? $request->secondary_id_2_number : null,
                'is_sc' => $request->is_senior_citizen,
                'sc_from' => $request->sc_from,
                'sc_number' => $request->sc_number,
                'is_isnap' => $isIsnap,
                'sketch_lat_long' => $request->sketch_lat_long,
                'cp_last_name' => $request->cp_lastname,
                'cp_first_name' => $request->cp_firstname,
                'cp_middle_name' => $request->cp_middlename,
                'cp_relation' => $request->relationship,
                //additional fields for commercial/government
                'account_name' => $request->account_name,
                'trade_name' => $request->trade_name,
                'c_peza_registered_activity' => $request->c_peza_registered_activity,
                'cor_number' => $request->cor_number,
                'tin_number' => $request->tin_number,
                'cg_vat_zero_tag' => $request->cg_vat_zero_tag,
            ]);

            // Note: CustomerAccount is automatically created via CustomerApplicationObserver

            CaBillInfo::create([
                'customer_application_id' => $custApp->id,
                'barangay_id' => $request->barangay,
                'subdivision' => $request->bill_subdivision,
                'unit_no' => $request->bill_house_no,
                'street' => $request->bill_street,
                'building' => $request->bill_building_floor,
                'delivery_mode' => $request->bill_delivery
            ]);

            if(!$isIsnap) {
                CustApplnInspection::create([
                    'customer_application_id' => $custApp->id,
                    'status' => InspectionStatusEnum::FOR_INSPECTION
                ]);
            }


            // Handle ID file uploads using the service
            try {
                if ($request->id_category === 'primary' && $request->hasFile('primary_id_file')) {
                    $this->idAttachmentService->storeIDAttachment(
                        $request->file('primary_id_file'),
                        $custApp,
                        $request->primary_id_type
                    );

                    Log::info('Primary ID uploaded for customer application', [
                        'customer_application_id' => $custApp->id,
                        'id_type' => $request->primary_id_type
                    ]);

                } elseif ($request->id_category === 'secondary') {
                    // Handle Secondary ID 1
                    if ($request->hasFile('secondary_id_1_file')) {
                        $this->idAttachmentService->storeIDAttachment(
                            $request->file('secondary_id_1_file'),
                            $custApp,
                            $request->secondary_id_1_type
                        );

                        Log::info('Secondary ID 1 uploaded for customer application', [
                            'customer_application_id' => $custApp->id,
                            'id_type' => $request->secondary_id_1_type
                        ]);
                    }

                    // Handle Secondary ID 2
                    if ($request->hasFile('secondary_id_2_file')) {
                        $this->idAttachmentService->storeIDAttachment(
                            $request->file('secondary_id_2_file'),
                            $custApp,
                            $request->secondary_id_2_type
                        );

                        Log::info('Secondary ID 2 uploaded for customer application', [
                            'customer_application_id' => $custApp->id,
                            'id_type' => $request->secondary_id_2_type
                        ]);
                    }
                }
            } catch (Exception $e) {
                // Rollback will be handled by outer transaction
                Log::error('Failed to upload ID attachments', [
                    'customer_application_id' => $custApp->id,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $type => $file) {
                    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $file->getClientOriginalExtension();
                    $uniqueName = $originalName . '_' . uniqid() . '.' . $extension;

                    $originalPath = $file->storeAs('attachments', $uniqueName, 'public'); //temporary storage - php artisan storage:link

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

            if ($request->hasFile('cg_ewt_tag')) {
                $file = $request->file('cg_ewt_tag');

                if ($file->isValid()) {
                    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $extension = $file->getClientOriginalExtension();
                    $uniqueName = $originalName . '_' . uniqid() . '.' . $extension;

                    $path = $file->storeAs('attachments', $uniqueName, 'public');

                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'])) {
                        $thumbnailPath = dirname($path) . '/thumb_' . basename($path);

                        Storage::disk('public')->put(
                            $thumbnailPath,
                            Image::read($file)->scaleDown(width: 800)->encode()
                        );
                    }

                    CaAttachment::create([
                        'customer_application_id' => $custApp->id,
                        'type' => 'cg_ewt',
                        'path' => $path,
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
        // Create contract if it doesn't exist (only with customer_application_id)
        if (!$customerApplication->applicationContract) {
            ApplicationContract::create([
                'customer_application_id' => $customerApplication->id,
                'du_tag' => config('app.du_tag'),
            ]);
        }

        $customerApplication->load([
            'barangay.town',
            'customerType',
            'customerApplicationRequirements.requirement',
            'inspections',
            'district',
            'billInfo.barangay',
            'attachments',
            'applicationContract'
        ]);

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
        // Clear cache before updating
        $this->clearApplicationSummaryCache($customerApplication);

        // TODO: Add update logic here

        return response()->json(['message' => 'Application updated successfully']);
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

        if ($searchValue) {
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

    /**
     * Get summary details for a customer application
     *
     * This method implements caching to improve performance for expensive queries.
     * Cache key includes application ID and status to ensure data consistency.
     * Cache duration: 5 minutes
     */
    public function summary(CustomerApplication $application): \Illuminate\Http\JsonResponse
    {
        // Create cache key based on application ID and status
        // This ensures cache is invalidated when status changes
        $cacheKey = "application_summary_{$application->id}_{$application->status}";

        // Cache the expensive query for 5 minutes
        $summaryData = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($application) {
            // Load all necessary relationships
            $application->load([
                'barangay.town',
                'customerType',
                'billInfo.barangay.town',
                'district',
                'attachments',
                'inspections'
            ]);

            return [
                'id' => $application->id,
                'account_number' => $application->account_number,
                'full_name' => $application->full_name,
                'identity' => $application->identity,
                'email_address' => $application->email_address,
                'mobile_1' => $application->mobile_1,
                'mobile_2' => $application->mobile_2,
                'tel_no_1' => $application->tel_no_1,
                'tel_no_2' => $application->tel_no_2,
                'full_address' => $application->full_address,
                'status' => $application->status,
                'connected_load' => $application->connected_load,
                'property_ownership' => $application->property_ownership,
                'birth_date' => $application->birth_date,
                'nationality' => $application->nationality,
                'gender' => $application->gender,
                'marital_status' => $application->marital_status,
                'is_sc' => $application->is_sc,
                'sc_number' => $application->sc_number,
                'id_type_1' => $application->id_type_1,
                'id_number_1' => $application->id_number_1,
                'id_type_2' => $application->id_type_2,
                'id_number_2' => $application->id_number_2,
                'created_at' => $application->created_at,
                'created_at_formatted' => $application->created_at->format('F j, Y \a\t g:i A'),
                'created_at_human' => $application->created_at->diffForHumans(),
                'updated_at' => $application->updated_at,
                'is_isnap' => $application->is_isnap,

                // Relationships
                'customer_type' => $application->customerType ? [
                    'id' => $application->customerType->id,
                    'name' => $application->customerType->name,
                    'rate_class' => $application->customerType->rate_class,
                    'customer_type' => $application->customerType->customer_type,
                ] : null,

                'barangay' => $application->barangay ? [
                    'id' => $application->barangay->id,
                    'name' => $application->barangay->name,
                    'town' => $application->barangay->town ? [
                        'id' => $application->barangay->town->id,
                        'name' => $application->barangay->town->name,
                    ] : null,
                ] : null,

                'bill_info' => $application->billInfo ? [
                    'subdivision' => $application->billInfo->subdivision,
                    'unit_no' => $application->billInfo->unit_no,
                    'street' => $application->billInfo->street,
                    'building' => $application->billInfo->building,
                    'delivery_mode' => $application->billInfo->delivery_mode,
                    'barangay' => $application->billInfo->barangay ? [
                        'id' => $application->billInfo->barangay->id,
                        'name' => $application->billInfo->barangay->name,
                        'town' => $application->billInfo->barangay->town ? [
                            'id' => $application->billInfo->barangay->town->id,
                            'name' => $application->billInfo->barangay->town->name,
                        ] : null,
                    ] : null,
                ] : null,

                'district' => $application->district ? [
                    'id' => $application->district->id,
                    'name' => $application->district->name,
                ] : null,

                'attachments_count' => $application->attachments->count(),
                'attachments' => $application->attachments->map(function ($attachment) {
                    $fullPath = storage_path('app/public/' . $attachment->path);
                    $extension = strtolower(pathinfo($attachment->path, PATHINFO_EXTENSION));
                    $isImage = in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);

                    return [
                        'id' => $attachment->id,
                        'type' => $attachment->type,
                        'path' => $attachment->path,
                        'url' => asset('storage/' . $attachment->path),
                        'filename' => basename($attachment->path),
                        'extension' => $extension,
                        'is_image' => $isImage,
                        'mime_type' => $isImage ? 'image/' . ($extension === 'jpg' ? 'jpeg' : $extension) : 'application/' . $extension,
                        'size' => file_exists($fullPath) ? filesize($fullPath) : null,
                        'created_at' => $attachment->created_at,
                    ];
                }),
                'inspections_count' => $application->inspections->count(),

                // Commercial/Government specific fields
                'account_name' => $application->account_name,
                'trade_name' => $application->trade_name,
                'cor_number' => $application->cor_number,
                'tin_number' => $application->tin_number,
            ];
        });

        return response()->json($summaryData);
    }

    /**
     * Clear the cached summary data for an application
     *
     * This method should be called whenever:
     * - Application data is updated
     * - Application status changes
     * - Related data (attachments, inspections, etc.) is modified
     */
    private function clearApplicationSummaryCache(CustomerApplication $application): void
    {
        // Clear cache for the current status
        $cacheKey = "application_summary_{$application->id}_{$application->status}";
        Cache::forget($cacheKey);

        // Also clear cache for other common statuses in case status was just changed
        $commonStatuses = ['pending', 'approved', 'rejected', 'for_inspection', 'for_signing', 'verified', 'cancelled'];
        foreach ($commonStatuses as $status) {
            $statusCacheKey = "application_summary_{$application->id}_{$status}";
            Cache::forget($statusCacheKey);
        }
    }

    /**
     * Public method to clear application summary cache (can be called from other controllers)
     */
    public static function clearSummaryCache(CustomerApplication $application): void
    {
        $cacheKey = "application_summary_{$application->id}_{$application->status}";
        Cache::forget($cacheKey);

        // Also clear cache for other common statuses
        $commonStatuses = ['pending', 'approved', 'rejected', 'for_inspection', 'for_signing', 'verified', 'cancelled'];
        foreach ($commonStatuses as $status) {
            $statusCacheKey = "application_summary_{$application->id}_{$status}";
            Cache::forget($statusCacheKey);
        }
    }


    public function forInstallation(Request $request): \Inertia\Response
    {
       return inertia('cms/applications/for-installation/index', [
            'applications' => Inertia::defer(function () use ($request) {
                $search = $request['search'];

                $query = CustomerApplication::
                where('status', ApplicationStatusEnum::FOR_INSTALLATION_APPROVAL)
                ->with(['barangay.town', 'customerType', 'billInfo']);

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

    public function statusUpdate(Request $request)
    {
        $applicationId = $request->input('application_id');
        $newStatus = $request->input('status');

        $application = CustomerApplication::find($applicationId);
        $application->status = $newStatus;
        $application->save();

       
       if(!$application) {
           return back()->withErrors(['Application not found.']);
       }

       return back()->with('success', 'Application status updated successfully.');
    }
}
