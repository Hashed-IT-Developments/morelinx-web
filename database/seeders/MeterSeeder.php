<?php

namespace Database\Seeders;

use App\Models\Meter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MeterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Meter::factory()->count(5)->create();
    }
}
