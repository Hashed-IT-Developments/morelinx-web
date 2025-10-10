<?php

namespace Database\Seeders;

use App\Models\CustomerApplication;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        CustomerApplication::factory(10)->create();
    }
}
