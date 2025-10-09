<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CustomerApplication;

class GenerateCustomerApplications extends Command
{
    protected $signature = 'generate:customers 
                            {--count=1000 : Number of customers to create (max 100000)} 
                            {--batch=500 : Batch size for insertion}
                            {--truncate : Truncate table before seeding}';

    protected $description = 'Generate fake Customer Applications in batches using factories.';

    public function handle()
    {
        $count = (int) $this->option('count');
        $batch = (int) $this->option('batch');
        $truncate = $this->option('truncate');

        $max = 100000;
        if ($count > $max) {
            $this->warn("Capping count to {$max}.");
            $count = $max;
        }

        if ($truncate) {
            $this->warn('Truncating customer_applications table...');
            \App\Models\CustomerApplication::truncate();
            $this->info('Customer applications table truncated.');
        }


        $this->info("Generating {$count} Customer Applications in batches of {$batch}...");

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $remaining = $count;
        while ($remaining > 0) {
            $current = min($batch, $remaining);

            CustomerApplication::factory($current)
                ->hasContactInfo()
                ->hasBillInfo()
                ->hasInspections(rand(1,3))
                ->create();

            $remaining -= $current; 
            $bar->advance($current);
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Successfully generated {$count} customer applications.");

        return 0;
    }
}
