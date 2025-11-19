<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AgeingTimelineReportController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $ageingData = $this->calculateAgeingData();

        return inertia('reports/ageing-timeline/index', [
            'ageingData' => $ageingData,
        ]);
    }

    private function calculateAgeingData(): array
    {
        // Define the columns to analyze
        $timelineColumns = [
            'during_application' => 'During Application',
            'forwarded_to_inspector' => 'Forwarded To Inspector',
            'inspection_date' => 'Inspection Date',
            'inspection_uploaded_to_system' => 'Inspection Uploaded',
            'paid_to_cashier' => 'Paid To Cashier',
            'contract_signed' => 'Contract Signed',
            'assigned_to_lineman' => 'Assigned To Lineman',
            'downloaded_to_lineman' => 'Downloaded To Lineman',
            'installed_date' => 'Installed Date',
            'activated' => 'Activated',
        ];

        // Define age ranges in days
        $ageRanges = [
            '30 days' => ['min' => 30, 'max' => 60],
            '60 days' => ['min' => 61, 'max' => 90],
            '90 days' => ['min' => 91, 'max' => 120],
            '120 days' => ['min' => 121, 'max' => 150],
            '150 days' => ['min' => 151, 'max' => 180],
            '180 days' => ['min' => 181, 'max' => 210],
            '210 days' => ['min' => 211, 'max' => 240],
            '240 days' => ['min' => 241, 'max' => 270],
            '270 days' => ['min' => 271, 'max' => 300],
            '300 days' => ['min' => 301, 'max' => 330],
            '330 days' => ['min' => 331, 'max' => 360],
            '360 days' => ['min' => 361, 'max' => 366], // Leap year consideration
            'More than 1 year' => ['min' => 367, 'max' => 999999],
        ];

        $result = [];

        foreach ($ageRanges as $rangeLabel => $range) {
            $rowData = [
                'range' => $rangeLabel,
            ];

            $rowTotal = 0;

            foreach ($timelineColumns as $column => $label) {
                $count = \DB::table('ageing_timelines')
                    ->whereNotNull($column)
                    ->whereRaw("(CURRENT_DATE - {$column}::date) BETWEEN ? AND ?", [
                        $range['min'],
                        $range['max']
                    ])
                    ->count();

                $rowData[$column] = $count;
                $rowTotal += $count;
            }

            $rowData['total'] = $rowTotal;
            $result[] = $rowData;
        }

        $totalRow = ['range' => 'Total'];
        $grandTotal = 0;

        foreach ($timelineColumns as $column => $label) {
            $columnTotal = \DB::table('ageing_timelines')
                ->whereNotNull($column)
                ->whereRaw("(CURRENT_DATE - {$column}::date) >= ?", [30])
                ->count();

            $totalRow[$column] = $columnTotal;
            $grandTotal += $columnTotal;
        }

        $totalRow['total'] = $grandTotal;
        $result[] = $totalRow;

        return $result;
    }
}
