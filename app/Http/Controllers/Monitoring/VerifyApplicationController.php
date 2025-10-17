<?php

namespace App\Http\Controllers\Monitoring;

use App\Enums\ApplicationStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;

class VerifyApplicationController extends Controller
{
    public function index(Request $request)
    {
        $searchTerm = $request->get('search');
        $perPage = $request->get('per_page', 10);
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // Start building the query
        $query = CustomerApplication::with(['barangay.town', 'customerType'])
            ->where('status', ApplicationStatusEnum::VERIFIED);

        // Apply search filter
        if ($searchTerm) {
            $query->search($searchTerm);
        }

        // Apply sorting
        if ($sortField && $sortDirection) {
            $this->applySorting($query, $sortField, $sortDirection);
        }

        $applications = $query->paginate($perPage)->withQueryString();

        // Get status counts
        $forCollectionCount = CustomerApplication::where('status', ApplicationStatusEnum::FOR_COLLECTION)->count();
        $cancelledCount = CustomerApplication::where('status', ApplicationStatusEnum::CANCELLED)->count();

        return inertia('monitoring/verify-applications/index', [
            'applications' => $applications,
            'search' => $searchTerm,
            'forCollectionCount' => $forCollectionCount,
            'cancelledCount' => $cancelledCount,
            'currentSort' => [
                'field' => $sortField !== 'created_at' ? $sortField : null,
                'direction' => $sortField !== 'created_at' ? $sortDirection : null,
            ],
        ]);
    }

    public function cancelled(Request $request)
    {
        $searchTerm = $request->get('search');
        $perPage = $request->get('per_page', 10);
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $query = CustomerApplication::with(['barangay.town', 'customerType'])
            ->where('status', ApplicationStatusEnum::CANCELLED);

        if ($searchTerm) {
            $query->search($searchTerm);
        }

        if ($sortField && $sortDirection) {
            $this->applySorting($query, $sortField, $sortDirection);
        }

        $applications = $query->paginate($perPage)->withQueryString();

        return inertia('monitoring/cancelled/index', [
            'applications' => $applications,
            'search' => $searchTerm,
            'currentSort' => [
                'field' => $sortField !== 'created_at' ? $sortField : null,
                'direction' => $sortField !== 'created_at' ? $sortDirection : null,
            ],
        ]);
    }


    /**
     * Verify application and update status to FOR_COLLECTION
     */
    public function verify(Request $request)
    {
        $application = CustomerApplication::findOrFail($request->application_id);

        // Ensure the application is in the correct status for verification
        if ($application->status !== ApplicationStatusEnum::VERIFIED) {
            return back()->withErrors([
                'message' => 'Application is not in the correct status for verification.'
            ]);
        }

        $application->update([
            'status' => ApplicationStatusEnum::FOR_COLLECTION
        ]);

        return back()->with('success', 'Application verified successfully. Application moved to collection.');
    }

    /**
     * Cancel application and update status to CANCELLED
     */
    public function cancel(Request $request)
    {
        $application = CustomerApplication::findOrFail($request->application_id);

        // Ensure the application is in the correct status for cancellation
        if ($application->status !== ApplicationStatusEnum::VERIFIED) {
            return back()->withErrors([
                'message' => 'Application is not in the correct status for cancellation.'
            ]);
        }

        $application->update([
            'status' => ApplicationStatusEnum::CANCELLED
        ]);

        return back()->with('success', 'Application cancelled successfully.');
    }

    /**
     * Apply sorting to the query based on the field
     */
    private function applySorting($query, string $sortField, string $sortDirection): void
    {
        switch ($sortField) {
            case 'full_name':
                // Sort by concatenated name fields
                $query->orderByRaw("CONCAT_WS(' ', COALESCE(first_name,''), COALESCE(middle_name,''), COALESCE(last_name,''), COALESCE(suffix,'')) {$sortDirection}");
                break;
            case 'customer_type.name':
                // Sort by related customer type name
                $query->join('customer_types', 'customer_applications.customer_type_id', '=', 'customer_types.id')
                      ->orderBy('customer_types.name', $sortDirection)
                      ->select('customer_applications.*');
                break;
            default:
                // For regular database columns
                $query->orderBy($sortField, $sortDirection);
                break;
        }
    }
}
