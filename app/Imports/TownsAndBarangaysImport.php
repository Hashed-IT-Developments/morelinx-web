<?php

namespace App\Imports;

use App\Models\Barangay;
use App\Models\Town;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Exception;

class TownsAndBarangaysImport implements ToCollection, WithHeadingRow
{
    /**
    * @param Collection $rows
    */
    public function collection(Collection $rows)
    {
        $currentTown = null;
        $duTag = config('app.du_tag');

        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                $townName = $row['town_name'];
                $feeder = $row['feeder'];
                $barangayName = $row['barangay_name'];

                if (!empty($townName)) {
                    $currentTown = Town::firstOrCreate(
                        ['name' => $townName, 'du_tag' => $duTag],
                        ['feeder' => $feeder ?? 'N/A']
                    );

                    if (!$currentTown->wasRecentlyCreated && !empty($feeder)) {
                         $currentTown->feeder = $feeder;
                         $currentTown->save();
                    }
                }

                if ($currentTown && !empty($barangayName)) {
                    Barangay::firstOrCreate(
                        ['name' => $barangayName, 'town_id' => $currentTown->id]
                    );
                }
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Import failed: ' . $e->getMessage());
        }
    }
}
