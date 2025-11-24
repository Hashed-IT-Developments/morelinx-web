<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MrbUploadInitReading extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mrb:upload-init-reading {path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Upload a CSV file containing initial readings data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $path = $this->argument('path');

        if (!file_exists($path) || !is_readable($path)) {
            $this->error("File not found or not readable: {$path}");
            return 1;
        }
        $file = fopen($path, 'r');
        $header = fgetcsv($file);
        $expectedHeader = ['ID', 'Account Number', 'Account Name', 'Reading'];
        if ($header !== $expectedHeader) {
            $this->error("Invalid CSV header. Expected: " . implode(',', $expectedHeader));
            fclose($file);
            return 1;
        }

        if (!$this->confirm('This action will truncate the readings table. Do you want to continue?')) {
            fclose($file);
            $this->info('Operation cancelled.');
            return 0;
        }

        $updatedCount = 0;
        $billingMonth = date('Y-m', strtotime('-1 month')); // Previous month in 'YYYY-MM' format
        \App\Models\Reading::truncate();
        while (($row = fgetcsv($file)) !== false) {
            $accountId = $row[0];
            $readingValue = $row[3];
            \App\Models\Reading::create([
                'customer_account_id' => $accountId,
                'bill_month' => $billingMonth,
                'previous_reading' => 0,
                'present_reading' => $readingValue,
            ]);
            $updatedCount++;
        }
        fclose($file);
        $this->info("Successfully uploaded initial readings for {$updatedCount} accounts.");
        return 0;
    }
}
