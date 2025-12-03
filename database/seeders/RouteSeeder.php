<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $barangays = Barangay::get();
        $userIds = User::role('meter reader')->pluck('id')->toArray();

        $meterId = $userIds[array_rand($userIds)];

        $serial = 1234;

        $days = [10,16,22,28];

        foreach($barangays as $barangay) {
            $readingDay = $days[array_rand($days)];

            \App\Models\Route::create([
                'name' => $barangay->alias . '-' . $readingDay . '-' . $serial++,
                'reading_day_of_month' => $readingDay,
                'barangay_id' => $barangay->id,
                'meter_reader_id' => $meterId,
            ]);
        }

        //assign all accounts to its corresponding route
        $accounts = \App\Models\CustomerAccount::get();
        foreach($accounts as $account) {
            $route = \App\Models\Route::where('barangay_id', $account->barangay_id)->inRandomOrder()->first();
            if($route) {
                $account->route_id = $route->id;
                $account->save();
            }
        }
    }
}
