<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\IOFactory;

class RatesImport implements WithMultipleSheets
{
    protected $billingMonth;
    protected $file;

    public function __construct($billingMonth, $file = null)
    {
        $this->billingMonth = $billingMonth;
        $this->file = $file ?? request()->file('file');
    }

    public function sheets(): array
    {
        $sheets = [];

        // Load spreadsheet only to read sheet names
        $spreadsheet = IOFactory::load($this->file->getRealPath());
        $sheetNames = $spreadsheet->getSheetNames();

        foreach ($sheetNames as $sheetName) {

            // Skip sheets containing "all"
            if (stripos($sheetName, 'all') !== false) {
                continue;
            }

            $sheets[$sheetName] = new RatesSheetImport(
                $this->billingMonth,
                $sheetName
            );
        }

        return $sheets;
    }
}
