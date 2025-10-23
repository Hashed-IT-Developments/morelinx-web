<?php

namespace Database\Seeders;

use App\Models\CustomerType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CustomerTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customerTypes = [
            'residential' => [
                'Sitio Electrification',
                'Temporary',
                'Permanent',
                'Net Metering',
                'Big Load (19kV above)',
                'Low Load',
                'Informal Settlers',
                'REC'
            ],
            'commercial' => [
                'High Voltage',
                'Low Voltage',
                'Net Metering',
                'REC',
                'EOU',
                'Power'
            ],
            // 'government' => [
            //     'High Voltage',
            //     'Low Voltage',
            //     'Net Metering',
            //     'REC',
            //     'EOU',
            // ],
            // 'streetlight' => [
            //     'High Voltage',
            //     'Low Voltage',
            //     'Net Metering',
            //     'REC',
            // ],
            'power' => [
                'Temporary Residential',
                'Temporary Commercial',
            ],
            'city_offices' => [
                'High Voltage',
                'Low Voltage',
                'Net Metering',
                'REC',
                'EOU',
            ],
            'city_streetlights' => [
                'High Voltage',
                'Low Voltage',
                'Net Metering',
                'REC',
            ],
            'other_government' => [
                'High Voltage',
                'Low Voltage',
                'Net Metering',
                'REC',
                'EOU',
            ],
        ];

        // Clear existing records to avoid duplicates when re-seeding
        CustomerType::truncate();

        foreach($customerTypes as $rateClass => $types) {
            foreach($types as $ctype) {
                CustomerType::create([
                    'rate_class' => Str::slug($rateClass, '_'),
                    'customer_type' => Str::slug($ctype, '_'),
                ]);
            }
        }

    }
}