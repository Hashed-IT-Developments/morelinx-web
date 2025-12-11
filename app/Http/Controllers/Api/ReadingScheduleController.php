<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReadingScheduleResource;
use App\Models\ReadingSchedule;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ReadingScheduleController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('auth:sanctum')
        ];
    }

    public function index(Request $request)
    {
        // Determine billing month
        $billingMonth = $this->resolveBillingMonth($request);

        $schedules = ReadingSchedule::query()
            ->where('meter_reader_id', $request->user()->id)
            ->where('billing_month', $billingMonth)
            ->with([
                'route',
                'meterReader',
                'route.customerAccounts',
                'route.customerAccounts.readings' => function ($q) use ($billingMonth) {
                    $q->where('bill_month', $billingMonth);
                },
            ])
            ->orderBy('route_id')
            ->get();

        return ReadingScheduleResource::collection($schedules);
    }

    private function resolveBillingMonth(Request $request): string
    {
        if ($request->filled('billing_month')) {
            $parts = explode('-', $request->billing_month);
            if (count($parts) === 2) {
                return sprintf('%04d-%02d', (int)$parts[0], (int)$parts[1]);
            }
        }

        if ($request->filled(['year', 'month'])) {
            return sprintf('%04d-%02d', $request->year, $request->month);
        }

        return now()->format('Y-m'); // Default to current month
    }

    public function show(ReadingSchedule $readingSchedule)
    {
        return new ReadingScheduleResource(
            $readingSchedule->load(['route.customerAccounts', 'meterReader'])
        );
    }
}
