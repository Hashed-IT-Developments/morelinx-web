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
        Town::factory(100)
            ->hasBarangays(50)
            ->create();

        District::factory(40)->create();
    }
}
