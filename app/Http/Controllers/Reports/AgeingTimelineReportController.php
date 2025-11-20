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
            $validated = $request->validate([
                'stage' => ['required', 'string', 'in:' . implode(',', TimelineStageEnum::values())],
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
     */
    private function getActiveStages(): array
    {
        return TimelineStageEnum::activeStages();
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
                'customerApplication.customerType:id,rate_class,customer_type'
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
        
        return [
            'id' => $timeline->customerApplication->id,
            'current_stage' => $currentStage['stage'],
            'days_elapsed' => $daysElapsed,
            'current_stage_date' => $stageDate,
            'timeline' => $timeline,
        ];
    }

    /**
     * Find current stage (last filled stage before first null)
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
            
            if ($timeline->$stage === null) {
                break;
            }
            
            $currentStage = ['stage' => $stage, 'date' => $timeline->$stage];
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
        
        return [
            'id' => $customerApp->id,
            'account_number' => $customerApp->account_number,
            'customer_name' => $customerApp->identity,
            'status' => $customerApp->status,
            'days_elapsed' => $app['days_elapsed'],
            'days_elapsed_human' => $stageDate->diffForHumans(Carbon::now(), true),
        ];
    }
}
