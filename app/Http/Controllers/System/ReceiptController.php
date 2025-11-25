<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;

use function Spatie\LaravelPdf\Support\pdf;

class ReceiptController extends Controller
{
    public function billing()
    {
        $details = config('system.details');

        try {
            $pdfBuilder = pdf()
                ->view('pdfs.receipts.billing', compact('details'))
                ->margins(0, 0, 0, 0)
                ->paperSize(65, 80, 'mm');

            $pdf = $pdfBuilder->getBrowsershot()->pdf();

            return response($pdf, 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="billing.pdf"');
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
