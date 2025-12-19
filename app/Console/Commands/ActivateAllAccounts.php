<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ActivateAllAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activate:all-accounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate all customer accounts in the system.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        DB::table('customer_accounts')->update(['account_status' => 'active']);
    }
}
