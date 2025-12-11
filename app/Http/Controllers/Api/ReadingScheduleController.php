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
        $query = ReadingSchedule::query()->with(['route.customerAccounts', 'meterReader']);
        $query->where('meter_reader_id', $request->user()->id);

        if ($request->filled('billing_month')) {
            // Format: YYYY-MM (e.g., 2025-11)
            $date = explode('-', $request->input('billing_month'));
            if (count($date) === 2) {
                $year = (int)$date[0];
                $month = (int)$date[1];
                $query->forBillingMonth($year, $month);
            }
        } elseif ($request->has('year') && $request->has('month')) {
            // Alternative: separate year & month params e.g billing_month=2025-10
            $query->forBillingMonth($request->year, $request->month);
        }

        // if ($request->filled('route_id')) {
        //     $query->where('route_id', $request->input('route_id'));
        // }

        // if ($request->filled('meter_reader_id')) {
        //     $query->where('meter_reader_id', $request->input('meter_reader_id'));
        // }

        $schedules = $query->orderBy('route_id')->get();

        return ReadingScheduleResource::collection($schedules);
    }

    public function show(ReadingSchedule $readingSchedule)
    {
        return new ReadingScheduleResource(
            $readingSchedule->load(['route,customerAccounts', 'meterReader'])
        );
    }
}
