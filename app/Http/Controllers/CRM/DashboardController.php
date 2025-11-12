<?php

namespace App\Http\Controllers\CRM;

use App\Enums\ApplicationStatusEnum;
use App\Enums\RateClass;
use App\Http\Controllers\Controller;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return inertia('cms/applications/dashboard', [
            'total_applied_today' => Inertia::defer(fn() => $this->getTotalAppliedToday()),
            'total_inspected_today' => Inertia::defer(fn() => $this->getTotalInspectedToday()),
            'total_inspected_today_rate' => Inertia::defer(fn() => $this->getTotalInspectedTodayRate()),
            'total_pending_applications' => Inertia::defer(fn() => $this->getTotalPendingApplications()),
            'total_completed_applications' => Inertia::defer(fn() => $this->getTotalCompletedApplications()),
            'applications_by_status' => Inertia::defer(fn() => $this->getApplicationsByStatus()),
            'pending_applications_by_rate_class' => Inertia::defer(fn() => $this->getPendingApplicationsByRateClass()),
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

        private function getApplicationsByStatus()
        {
            $allStatuses = ApplicationStatusEnum::getValues();
            
            $statusCounts = CustomerApplication::select('status', DB::raw('count(*) as total'))
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

        private function getPendingApplicationsByRateClass(){
            $rateClasses = RateClass::getValues();

            $applications = CustomerApplication::with('customerType')
                ->whereNot('status', 'completed')
                ->get()
                ->groupBy('customer_type_id');

            return collect($rateClasses)->map(function ($rateClass) use ($applications) {
                $matchingApplications = $applications->filter(function ($items) use ($rateClass) {
                    $firstItem = $items->first();
                    return $firstItem->customerType && $firstItem->customerType->rate_class === $rateClass;
                });

                $total = $matchingApplications->sum(function ($items) {
                    return $items->count();
                });

                return [
                    'rate_class' => $rateClass,
                    'total' => $total,
                    'rate_class_label' => RateClass::getDescription($rateClass)
                ];
            });
        }
    

}
