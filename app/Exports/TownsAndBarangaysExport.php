<?php

namespace App\Exports;

use App\Models\Town;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TownsAndBarangaysExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $towns = Town::with('barangays')->orderBy('name')->get();
        $data = collect();
        $townCount = $towns->count();

        foreach ($towns as $index => $town) {
            if ($town->barangays->isEmpty()) {
                $data->push([
                    'town_name' => $town->name,
                    'feeder' => $town->feeder,
                    'barangay_name' => null,
                ]);
            } else {
                $isFirstBarangay = true;
                foreach ($town->barangays as $barangay) {
                    $data->push([
                        'town_name' => $isFirstBarangay ? $town->name : null,
                        'feeder' => $isFirstBarangay ? $town->feeder : null,
                        'barangay_name' => $barangay->name,
                    ]);
                    $isFirstBarangay = false;
                }
            }

            if ($index < $townCount - 1) {
                $data->push([
                    'town_name' => null,
                    'feeder' => null,
                    'barangay_name' => null,
                ]);
            }
        }
        return $data;
    }

    public function headings(): array
    {
        return [
            'town_name',
            'feeder',
            'barangay_name',
        ];
    }
}
