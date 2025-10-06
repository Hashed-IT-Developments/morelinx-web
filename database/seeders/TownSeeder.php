<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TownSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Town::factory(50)
            ->hasBarangays(50)
            ->create();
    }
}
