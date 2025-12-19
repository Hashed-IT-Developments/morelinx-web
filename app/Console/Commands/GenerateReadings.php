<?php

namespace App\Console\Commands;

use App\Enums\AccountStatusEnum;
use App\Models\CustomerAccount;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateReadings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:readings {billing_month}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate dummy readings for a given billing month.';

    /**
     * Execute the console command.
     * Notes to self: Some accounts may not have previous readings; handle accordingly.
     *  Some accounts have solar panels; include solar readings where applicable.
     *  Some accounts may have demand meters; include demand readings where applicable.
     * Some Assumptions:
     *  Accounts with customer_type high_voltage have demand meters.
     *  Accounts with net_metered = true have solar panels and require solar readings.
     */
    public function handle()
    {
        $accounts = CustomerAccount::where('account_status', AccountStatusEnum::ACTIVE)->get();
        $billingMonth = $this->argument('billing_month');

        $this->info("Generating readings for {$accounts->count()} accounts for billing month: {$billingMonth}");

        DB::transaction(function () use ($accounts, $billingMonth) {
            $progressBar = $this->output->createProgressBar($accounts->count());
            $progressBar->start();

            foreach ($accounts as $account) {
                $previousReadingValue = $account->getPreviousReadingValueForMonth($billingMonth);
                $presentReadingValue = $previousReadingValue + rand(50, 500);

                $kwhConsumption = $presentReadingValue - $previousReadingValue;

                $demandPreviousReadingValue = null;
                $demandPresentReadingValue = null;
                $demandKwhConsumption = null;

                if ($account->isHighVoltage()) {
                    $demandPreviousReadingValue = $account->getPreviousDemandReadingValueForMonth($billingMonth);
                    $demandPresentReadingValue = $demandPreviousReadingValue + rand(20, 100);
                    $demandKwhConsumption = $demandPresentReadingValue - $demandPreviousReadingValue;
                }

                $solarPreviousReadingValue = null;
                $solarPresentReadingValue = null;
                $solarKwhGenerated = null;

                if ($account->net_metered) {
                    $solarPreviousReadingValue = $account->getPreviousSolarReadingValueForMonth($billingMonth);
                    $solarPresentReadingValue = $solarPreviousReadingValue + rand(10, 100);
                    $solarKwhGenerated = $solarPresentReadingValue - $solarPreviousReadingValue;
                }

                DB::table('readings')->insert([
                    'customer_account_id' => $account->id,
                    'bill_month' => $billingMonth,
                    'previous_reading' => $previousReadingValue,
                    'present_reading' => $presentReadingValue,
                    'kwh_consumption' => $kwhConsumption,
                    'demand_previous_reading' => $demandPreviousReadingValue,
                    'demand_present_reading' => $demandPresentReadingValue,
                    'demand_kwh_consumption' => $demandKwhConsumption,
                    'solar_previous_reading' => $solarPreviousReadingValue,
                    'solar_present_reading' => $solarPresentReadingValue,
                    'solar_kwh_generated' => $solarKwhGenerated,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $progressBar->advance();
            }

            $progressBar->finish();
        });

        $this->newLine();
        $this->info("Successfully generated readings for {$accounts->count()} accounts.");
    }

}
