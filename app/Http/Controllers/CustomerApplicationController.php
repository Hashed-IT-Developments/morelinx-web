<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\TimelineStageEnum;
use App\Events\MakeLog;
use App\Http\Requests\CompleteWizardRequest;
use App\Models\AgeingTimeline;
use App\Models\ApplicationContract;
use App\Models\CaAttachment;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use App\Models\CaBillInfo;
use App\Models\CustApplnInspection;
use App\Models\CustomerEnergization;
use App\Models\User;
use App\Services\IDAttachmentService;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Exception;
use Illuminate\Support\Facades\Auth;

class CustomerApplicationController extends Controller
{
    protected $idAttachmentService;

    public function __construct(IDAttachmentService $idAttachmentService)
    {
        $this->idAttachmentService = $idAttachmentService;
    }


    public function index(Request $request)
    {
        return inertia('cms/applications/index', [
            'applications' => Inertia::defer(function () use ($request) {
                $search = $request['search'];
                $filters = [
                    'from' => $request->from,
                    'to' => $request->to,
                    'district' => $request->district,
                    'barangay' => $request->barangay,
                    'status' => $request->status,
                ];

                $query = CustomerApplication::with(['barangay.town', 'customerType', 'billInfo'])
                    ->when($filters, function($q) use ($filters) {
                        if (!empty($filters['from'])) {
                            $q->whereDate('created_at', '>=', $filters['from']);
                        }

                        if (!empty($filters['to'])) {
                            $q->whereDate('created_at', '<=', $filters['to']);
                        }

                        if (!empty($filters['district'])) {
                            $q->where('district_id', $filters['district']);
                        }
                        
                        if (!empty($filters['barangay'])) {
                            $q->where('barangay_id',$filters['barangay']);
                        }
                        
                        if (!empty($filters['status']) && $filters['status'] !== 'All') {
                            $q->where('status', $filters['status']);
                        }
                    })
                    ->orderBy('created_at', 'desc');

                if ($search) {
                    $searchTerm = $search;
                    $query->search($searchTerm);
                    if ($query->count() === 0) {
                        return null;
                    }
                }
                return $query->paginate(10);
            }),
            'search' => $request->input('search', null),
            'statuses' => ApplicationStatusEnum::getValues(),
            'filters' => function() use($request){

               $filters = [
                    'from' => $request->from,
                    'to' => $request->to,
                    'district' => $request->district,
                    'barangay' => $request->barangay,
                    'status' => $request->status,
                ];

                return $filters;
            }

        ]);
    }

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


    public function store(CompleteWizardRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $customerType = CustomerType::where('rate_class', $request->rate_class)
                ->where('customer_type', $request->customer_type)
                ->first();


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
                'account_name' => $request->account_name,
                'trade_name' => $request->trade_name,
                'c_peza_registered_activity' => $request->c_peza_registered_activity,
                'cor_number' => $request->cor_number,
                'tin_number' => $request->tin_number,
                'cg_vat_zero_tag' => $request->cg_vat_zero_tag,
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

            if(!$isIsnap) {
                CustApplnInspection::create([
                    'customer_application_id' => $custApp->id,
                    'status' => InspectionStatusEnum::FOR_INSPECTION
                ]);
            }

            AgeingTimeline::create([
                'customer_application_id' => $custApp->id,
                'during_application' => now(),
            ]);

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

                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
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

                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
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


    public function show(CustomerApplication $customerApplication)
    {

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
            'inspections.materialsUsed',
            'inspections.inspector',
            'district',
            'billInfo.barangay',
            'attachments',
            'applicationContract',

            'logs',
            'causeOfDelays'
        ]);

