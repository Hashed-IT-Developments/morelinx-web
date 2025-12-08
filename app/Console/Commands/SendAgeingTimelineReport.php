<?php

namespace App\Console\Commands;

use App\Mail\AgeingTimelineReportMail;
use App\Models\AgeingTimeline;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;

class SendAgeingTimelineReport extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'report:send-ageing-timeline 
                            {--frequency=daily : Report frequency (daily, weekly, monthly)}
                            {--recipients= : Comma-separated email addresses (overrides config)}';

    /**
     * The console command description.
     */
    protected $description = 'Send Aging Timeline Report to configured executives via email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $frequency = $this->option('frequency');
        $this->info("Generating Aging Timeline Report ({$frequency})...");

        try {
            // Get report data
            $reportData = $this->generateReportData();

            // Get recipients
            $recipients = $this->getRecipients();

            if (empty($recipients)) {
                $this->error('No recipients configured. Please add recipients in config or use --recipients option.');
                return Command::FAILURE;
            }

            // Send emails
            $this->info('Sending report to ' . count($recipients) . ' recipient(s)...');
            
            foreach ($recipients as $recipient) {
                Mail::to($recipient)->send(new AgeingTimelineReportMail($reportData, $frequency));
                $this->info("✓ Sent to: {$recipient}");
            }

            $this->info('Aging Timeline Report sent successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Failed to send report: ' . $e->getMessage());
            $this->error('Line: ' . $e->getLine() . ' in ' . $e->getFile());
            $this->error('Trace: ' . $e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    /**
     * Generate report data
     */
    private function generateReportData(): array
    {
        $timelines = AgeingTimeline::with([
                'customerApplication:id,account_number,first_name,last_name,middle_name,suffix,trade_name,status,customer_type_id',
                'customerApplication.customerType:id,rate_class,customer_type',
            ])
            ->whereNull('activated')
            ->whereHas('customerApplication', function ($query) {
                $query->where('status', '!=', 'active');
            })
            ->get();

        $now = Carbon::now();
        $applications = $this->processTimelines($timelines, $now);

        // Get active stages
        $stages = $this->getActiveStages();

        // Build summary data
        $summary = $this->buildSummary($applications, $stages);

        return [
            'generated_at' => $now->format('F d, Y h:i A'),
            'total_applications' => $applications->count(),
            'summary' => $summary,
            'stages' => $stages,
            'applications' => $applications->toArray(),
            'critical_applications' => $this->getCriticalApplications($applications),
        ];
    }

    /**
     * Process timelines to application data
     */
    private function processTimelines(Collection $timelines, Carbon $now): Collection
    {
        return $timelines
            ->map(function ($timeline) use ($now) {
                // Skip if application is null
                if (!$timeline->customerApplication) {
                    return null;
                }

                $currentStage = $this->findCurrentStage($timeline);
                
                if (!$currentStage) {
                    return null;
                }

                $stageDate = $timeline->{$currentStage['stage']};
                $daysElapsed = Carbon::parse($stageDate)->diffInDays($now);

                return [
                    'id' => $timeline->customerApplication->id,
                    'account_number' => $timeline->customerApplication->account_number,
                    'customer_name' => $timeline->customerApplication->identity,
                    'current_stage' => $currentStage['stage'],
                    'days_elapsed' => $daysElapsed,
                    'status' => $timeline->customerApplication->status,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * Build summary statistics
     */
    private function buildSummary(Collection $applications, array $stages): array
    {
        $summary = [
            'by_stage' => [],
            'by_age_group' => [
                'below_7_days' => 0,
                '7_to_30_days' => 0,
                '30_to_90_days' => 0,
                'above_90_days' => 0,
            ],
        ];

        // Count by stage
        foreach ($stages as $stage) {
            $count = $applications->where('current_stage', $stage)->count();
            $summary['by_stage'][$stage] = $count;
        }

        // Count by age group
        foreach ($applications as $app) {
            $days = $app['days_elapsed'] ?? 0;
            if ($days < 7) {
                $summary['by_age_group']['below_7_days']++;
            } elseif ($days < 30) {
                $summary['by_age_group']['7_to_30_days']++;
            } elseif ($days < 90) {
                $summary['by_age_group']['30_to_90_days']++;
            } else {
                $summary['by_age_group']['above_90_days']++;
            }
        }

        return $summary;
    }

    /**
     * Get critical applications (over 90 days)
     */
    private function getCriticalApplications(Collection $applications): Collection
    {
        return $applications
            ->filter(fn($app) => ($app['days_elapsed'] ?? 0) >= 90)
            ->sortByDesc('days_elapsed')
            ->take(20)
            ->values();
    }

    /**
     * Get active stages
     */
    private function getActiveStages(): array
    {
        return [
            'during_application',
            'forwarded_to_inspector',
            'inspection_date',
            'inspection_uploaded_to_system',
            'paid_to_cashier',
            'contract_signed',
            'assigned_to_lineman',
            'downloaded_to_lineman',
            'installed_date',
        ];
    }

    /**
     * Find current stage for a timeline
     */
    private function findCurrentStage($timeline): ?array
    {
        $currentStage = null;
        $stages = $this->getActiveStages();

        foreach ($stages as $stage) {
            if ($timeline->$stage !== null) {
                $currentStage = ['stage' => $stage, 'date' => $timeline->$stage];
            }
        }

        return $currentStage;
    }

    /**
     * Get email recipients
     */
    private function getRecipients(): array
    {
        // Check if recipients are provided via command option
        if ($recipientsOption = $this->option('recipients')) {
            return array_map('trim', explode(',', $recipientsOption));
        }

        // Get from configuration
        $recipients = config('reports.ageing_timeline.recipients', []);

        // If no config, try to get admin/executive users
        if (empty($recipients)) {
            $recipients = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'superadmin']);
            })
            ->pluck('email')
            ->toArray();
        }

        return $recipients;
    }
}
