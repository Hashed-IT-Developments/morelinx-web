<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Town;
use Illuminate\Database\Seeder;

class TownSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Town::factory(10)
            ->hasBarangays(20)
            ->create();

        District::factory(40)->create();
    }
}
