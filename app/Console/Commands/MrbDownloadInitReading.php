<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MrbDownloadInitReading extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mrb:download-init-reading';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a CSV file containing all the accounts for initialization of readings data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $activeAccounts = \App\Models\CustomerAccount::where('account_status', 'active')->get();

        $filename = 'init_readings_' . date('Y-m-d_His') . '.csv';
        $filepath = storage_path('app/' . $filename);

        $file = fopen($filepath, 'w');

        // Write header row
        fputcsv($file, ['ID', 'Account Number', 'Account Name', 'Reading']);

        // Write account data
        foreach ($activeAccounts as $account) {
            fputcsv($file, [
            $account->id,
            $account->account_number,
            $account->account_name,
            '' // blank for Reading
            ]);
        }

        fclose($file);

        $this->info("CSV file generated successfully: {$filename}");
        $this->info("File location: {$filepath}");

        $homeDirectory = getenv('HOME') ?: getenv('USERPROFILE');
        $destinationPath = $homeDirectory . DIRECTORY_SEPARATOR . $filename;

        if (copy($filepath, $destinationPath)) {
            $this->info("File copied to: {$destinationPath}");
        } else {
            $this->error("Failed to copy file to home directory");
        }
    }
}
