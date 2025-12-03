<?php

namespace App\Http\Controllers\Reports;

use App\Enums\TimelineStageEnum;
use App\Http\Controllers\Controller;
use App\Models\AgeingTimeline;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Response;

class AgeingTimelineReportController extends Controller
{
    // Minimum age in days for applications to appear in report
    private const MIN_AGE_DAYS = 30;

    private const AGE_RANGES = [
        ['min' => 30, 'max' => 59],
        ['min' => 60, 'max' => 89],
        ['min' => 90, 'max' => 119],
        ['min' => 120, 'max' => 149],
        ['min' => 150, 'max' => 179],
        ['min' => 180, 'max' => 209],
        ['min' => 210, 'max' => 239],
        ['min' => 240, 'max' => 269],
        ['min' => 270, 'max' => 299],
        ['min' => 300, 'max' => 329],
        ['min' => 330, 'max' => 359],
        ['min' => 360, 'max' => 365],
        ['min' => 366, 'max' => null],
    ];

    public function index(): Response
    {
        $activeStages = $this->getActiveStages();
        $applications = $this->fetchApplicationsWithCurrentStage();
        $ageingData = $this->buildAgeingMatrix($applications, $activeStages);

        return inertia('reports/ageing-timeline/index', [
            'ageingData' => $ageingData,
            'stages' => $activeStages,
        ]);
    }

    public function applications(Request $request): JsonResponse
    {
        try {
            // Get all valid stages including virtual ones
            $validStages = array_merge(
                TimelineStageEnum::values(),
                ['inspection_date_du', 'inspection_date_customer']
            );
            
            $validated = $request->validate([
                'stage' => ['required', 'string', 'in:' . implode(',', $validStages)],
                'age_range_index' => ['required', 'integer', 'min:0', 'max:' . (count(self::AGE_RANGES) - 1)],
            ]);

            $applications = $this->getFilteredApplications(
                $validated['stage'],
                $validated['age_range_index']
            );

            return response()->json([
                'success' => true,
                'applications' => $applications,
                'total' => $applications->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch applications. Please try again.',
                'applications' => [],
                'total' => 0,
            ], 500);
        }
    }

    /**
     * Get active stages (excluding 'activated')
     * Expands inspection_date into two virtual columns: DU and Customer
     */
    private function getActiveStages(): array
    {
        $stages = TimelineStageEnum::activeStages();
        
        // Replace inspection_date with two virtual stages
        $expandedStages = [];
        foreach ($stages as $stage) {
            if ($stage === 'inspection_date') {
                $expandedStages[] = 'inspection_date_du';
                $expandedStages[] = 'inspection_date_customer';
            } else {
                $expandedStages[] = $stage;
            }
        }
        
        return $expandedStages;
    }

    /**
     * Build ageing matrix: age ranges × stages
     */
    private function buildAgeingMatrix(Collection $applications, array $activeStages): array
    {
        $matrix = [];

        // Build data rows for each age range
        foreach (self::AGE_RANGES as $rangeIndex => $range) {
            $matrix[] = $this->buildMatrixRow($applications, $activeStages, $range, $rangeIndex);
        }

        // Add totals row
        $matrix[] = $this->buildTotalsRow($applications, $activeStages);

        return $matrix;
    }

    /**
     * Build a single matrix row for an age range
     */
    private function buildMatrixRow(Collection $applications, array $activeStages, array $range, int $rangeIndex): array
    {
        $row = [
            'range_index' => $rangeIndex,
            'min_days' => $range['min'],
            'max_days' => $range['max'],
            'stages' => [],
            'total' => 0,
        ];

        foreach ($activeStages as $stage) {
            $count = $this->countApplicationsInRange($applications, $stage, $range);
            $row['stages'][$stage] = $count;
            $row['total'] += $count;
        }

        return $row;
    }

    /**
     * Build totals row summing all stages
     */
    private function buildTotalsRow(Collection $applications, array $activeStages): array
    {
        $totalsRow = [
            'range_index' => -1,
            'min_days' => null,
            'max_days' => null,
            'stages' => [],
            'total' => 0,
        ];

        foreach ($activeStages as $stage) {
            $count = $applications->where('current_stage', $stage)->count();
            $totalsRow['stages'][$stage] = $count;
        }

        // Total is the count of all applications (each counted once)
        $totalsRow['total'] = $applications->count();

        return $totalsRow;
    }

    /**
     * Count applications in a specific stage and age range
     */
    private function countApplicationsInRange(Collection $applications, string $stage, array $range): int
    {
        return $applications->filter(function ($app) use ($stage, $range) {
            return $app['current_stage'] === $stage 
                && $app['days_elapsed'] >= $range['min']
                && ($range['max'] === null || $app['days_elapsed'] <= $range['max']);
        })->count();
    }

