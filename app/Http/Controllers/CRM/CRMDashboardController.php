<?php

namespace App\Http\Controllers\CRM;

use App\Enums\ApplicationStatusEnum;
use App\Enums\CustomerType;
use App\Enums\RateClass;
use App\Http\Controllers\Controller;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CRMDashboardController extends Controller
{

public function applicationsByStatus(Request $request)
    {

        $year = $request->input('year');
        $month = $request->input('month');

        $data = $this->getApplicationsByStatus($year, $month);

        return response()->json($data);
       
    }

    public function applicationsByRateClass(Request $request)
    {

        $year = $request->input('year');
        $month = $request->input('month');
        $status = $request->input('status');

        $data = $this->getApplicationsByCustomerType($status,$year, $month,);

        return response()->json($data);
       
    }

    public function index()
    {
        return inertia('cms/applications/dashboard', [
            'application_statuses' => function (){

                return collect(ApplicationStatusEnum::getValues())->map(fn($status) => [
                'value' => $status,
                'label' => ApplicationStatusEnum::getDescription($status)
            ])->values();
            },
            'total_applied_today' => Inertia::defer(fn() => $this->getTotalAppliedToday()),
            'total_inspected_today' => Inertia::defer(fn() => $this->getTotalInspectedToday()),
            'total_inspected_today_rate' => Inertia::defer(fn() => $this->getTotalInspectedTodayRate()),
            'total_pending_applications' => Inertia::defer(fn() => $this->getTotalPendingApplications()),
            'total_completed_applications' => Inertia::defer(fn() => $this->getTotalCompletedApplications()),
            'applications_by_status' => Inertia::defer(fn() => $this->getApplicationsByStatus()),
            'pending_applications_by_rate_class' => Inertia::defer(fn() => $this->getApplicationsByCustomerType()),
        ]);
    }

    private function getTotalAppliedToday()
    {
        return CustomerApplication::whereDate('created_at', now()->toDateString())->count() ?? 0;
    } 
    
    private function getTotalInspectedToday()
    {
        return CustApplnInspection::where('status' , 'approved')
            ->whereDate('created_at', now()->toDateString())
            ->count() ?? 0;
    }

    private function getTotalInspectedTodayRate()
    {
        $totalInspections = CustApplnInspection::whereDate('created_at', now()->toDateString())->count();
        $approvedInspections = CustApplnInspection::where('status', 'approved')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return $totalInspections > 0 ? ($approvedInspections / $totalInspections) * 100 : 0;
    }

    private function  getTotalPendingApplications() :int{

        $applications = CustomerApplication::whereNot('status', 'completed')->count();
        return $applications ?? 0;
    }

     private function  getTotalCompletedApplications() :int{

        $applications = CustomerApplication::where('status', 'completed')
        ->whereMonth('date_installed', now()->month)        
        ->count();
        return $applications ?? 0;
    }

        private function getApplicationsByStatus($year = null, $month = null)
        {

            if ($year === null) {
                $year = now()->year;
            }

            if ($month === null) {
                $month = now()->month;
            }

            $allStatuses = ApplicationStatusEnum::getValues();
            
            $statusCounts = CustomerApplication::
            whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                 ->select('status', DB::raw('count(*) as total'))

                ->groupBy('status')
                ->get()
                ->keyBy('status');

            return collect($allStatuses)->map(function ($status) use ($statusCounts) {
                return [
                    'status' => $status,
                    'total' => $statusCounts->get($status)->total ?? 0,
                    'status_label' => ApplicationStatusEnum::getDescription($status)
                ];
            });
        }

        private function getApplicationsByCustomerType($status = null, $year = null, $month = null)
        {
            $year = $year ?? now()->year;
            $month = $month ?? now()->month;
            $status = $status ?? ApplicationStatusEnum::PENDING;

            $query = CustomerApplication::with('customerType')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month);
            
            if ($status !== 'all') {
                $query->where('status', $status);
            }

            $applications = $query->get();

            return collect(CustomerType::getValues())->map(function ($customerType) use ($applications) {
                $total = $applications->filter(function ($app) use ($customerType) {
                    return $app->customerType && $app->customerType->rate_class === $customerType;
                })->count();

                return [
                    'rate_class' => $customerType,
                    'total' => $total,
                    'rate_class_label' => CustomerType::getDescription($customerType)
                ];
            });
        }
    

}
