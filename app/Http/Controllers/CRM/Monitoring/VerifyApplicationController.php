<?php

namespace App\Http\Controllers\CRM\Monitoring;

use App\Enums\ApplicationStatusEnum;
use App\Events\MakeLog;
use App\Http\Controllers\Controller;
use App\Models\CustomerApplication;
use App\Services\PayableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VerifyApplicationController extends Controller
{
    public function index(Request $request)
    {
        $searchTerm = $request->get('search');
        $perPage = $request->get('per_page', 10);
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $statusFilter = $request->get('status', 'for_verification');

        // Start building the query with status filter
        $query = CustomerApplication::with(['barangay.town', 'customerType'])
            ->where('status', $statusFilter === 'for_collection' 
                ? ApplicationStatusEnum::FOR_COLLECTION 
                : ApplicationStatusEnum::FOR_VERIFICATION);

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

        return inertia('crm/monitoring/verify-applications/index', [
            'applications' => $applications,
            'search' => $searchTerm,
            'statusFilter' => $statusFilter,
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

        return inertia('crm/monitoring/cancelled/index', [
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
        $application = CustomerApplication::with(['account', 'inspections.materialsUsed'])->findOrFail($request->application_id);

       
        if ($application->status !== ApplicationStatusEnum::FOR_VERIFICATION) {
            return back()->withErrors([
                'message' => 'Application is not in the correct status for verification.'
            ]);
        }

    
        if (!$application->account) {
            return back()->withErrors([
                'message' => 'Customer account not found. Cannot create payables.'
            ]);
        }

      
        $latestInspection = $application->inspections()->with('materialsUsed')->latest()->first();

        if (!$latestInspection) {
            return back()->withErrors([
                'message' => 'No inspection found for this application. Cannot create payables.'
            ]);
        }

      
        $billDepositAmount = $latestInspection->bill_deposit ?? 0.00;
        $materialDepositAmount = $latestInspection->material_deposit ?? 0.00;
        $laborCostAmount = $latestInspection->total_labor_costs ?? 0.00;

       
        $materialDefinitions = $latestInspection->materialsUsed->map(function ($material) {
            return [
                'transaction_name' => $material->material_name,
                'transaction_code' => 'MAT-' . $material->id,
                'quantity' => $material->quantity,
                'unit' => $material->unit,
                'amount' => $material->amount,
                'total_amount' => $material->quantity * $material->amount,
            ];
        })->toArray();

     
        DB::transaction(function () use ($application, $billDepositAmount, $materialDepositAmount, $laborCostAmount, $materialDefinitions) {
                      
            $payables = PayableService::createBulk($application->account->id, function($builder) use ($billDepositAmount, $materialDepositAmount, $laborCostAmount, $materialDefinitions) {
                $builder->billDeposit()->totalAmountDue($billDepositAmount)->energization();
                $builder->materialCost()->totalAmountDue($materialDepositAmount)->addDefinitions($materialDefinitions)->energization();
                $builder->laborCost()->totalAmountDue($laborCostAmount)->energization();
            });

       
            $createdPayables = collect($payables)->filter()->count();

            if(!$createdPayables) {
                throw new \Exception('No payables were created. Verification aborted.');
            }


            $application->update([
                'status' => ApplicationStatusEnum::FOR_COLLECTION
            ]);


            event(new MakeLog(
                    'application',
                    $application->id,
                    'Application Verified for Collection',
                    'Application has been verified and moved to collection. ',
                    Auth::id(),
                ));

                
            session()->flash('payables_created', $createdPayables);
        });

        $payablesCount = session('payables_created', 0);
        return back()->with('success', "Application verified successfully. Application moved to collection with {$payablesCount} payables created.");
    }

    /**
     * Cancel application and update status to CANCELLED
     */
    public function cancel(Request $request)
    {
        $application = CustomerApplication::findOrFail($request->application_id);

        // Ensure the application is in the correct status for cancellation
        if ($application->status !== ApplicationStatusEnum::FOR_VERIFICATION) {
            return back()->withErrors([
                'message' => 'Application is not in the correct status for cancellation.'
            ]);
        }

        $application->update([
            'status' => ApplicationStatusEnum::CANCELLED
        ]);

        event(new MakeLog(
            'application',
            $application->id,
            'Application Cancelled',
            'Application has been cancelled during verification stage.',
            Auth::id(),
        ));

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
