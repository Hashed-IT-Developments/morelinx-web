<?php

namespace App\Http\Controllers\CRM;

use App\Enums\ApplicationStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Events\MakeLog;
use App\Models\CaAttachment;
use App\Models\CustomerApplication;
use App\Models\Payable;
use App\Models\Setting;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class IsnapController extends Controller
{
 
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $selectedStatus = $request->input('status', 'all');
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

      
        $statusCounts = [
            'all' => CustomerApplication::where('is_isnap', true)->count(),
            'isnap_pending' => CustomerApplication::where('is_isnap', true)->where('status', ApplicationStatusEnum::ISNAP_PENDING)->count(),
            'isnap_for_collection' => CustomerApplication::where('is_isnap', true)->where('status', ApplicationStatusEnum::ISNAP_FOR_COLLECTION)->count(),
        ];

        $query = CustomerApplication::with([
            'attachments' => function ($q) {
                $q->where('type', 'isnap');
            },
            'approvalState.flow.steps',
            'approvals',
            'account.payables' => function ($q) {
                $q->where('type', PayableTypeEnum::ISNAP_FEE);
            },
            'barangay.town',
            'customerType',
            'district'
        ])
        ->where('is_isnap', true);

        if ($search) {
            $query->search($search);
        }

       
        if ($selectedStatus && $selectedStatus !== 'all') {
            $query->where('status', $selectedStatus);
        }

      
        $this->applySorting($query, $sortField, $sortDirection);

        $isnapMembers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('crm/monitoring/isnap/index', [
            'isnapMembers' => $isnapMembers,
            'search' => $search,
            'selectedStatus' => $selectedStatus,
            'statusCounts' => $statusCounts,
            'defaultIsnapFee' => setting('isnap_fee', 850.00),
            'currentSort' => [
                'field' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Apply sorting to the query based on the field.
     */
    private function applySorting($query, $sortField, $sortDirection)
    {
        switch ($sortField) {
            case 'account_number':
            case 'status':
            case 'created_at':
                $query->orderBy($sortField, $sortDirection);
                break;
            default:
                $query->orderBy('created_at', $sortDirection);
                break;
        }
    }

    /**
     * Show the form for uploading documents for a specific ISNAP member.
     */
    public function uploadDocuments(CustomerApplication $customerApplication)
    {
        $customerApplication->load(['customerType', 'barangay.town']);
        
        return response()->json([
            'customer_application' => $customerApplication
        ]);
    }

    /**
     * Store uploaded documents for an ISNAP member.
     */
    public function storeDocuments(Request $request, CustomerApplication $customerApplication)
    {
        $request->validate([
            'documents' => 'required|array|min:1',
            'documents.*' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
        ]);

        $uploadedFiles = [];

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = strtolower($file->getClientOriginalExtension());
                $uniqueName = $originalName . '_' . uniqid() . '.' . $extension;

                $originalPath = $file->storeAs('isnap_documents', $uniqueName, 'public');

                // Create thumbnail for images
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'])) {
                    try {
                        $thumbnailPath = dirname($originalPath) . '/thumb_' . basename($originalPath);

                        Storage::disk('public')->put(
                            $thumbnailPath,
                            \Intervention\Image\Laravel\Facades\Image::read($file)->scaleDown(width: 800)->encode()
                        );
                    } catch (\Exception $e) {
                        // Log error but don't fail the upload
                        Log::warning('Failed to create thumbnail for ISNAP document', [
                            'file' => $uniqueName,
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                CaAttachment::create([
                    'customer_application_id' => $customerApplication->id,
                    'type' => 'isnap',
                    'path' => $originalPath,
                ]);

                $uploadedFiles[] = $uniqueName;
            }
        }

        $fileCount = count($uploadedFiles);
        $message = $fileCount === 1 
            ? '1 document uploaded successfully' 
            : "{$fileCount} documents uploaded successfully";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Approve an ISNAP member.
     */
    public function approve(Request $request, CustomerApplication $customerApplication)
    {
        // Validate the request
        $validated = $request->validate([
            'isnap_fee' => 'required|numeric|min:0',
            'set_as_default' => 'nullable|boolean',
        ]);

        return DB::transaction(function () use ($customerApplication, $validated) {
            // Validate that this is actually an ISNAP application
            if (!$customerApplication->is_isnap) {
                return redirect()->back()->with('error', 'This application is not registered as an ISNAP application.');
            }

            // Check current status - only allow approval for isnap_pending status
            if ($customerApplication->status !== 'isnap_pending') {
                return redirect()->back()->with('error', 'This application is not pending ISNAP approval. Current status: ' . $customerApplication->status);
            }

            // Get the customer account for this application
            $customerAccount = $customerApplication->account;
            
            if (!$customerAccount) {
                return redirect()->back()->with('error', 'Customer account not found for this application.');
            }

            // Check if already has a payable
            $existingPayable = Payable::where('customer_account_id', $customerAccount->id)
                ->where('type', PayableTypeEnum::ISNAP_FEE)
                ->first();

            if ($existingPayable) {
                return redirect()->back()->with('error', 'ISNAP payable already exists for this application.');
            }

            // Update the ISNAP fee setting if set_as_default is true
            if ($validated['set_as_default'] ?? false) {
                $this->updateIsnapFeeDefault($validated['isnap_fee']);
            }

            $isnapFee = $validated['isnap_fee'];

            // Create payable using helper function
            payable()
                ->billTo($customerAccount->id)
                ->isnapFee()
                ->customPayable('ISNAP Fee - ' . $customerApplication->account_number)
                ->totalAmountDue($isnapFee)
                ->isnapCategory()
                ->save();

            $customerApplication->update(['status' => ApplicationStatusEnum::ISNAP_FOR_COLLECTION]);

            event(new MakeLog(
                'application',
                $customerApplication->id,
                'ISNAP Approved',
                'ISNAP application has been approved. Payable of ₱' . number_format($isnapFee, 2) . ' created.',
                Auth::id()
            ));

            return redirect()->back()->with('success', 'ISNAP application approved and payable of ₱' . number_format($validated['isnap_fee'], 2) . ' created successfully.');
        });
    }

   
    private function updateIsnapFeeDefault($submittedFee)
    {
        Setting::updateOrCreate(
            [
                'key' => 'isnap_fee',
            ],
            [
                'value' => $submittedFee,
                'type' => 'float',
                'description' => 'Default ISNAP fee amount charged to approved ISNAP members',
            ]
        );

        return $submittedFee;
    }
}
