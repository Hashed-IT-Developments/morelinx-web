<?php

namespace Database\Seeders;

use App\Models\CaContactInfo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CaContactInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CaContactInfo::factory(20)->create();
    }
}
