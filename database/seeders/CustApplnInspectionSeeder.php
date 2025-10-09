<?php

namespace Database\Seeders;

use App\Models\CustApplnInspection;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustApplnInspectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CustApplnInspection::factory(50)->create();
    }
}
