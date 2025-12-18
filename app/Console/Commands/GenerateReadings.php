<?php

namespace App\Console\Commands;

use App\Enums\AccountStatusEnum;
use App\Models\CustomerAccount;
use Illuminate\Console\Command;

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

        foreach ($accounts as $account) {
            $previousReading = $account->getPreviousReadingForMonth($billingMonth);
            $previousReadingValue = $previousReading ? $previousReading->present_reading : $account->getInitialReadingValue();

            $presentReadingValue = $previousReadingValue + rand(50, 500);

            $kwhConsumption = $presentReadingValue - $previousReadingValue;

            $demandPreviousReading = null;
            $demandPresentReading = null;
            $demandKwhConsumption = null;

            if ($account->isHighVoltage()) {
                $demandPreviousReading = rand(100, 500);
                $demandPresentReading = $demandPreviousReading + rand(20, 100); // Dummy demand consumption
                $demandKwhConsumption = $demandPresentReading - $demandPreviousReading;
            }

            $solarPreviousReading = null;
            $solarPresentReading = null;
            $solarKwhGenerated = null;

            if ($account->net_metered) {
                $solarPreviousReading = rand(0, 200);
                $solarPresentReading = $solarPreviousReading + rand(10, 100); // Dummy solar generation
                $solarKwhGenerated = $solarPresentReading - $solarPreviousReading;
            }

            \DB::table('readings')->insert([
                'customer_account_id' => $account->id,
                'bill_month' => $billingMonth,
                'previous_reading' => $previousReading,
                'present_reading' => $presentReading,
                'kwh_consumption' => $kwhConsumption,
                'demand_previous_reading' => $demandPreviousReading,
                'demand_present_reading' => $demandPresentReading,
                'demand_kwh_consumption' => $demandKwhConsumption,
                'solar_previous_reading' => $solarPreviousReading,
                'solar_present_reading' => $solarPresentReading,
                'solar_kwh_generated' => $solarKwhGenerated,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->info("Generated reading for Account ID: {$account->id} for {$billingMonth}");
        }
    }

}
