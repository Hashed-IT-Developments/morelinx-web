<?php

namespace Database\Seeders;

use App\Models\CustomerType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
            'government' => [
                'High Voltage',
                'Low Voltage',
                'Net Metering',
                'REC',
                'EOU',
            ],
            'streetlight' => [
                'High Voltage',
                'Low Voltage',
                'Net Metering',
                'REC',
            ]
        ];

        foreach($customerTypes as $rateClass=>$customerTypes) {
            foreach($customerTypes as $ctype) {
                CustomerType::create([
                    'rate_class' => $rateClass,
                    'customer_type' => $ctype
                ]);
            }
        }

    }
}
