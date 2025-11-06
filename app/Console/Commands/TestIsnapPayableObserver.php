<?php

namespace App\Console\Commands;

use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Models\Payable;
use Illuminate\Console\Command;

class TestIsnapPayableObserver extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:isnap-observer {payable_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the ISNAP payable observer by updating a payable status to PAID';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $payableId = $this->argument('payable_id');

        if ($payableId) {
            $payable = Payable::find($payableId);
            
            if (!$payable) {
                $this->error("Payable with ID {$payableId} not found.");
                return 1;
            }
        } else {
            // Find first ISNAP fee payable that's not paid
            $payable = Payable::where('type', PayableTypeEnum::ISNAP_FEE)
                ->where('status', '!=', PayableStatusEnum::PAID)
                ->first();

            if (!$payable) {
                $this->error('No unpaid ISNAP fee payable found.');
                return 1;
            }
        }

        $this->info("Testing observer with Payable ID: {$payable->id}");
        $this->info("Current status: {$payable->status}");
        $this->info("Type: {$payable->type}");

        // Update the status to trigger the observer
        $this->info("Updating status to PAID...");
        
        $payable->update([
            'status' => PayableStatusEnum::PAID,
            'amount_paid' => $payable->total_amount_due,
            'balance' => 0,
        ]);

        $this->info("Update complete!");
        $this->info("Check storage/logs/laravel.log for observer logs.");
        $this->info("Check cust_appln_inspections table for new inspection record.");

        return 0;
    }
}