    /**
     * Fetch all incomplete applications with their current stage (optimized, no N+1)
     */
    private function fetchApplicationsWithCurrentStage(): Collection
    {
        $timelines = AgeingTimeline::with([
                'customerApplication:id,account_number,first_name,last_name,middle_name,suffix,trade_name,status,customer_type_id',
                'customerApplication.customerType:id,rate_class,customer_type',
                'customerApplication.causeOfDelays:id,customer_application_id,process,delay_source'
            ])
            ->whereNull('activated')
            ->get();
        
        $now = Carbon::now();

        // Map and filter, then group by customer application ID to ensure uniqueness
        return $timelines
            ->map(fn($timeline) => $this->mapTimelineToApplication($timeline, $now))
            ->filter()
            ->groupBy('id') // Group by customer application ID
            ->map(fn($group) => $group->first()) // Take only the first occurrence of each application
            ->values(); // Reset array keys
    }

    /**
     * Map timeline to application data with current stage
     */
    private function mapTimelineToApplication(AgeingTimeline $timeline, Carbon $now): ?array
    {
        $currentStage = $this->findCurrentStage($timeline);
        
        if (!$currentStage) {
            return null;
        }

        $stageDate = $timeline->{$currentStage['stage']};
        $daysElapsed = Carbon::parse($stageDate)->diffInDays($now);
        
        // Only include applications that meet minimum age requirement
        if ($daysElapsed < self::MIN_AGE_DAYS) {
            return null;
        }
        
        // If stage is inspection_date, check if it should be customer-based
        $resolvedStage = $this->resolveInspectionStage($timeline, $currentStage['stage']);
        
        return [
            'id' => $timeline->customerApplication->id,
            'current_stage' => $resolvedStage,
            'days_elapsed' => $daysElapsed,
            'current_stage_date' => $stageDate,
            'timeline' => $timeline,
        ];
    }

    /**
     * Resolve inspection stage based on delay source
     * Returns virtual stage names: inspection_date_du or inspection_date_customer
     */
    private function resolveInspectionStage(AgeingTimeline $timeline, string $stage): string
    {
        if ($stage !== 'inspection_date') {
            return $stage;
        }

        // Check if there's a customer delay in inspection process
        $hasCustomerDelay = $timeline->customerApplication
            ->causeOfDelays()
            ->where('process', 'inspection')
            ->where('delay_source', 'customer')
            ->exists();

        return $hasCustomerDelay 
            ? 'inspection_date_customer'
            : 'inspection_date_du';
    }

    /**
     * Find current stage (last non-null stage in the timeline)
     * Handles cases where earlier stages may be null but later stages have data
     */
    private function findCurrentStage(AgeingTimeline $timeline): ?array
    {
        $currentStage = null;

        foreach (TimelineStageEnum::cases() as $stageEnum) {
            // Skip activated stage as it represents completion
            if ($stageEnum->isCompleted()) {
                continue;
            }
            
            $stage = $stageEnum->value;
            
            // Keep track of the last non-null stage
            if ($timeline->$stage !== null) {
                $currentStage = ['stage' => $stage, 'date' => $timeline->$stage];
            }
        }

        return $currentStage;
    }

    /**
     * Get filtered applications for a specific stage and age range
     */
    private function getFilteredApplications(string $stage, int $rangeIndex): Collection
    {
        $range = self::AGE_RANGES[$rangeIndex];
        $applications = $this->fetchApplicationsWithCurrentStage();

        return $applications
            ->filter(fn($app) => $this->matchesStageAndRange($app, $stage, $range))
            ->map(fn($app) => $this->formatApplicationForDisplay($app))
            ->sortByDesc('days_elapsed')
            ->values();
    }

    /**
     * Check if application matches stage and range criteria
     */
    private function matchesStageAndRange(array $app, string $stage, array $range): bool
    {
        return $app['current_stage'] === $stage 
            && $app['days_elapsed'] >= $range['min']
            && ($range['max'] === null || $app['days_elapsed'] <= $range['max']);
    }

    /**
     * Format application data for display
     */
    private function formatApplicationForDisplay(array $app): array
    {
        $customerApp = $app['timeline']->customerApplication;
        $stageDate = Carbon::parse($app['current_stage_date']);
        
        // Get the most recent cause of delay for the current stage process
        $currentProcess = $this->getProcessFromStage($app['current_stage']);
        $latestDelay = $customerApp->causeOfDelays
            ->where('process', $currentProcess)
            ->sortByDesc('created_at')
            ->first();
        
        return [
            'id' => $customerApp->id,
            'account_number' => $customerApp->account_number,
            'customer_name' => $customerApp->identity,
            'status' => $customerApp->status,
            'days_elapsed' => $app['days_elapsed'],
            'days_elapsed_human' => $stageDate->diffForHumans(Carbon::now(), true),
            'cause_of_delay' => $latestDelay ? [
                'delay_source' => ucfirst($latestDelay->delay_source),
                'remarks' => $latestDelay->remarks,
            ] : null,
        ];
    }

    /**
     * Map virtual stage to process name
     */
    private function getProcessFromStage(string $stage): string
    {
        return match($stage) {
            'during_application' => 'application',
            'forwarded_to_inspector', 'inspection_date_du', 'inspection_date_customer', 'inspection_date' => 'inspection',
            'inspection_uploaded_to_system' => 'inspection',
            'paid_to_cashier' => 'payment',
            'contract_signed' => 'payment',
            'assigned_to_lineman', 'downloaded_to_lineman', 'installed_date' => 'installation',
            default => 'application',
        };
    }
}
