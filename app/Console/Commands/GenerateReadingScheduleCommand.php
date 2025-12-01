<?php

namespace App\Console\Commands;

use App\Models\ReadingSchedule;
use Illuminate\Console\Command;

class GenerateReadingScheduleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:reading-schedule
                            {month? : Billing month (1-12)}
                            {year? : Billing year (e.g., 2025)}
                            {--force : Skip confirmation}
                            {--routes=* : Specific route IDs}
                            {--limit= : Maximum number of routes to process}';
    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate reading schedules for all routes.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $month = (int)($this->argument('month') ?? now()->month);
        $year = (int)($this->argument('year') ?? now()->year);
        $routeIds = $this->option('routes');

        if ($month < 1 || $month > 12) {
            $this->error("Invalid month: {$month}. Must be 1-12.");
            return self::FAILURE;
        }

        $dateString = sprintf('%04d-%02d', $year, $month);

        $limit = $this->option('limit') ? (int)$this->option('limit') : null;
        if ($limit && $limit < 1) {
            $this->error("Limit must be at least 1.");
            return self::FAILURE;
        }

        $existingQuery = ReadingSchedule::forBillingMonth($year, $month);
        if ($routeIds) {
            $existingQuery->whereIn('route_id', $routeIds);
        }
        $existingCount = $existingQuery->count();

        if ($existingCount > 0 && !$this->option('force')) {
            $this->warn("Found {$existingCount} existing schedules for {$dateString}.");
            if (!$this->confirm('Do you want to regenerate them?', false)) {
                $this->info('Operation cancelled.');
                return self::SUCCESS;
            }
        }

        $this->info("Generating up to " . ($limit ?? 'all') . " schedules for {$dateString}...");

        $schedules = ReadingSchedule::generateForMonth($year, $month, $routeIds, $limit);

        $this->info("Success! Generated {$schedules->count()} schedules.");

        return self::SUCCESS;
    }
}
