<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatusEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Models\CaAttachment;
use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use App\Models\Payable;
use Illuminate\Console\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class IsnapController extends Controller
{
    /**
     * Display a listing of ISNAP members.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $query = CustomerApplication::with([
            'attachments' => function ($q) {
                $q->where('type', 'isnap');
            },
            'approvalState.flow.steps',
            'approvals',
            'payables' => function ($q) {
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

        // Handle sorting
        $this->applySorting($query, $sortField, $sortDirection);

        $isnapMembers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('isnap/index', [
            'isnapMembers' => $isnapMembers,
            'search' => $search,
            'currentSort' => [
                'field' => $sortField !== 'created_at' ? $sortField : null,
                'direction' => $sortField !== 'created_at' ? $sortDirection : null,
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
    public function approve(CustomerApplication $customerApplication)
    {
        return DB::transaction(function () use ($customerApplication) {
            // Validate that this is actually an ISNAP application
            if (!$customerApplication->is_isnap) {
                return redirect()->back()->with('error', 'This application is not registered as an ISNAP application.');
            }

            // Check current status - only allow approval for isnap_pending status
            if ($customerApplication->status !== 'isnap_pending') {
                return redirect()->back()->with('error', 'This application is not pending ISNAP approval. Current status: ' . $customerApplication->status);
            }

            // Check if already has a payable
            $existingPayable = Payable::where('customer_application_id', $customerApplication->id)
                ->where('type', PayableTypeEnum::ISNAP_FEE)
                ->first();

            if ($existingPayable) {
                return redirect()->back()->with('error', 'ISNAP payable already exists for this application.');
            }

            // Calculate ISNAP amount (you can adjust this or make it configurable)
            $isnapAmount = $this->calculateIsnapAmount($customerApplication);

            // Create payable
            Payable::create([
                'customer_application_id' => $customerApplication->id,
                'customer_payable' => $customerApplication->account_number,
                'type' => PayableTypeEnum::ISNAP_FEE,
                'bill_month' => now()->format('Y-m'),
                'total_amount_due' => $isnapAmount,
                'status' => PayableStatusEnum::UNPAID,
                'amount_paid' => 0,
                'balance' => $isnapAmount,
            ]);

            $customerApplication->update(['status' => ApplicationStatusEnum::ISNAP_FOR_COLLECTION]);

            return redirect()->back()->with('success', 'ISNAP application approved and payable of ₱' . number_format($isnapAmount, 2) . ' created successfully.');
        });
    }

    /**
     * Calculate ISNAP amount based on application details.
     * You can customize this logic based on your business rules.
     */
    private function calculateIsnapAmount($application)
    {
        // Default ISNAP fee - you can make this configurable in config/data.php
        $baseFee = 500.00;

        // You can add logic here to adjust the fee based on:
        // - Customer type
        // - Connected load
        // - Other factors
        
        return $baseFee;
    }
}
