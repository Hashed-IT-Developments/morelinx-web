<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call(InitRolesAndPermissions::class);
        $this->call(TownSeeder::class);
        $this->call(CustomerApplicationSeeder::class);
        $this->call(CustomerTypeSeeder::class);
        $this->call(CustApplnInspectionSeeder::class);
        $this->call(MaterialItemSeeder::class);
        $this->call(PayablesSeeder::class);
        // $this->call(TransactionSeriesSeeder::class);
        $this->call(UmsRateSeeder::class);
        $this->call(SettingSeeder::class);
        $this->call(CustomerEnergizationSeeder::class);
        $this->call(MeterSeeder::class);
    }

}
