<?php

namespace Database\Seeders;

use App\Models\CustomerEnergization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerEnergizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CustomerEnergization::factory(5)->create();
    }
}
