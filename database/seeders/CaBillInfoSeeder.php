<?php

namespace Database\Seeders;

use App\Models\CaBillInfo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CaBillInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CaBillInfo::factory(20)->create();
    }
}
