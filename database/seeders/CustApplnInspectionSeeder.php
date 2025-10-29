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
        // Create 10 inspections in "for_inspection" state (no inspector assigned)
        CustApplnInspection::factory(10)->forInspection()->create();
        
        // Create 10 inspections in "for_inspection_approval" state (inspector assigned)
        CustApplnInspection::factory(10)->forInspectionApproval()->create();
    }
}
