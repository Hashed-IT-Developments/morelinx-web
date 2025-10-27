<?php

namespace App\Http\Controllers;

use App\Models\ApplicationContract;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Exception;

class ApplicationContractController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_application_id' => 'required|exists:customer_applications,id',
            'deposit_receipt' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:New Connection,Change of Service',
            'entered_date' => 'nullable|date',
            'done_at' => 'nullable|string|max:255',
            'by_personnel' => 'nullable|string|max:255',
            'by_personnel_position' => 'nullable|string|max:255',
            'id_no_1' => 'nullable|string|max:100',
            'issued_by_1' => 'nullable|string|max:255',
            'valid_until_1' => 'nullable|date',
            'building_owner' => 'nullable|string|max:255',
            'id_no_2' => 'nullable|string|max:100',
            'issued_by_2' => 'nullable|string|max:255',
            'valid_until_2' => 'nullable|date',
        ]);

        try {
            $existingContract = ApplicationContract::where('customer_application_id', $validated['customer_application_id'])->first();

            if ($existingContract) {
                return redirect()->back()->with('error', 'Contract already exists for this application.');
            }

            $validated['du_tag'] = config('app.du_tag');

            ApplicationContract::create($validated);

            return redirect()->back()->with('success', 'Contract created successfully!');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to create contract: ' . $e->getMessage());
        }
    }

    /**
     * Display applications that are ready for contract signing.
     */
    public function showContractSigning(Request $request)
    {
        $searchTerm = $request->get('search');
        $perPage = $request->get('per_page', 10);
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $query = CustomerApplication::with(['barangay.town', 'customerType'])
            ->where('status', 'for_signing');

        if ($searchTerm) {
            $query->search($searchTerm);
        }

        if ($sortField && $sortDirection) {
            $query->orderBy($sortField, $sortDirection);
        }

        $applications = $query->paginate($perPage)->withQueryString();

        return inertia('contract-signing/index', [
            'applications' => $applications,
            'search' => $searchTerm,
            'currentSort' => [
                'field' => $sortField !== 'created_at' ? $sortField : null,
                'direction' => $sortField !== 'created_at' ? $sortDirection : null,
            ],
        ]);
    }
}