        return inertia('cms/applications/show', [
            'application' => $customerApplication

        ]);
    }

      public function edit(CustomerApplication $customerApplication)
    {

    }


    public function update(Request $request, CustomerApplication $customerApplication)
    {

        $this->clearApplicationSummaryCache($customerApplication);


        return response()->json(['message' => 'Application updated successfully']);
    }


    public function destroy(CustomerApplication $customerApplication)
    {

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


    public function approvalStatus(CustomerApplication $application): \Illuminate\Http\JsonResponse
    {

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


    public function summary(CustomerApplication $application): \Illuminate\Http\JsonResponse
    {

        $cacheKey = "application_summary_{$application->id}_{$application->status}";


        $summaryData = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($application) {

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
                'first_name' => $application->first_name,
                'last_name' => $application->last_name,
                'middle_name' => $application->middle_name,
                'suffix' => $application->suffix,
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
                'sc_from' => $application->sc_from,
                'sc_number' => $application->sc_number,
                'id_type_1' => $application->id_type_1,
                'id_number_1' => $application->id_number_1,
                'id_type_2' => $application->id_type_2,
                'id_number_2' => $application->id_number_2,
                'landmark' => $application->landmark,
                'sitio' => $application->sitio,
                'unit_no' => $application->unit_no,
                'building' => $application->building,
                'street' => $application->street,
                'subdivision' => $application->subdivision,
                'block' => $application->block,
                'route' => $application->route,
                'sketch_lat_long' => $application->sketch_lat_long,
                'cp_last_name' => $application->cp_last_name,
                'cp_first_name' => $application->cp_first_name,
                'cp_middle_name' => $application->cp_middle_name,
                'cp_relation' => $application->cp_relation,
                'date_installed' => $application->date_installed,
                'remarks' => $application->remarks,
                'c_peza_registered_activity' => $application->c_peza_registered_activity,
                'cg_vat_zero_tag' => $application->cg_vat_zero_tag,
                'created_at' => $application->created_at,
                'created_at_formatted' => $application->created_at->format('F j, Y \a\t g:i A'),
                'created_at_human' => $application->created_at->diffForHumans(),
                'updated_at' => $application->updated_at,
                'is_isnap' => $application->is_isnap,
                'customer_type' => $application->customerType ? [
                    'id' => $application->customerType->id,
                    'name' => $application->customerType->name,
                    'rate_class' => ucfirst(str_replace('_', ' ', $application->customerType->rate_class)),
                    'customer_type' => ucfirst(str_replace('_', ' ', $application->customerType->customer_type)),
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
                    $isImage = in_array($extension, ['jpg', 'jpeg', 'png', 'webp']);

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
                'account_name' => $application->account_name,
                'trade_name' => $application->trade_name,
                'cor_number' => $application->cor_number,
                'tin_number' => $application->tin_number,
            ];
        });

        return response()->json($summaryData);
    }


    private function clearApplicationSummaryCache(CustomerApplication $application): void
    {

        $cacheKey = "application_summary_{$application->id}_{$application->status}";
        Cache::forget($cacheKey);


        $commonStatuses = ['pending', 'approved', 'rejected', 'for_inspection', 'for_signing', 'verified', 'cancelled'];
        foreach ($commonStatuses as $status) {
            $statusCacheKey = "application_summary_{$application->id}_{$status}";
            Cache::forget($statusCacheKey);
        }
    }


    public static function clearSummaryCache(CustomerApplication $application): void
    {
        $cacheKey = "application_summary_{$application->id}_{$application->status}";
        Cache::forget($cacheKey);


        $commonStatuses = ['pending', 'approved', 'rejected', 'for_inspection', 'for_signing', 'verified', 'cancelled'];
        foreach ($commonStatuses as $status) {
            $statusCacheKey = "application_summary_{$application->id}_{$status}";
            Cache::forget($statusCacheKey);
        }
    }


    public function getInstallationByStatus(Request $request, $status = 'pending'): \Inertia\Response
    {
       return inertia('cms/applications/installations/index', [
            'applications' => Inertia::defer(function () use ($request, $status) {
                $search = $request['search'];



                $query = CustomerApplication::
              with(['barangay.town', 'customerType', 'billInfo', 'energization.teamAssigned', 'energization.teamExecuted'])
              ->orderBy('created_at', 'desc');

                if ($status === 'for_installation_approval') {
                $query->where('status', ApplicationStatusEnum::FOR_INSTALLATION_APPROVAL);
                }else if($status === 'for_installation'){


                        $query->whereHas('energization', function ($q) {
                            $q->where('status', 'assigned');
                        });



                }
                else if($status === 'completed'){


                        $query->where('status', ApplicationStatusEnum::FOR_INSTALLATION)
                        ->whereHas('energization', function ($q) {
                            $q->where('status', 'completed');
                        });



                }
                else{
                $query->whereHas('energization', function ($q) use ($status) {
                    $q->where('status', $status);
                });
                }



                if ($search) {
                    $query->search($search);

                    if ($query->count() === 0) {
                        return null;
                    }
                }
                return $query->paginate(10);
            }),
            'search' => $request->input('search', null),
            'status' => $status,
        ]);
    }

    public function getStatuses()
    {
        $statuses = ApplicationStatusEnum::getValues();

        return response()->json($statuses);
    }

    public function statusUpdate(Request $request)
    {
        $applicationId = $request->input('application_id');
        $newStatus = $request->input('status');

        $application = CustomerApplication::find($applicationId);

        if(!$application) {
           return back()->withErrors(['Application not found.']);
        }

        $oldStatus = $application->status;
        $application->status = $newStatus;
        $application->save();

        // Update timeline for skipped statuses when overriding
        $this->updateTimelineForStatusOverride($application, $oldStatus, $newStatus);

        event(new MakeLog(
            'application',
            $applicationId,
            'Changed application status to ' . $newStatus,
            Auth::user()->name . ' updated the application status to ' . $newStatus . '.',
            Auth::user()->id,
        ));

       return back()->with('success', 'Application status updated successfully.');
    }

    public function assignLineman(Request $request)
    {
        $applicationId = $request->input('application_id');
        $assignUserId = $request->input('assign_user_id');
        $remarks = $request->input('remarks');

        $application = CustomerApplication::find($applicationId);

        $customerEnergization = CustomerEnergization::where('customer_application_id', $applicationId)->first();


        $lineman = User::find($assignUserId);

        if(!$lineman || !$lineman->hasRole('lineman')) {
            return back()->withErrors(['The selected user is not a valid lineman.']);
        }

        if ($customerEnergization) {

            $customerEnergization->team_assigned_id = $assignUserId;
            $customerEnergization->remarks = $remarks;
            $customerEnergization->save();
        } else {

            $customerEnergization = CustomerEnergization::create([
            'customer_application_id' => $applicationId,
            'team_assigned_id' => $assignUserId,
            'remarks' => $remarks,
            ]);
        }

        if($customerEnergization) {
            $application->status = ApplicationStatusEnum::FOR_INSTALLATION;
            $application->save();


            $customerEnergization->status = 'assigned';
            $customerEnergization->save();

            event(new MakeLog(
                'application',
                $applicationId,
                'Assigned lineman ( '
                . $lineman->name . ') to application',
                Auth::user()->name . ' assigned lineman ('
                . $lineman->name . ') to application.',
                Auth::user()->id,
            ));

            $application->ageingTimeline()->updateOrCreate(
                ['customer_application_id' => $application->id],
                ['assigned_to_lineman' => now()]
            );

        }


        if (!$application) {
            return back()->withErrors(['Application not found.']);
        }

        return back()->with('success', 'Lineman assigned successfully.');

    }

    public function declineInstallation(Request $request){
        $energizationId = $request->input('energization_id');
        $remarks = $request->input('remarks');

        $customerEnergization = CustomerEnergization::find($energizationId);

        if(!$customerEnergization) {
            return back()->withErrors(['Energization record not found.']);
        }

        $application = CustomerApplication::find($customerEnergization->customer_application_id);


        if(!$application) {
            return back()->withErrors(['Associated application not found.']);
        }

        $customerEnergization->status = 'declined';
        $customerEnergization->remarks = $remarks;
        $customerEnergization->save();

        $application->status = ApplicationStatusEnum::FOR_INSTALLATION_APPROVAL;
        $application->remarks = $remarks;
        $application->save();

         event(new MakeLog(
            'application',
            $application->id,
            'Declined installation for application',
            Auth::user()->name . ' declined installation for application.',
            Auth::user()->id,
        ));

        return back()->with('success', 'Installation declined successfully.');
    }

    public function approveInstallation(Request $request)
    {

      $applicationId = $request->input('application_id');

        if (!$applicationId) {
            return back()->withErrors(['Application record not found.']);
        }

        $application = CustomerApplication::find($applicationId);
        if (!$application) {
            return back()->withErrors(['Associated application not found.']);
        }


        $application->status = ApplicationStatusEnum::COMPLETED;
        $application->save();

        if($application){
            event(new MakeLog(
                'application',
                $application->id,
                'Approved installation for application',
                Auth::user()->name . ' approved installation for application.',
                Auth::user()->id,
            ));
        }

        return back()->with('success', 'Installation approved successfully.');

    }

    public function storeCauseOfDelay(Request $request, CustomerApplication $application)
    {
        $validated = $request->validate([
            'delay_source' => 'required|string',
            'process' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        $causeOfDelay = $application->causeOfDelays()->create([
            'delay_source' => $validated['delay_source'],
            'process' => $validated['process'],
            'remarks' => $validated['remarks'] ?? null,
            'user_id' => Auth::id(),
        ]);

        // Reload the relationship to include the user
        $causeOfDelay->load('user');

        // Update ageing timeline based on process
        $this->updateAgeingTimelineForDelay($application, $validated['process']);

        return back()->with('success', 'Cause of delay added successfully.');
    }

    /**
     * Update ageing timeline based on the delayed process
     * Only sets the timeline date if it doesn't already exist to preserve original dates
     */
    private function updateAgeingTimelineForDelay(CustomerApplication $application, string $process): void
    {
        $timelineField = match($process) {
            'application' => TimelineStageEnum::DURING_APPLICATION->value,
            'inspection' => TimelineStageEnum::INSPECTION_DATE->value,
            'payment' => TimelineStageEnum::PAID_TO_CASHIER->value,
            'installation' => TimelineStageEnum::ASSIGNED_TO_LINEMAN->value,
            'activation' => TimelineStageEnum::ACTIVATED->value,
            default => null,
        };

        if (!$timelineField) {
            return;
        }

        $timeline = $application->ageingTimeline;

        if (!$timeline) {
            // Create new timeline with the current timestamp for this field
            $application->ageingTimeline()->create([
                'customer_application_id' => $application->id,
                $timelineField => now(),
            ]);
        } elseif ($timeline->{$timelineField} === null) {
            $timeline->update([
                $timelineField => now(),
            ]);
        }
    }

    /**
     * Update timeline when status is overridden to fill in skipped stages
     */
    private function updateTimelineForStatusOverride(CustomerApplication $application, string $oldStatus, string $newStatus): void
    {
        // Define status to timeline field mapping
        $statusToTimeline = [
            ApplicationStatusEnum::PENDING => TimelineStageEnum::DURING_APPLICATION->value,
            ApplicationStatusEnum::IN_PROCESS => TimelineStageEnum::DURING_APPLICATION->value,
            ApplicationStatusEnum::FOR_CCD_APPROVAL => TimelineStageEnum::DURING_APPLICATION->value,
            ApplicationStatusEnum::FOR_VERIFICATION => TimelineStageEnum::DURING_APPLICATION->value,
            ApplicationStatusEnum::FOR_INSPECTION => TimelineStageEnum::FORWARDED_TO_INSPECTOR->value,
            ApplicationStatusEnum::FOR_VERIFICATION => TimelineStageEnum::INSPECTION_DATE->value,
            ApplicationStatusEnum::COMPLETED => TimelineStageEnum::INSPECTION_UPLOADED_TO_SYSTEM->value,
            ApplicationStatusEnum::FOR_COLLECTION => TimelineStageEnum::INSPECTION_UPLOADED_TO_SYSTEM->value,
            ApplicationStatusEnum::ISNAP_FOR_COLLECTION => TimelineStageEnum::INSPECTION_UPLOADED_TO_SYSTEM->value,
            ApplicationStatusEnum::FOR_SIGNING => TimelineStageEnum::PAID_TO_CASHIER->value,
            ApplicationStatusEnum::FOR_INSTALLATION_APPROVAL => TimelineStageEnum::CONTRACT_SIGNED->value,
            ApplicationStatusEnum::FOR_INSTALLATION => TimelineStageEnum::ASSIGNED_TO_LINEMAN->value,
        ];

        // Get the timeline fields that should be filled for the new status
        $newStatusTimeline = $statusToTimeline[$newStatus] ?? null;
        $oldStatusTimeline = $statusToTimeline[$oldStatus] ?? null;

        if (!$newStatusTimeline) {
            return;
        }

        // Get or create timeline
        $timeline = $application->ageingTimeline;
        if (!$timeline) {
            $timeline = $application->ageingTimeline()->create([
                'customer_application_id' => $application->id,
                TimelineStageEnum::DURING_APPLICATION->value => now(),
            ]);
        }

        // Get all timeline stages in order
        $timelineStages = [
            TimelineStageEnum::DURING_APPLICATION->value,
            TimelineStageEnum::FORWARDED_TO_INSPECTOR->value,
            TimelineStageEnum::INSPECTION_DATE->value,
            TimelineStageEnum::INSPECTION_UPLOADED_TO_SYSTEM->value,
            TimelineStageEnum::PAID_TO_CASHIER->value,
            TimelineStageEnum::CONTRACT_SIGNED->value,
            TimelineStageEnum::ASSIGNED_TO_LINEMAN->value,
            TimelineStageEnum::DOWNLOADED_TO_LINEMAN->value,
            TimelineStageEnum::INSTALLED_DATE->value,
            TimelineStageEnum::ACTIVATED->value,
        ];

        // Find the index of the new status timeline stage
        $targetStageIndex = array_search($newStatusTimeline, $timelineStages);

        if ($targetStageIndex === false) {
            return;
        }

        // Only update if we're moving forward (skip if going backwards)
        $oldStatusIndex = $oldStatusTimeline ? array_search($oldStatusTimeline, $timelineStages) : -1;

        if ($oldStatusIndex !== false && $targetStageIndex <= $oldStatusIndex) {
            return; // Don't fill backwards or same level
        }

        // Fill in all timeline stages up to and including the target stage
        $updateData = [];
        $currentTime = now();

        for ($i = 0; $i <= $targetStageIndex; $i++) {
            $stage = $timelineStages[$i];

            // Only update if the field is currently null (don't override existing dates)
            if ($timeline->{$stage} === null) {
                $updateData[$stage] = $currentTime;
                // Increment by a few seconds for each stage to maintain order
                $currentTime = $currentTime->addSeconds(5);
            }
        }

        // Update the timeline with the new data
        if (!empty($updateData)) {
            $timeline->update($updateData);
        }
    }

    /**
     * Get inspection details for an application
     */
    public function getInspectionDetails(CustomerApplication $application)
    {
        $inspection = $application->getLatestInspection();
        
        if (!$inspection) {
            return response()->json(null, 404);
        }

        // Load the inspector relationship
        $inspection->load('inspector');

        return response()->json([
            'id' => $inspection->id,
            'inspection_id' => $inspection->inspection_id ?? "INS-{$inspection->id}",
            'customer_application_id' => $inspection->customer_application_id,
            'inspector_id' => $inspection->inspector_id,
            'status' => $inspection->status,
            'schedule_date' => $inspection->schedule_date,
            'actual_date' => $inspection->actual_date,
            'remarks' => $inspection->remarks,
            'created_at' => $inspection->created_at,
            'updated_at' => $inspection->updated_at,
            'inspector' => $inspection->inspector ? [
                'id' => $inspection->inspector->id,
                'name' => $inspection->inspector->name,
                'email' => $inspection->inspector->email,
            ] : null,
            'inspection_results' => [] // Add inspection results if you have them
        ]);
    }

    /**
     * Get energization details for an application
     */
    public function getEnergizationDetails(CustomerApplication $application)
    {
        $energization = $application->energization()->with(['teamAssigned'])->first();
        
        if (!$energization) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $energization->id,
            'customer_application_id' => $energization->customer_application_id,
            'team_assigned_id' => $energization->team_assigned_id,
            'status' => $energization->status,
            'remarks' => $energization->remarks,
            'date_completed' => $energization->date_installed ?? null, // Using date_installed as date_completed
            'created_at' => $energization->created_at,
            'updated_at' => $energization->updated_at,
            'assigned_team' => $energization->teamAssigned ? [
                'id' => $energization->teamAssigned->id,
                'name' => $energization->teamAssigned->name,
                'email' => $energization->teamAssigned->email,
            ] : null,
            'energization_results' => [] // Add energization results if you have them
        ]);
    }
}
