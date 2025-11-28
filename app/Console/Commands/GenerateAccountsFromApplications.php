<?php

namespace App\Console\Commands;

use App\Models\CustomerApplication;
use App\Models\Route;
use Illuminate\Console\Command;

class GenerateAccountsFromApplications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:accounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Customer Accounts from Customer Application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $custApps = CustomerApplication::whereDoesntHave('account')->get();

        $bar = $this->output->createProgressBar($custApps->count());
        $bar->start();

        foreach($custApps as $custApp) {
            $account = $custApp->createAccount();
            $route = Route::where('barangay_id', $account->barangay_id)->inRandomOrder()->first();
            $account->route_id = $route->id;
            $account->save();
            $bar->advance();
        }

        $bar->finish();
        $this->info('Processing complete.');
    }
}
