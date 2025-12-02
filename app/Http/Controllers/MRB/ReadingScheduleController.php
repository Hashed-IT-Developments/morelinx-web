<?php

namespace App\Http\Controllers\MRB;

use App\Enums\AccountStatusEnum;
use App\Enums\RolesEnum;
use App\Http\Controllers\Controller;
use App\Models\ReadingSchedule;
use App\Models\Route;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReadingScheduleController extends Controller
{
    public function index() {
        $meterReaders = User::role(RolesEnum::METER_READER)->get();
        return inertia('mrb/reading-schedule/index', [
            'meterReaders' => $meterReaders,
        ]);
    }

    public function generateOrFetchReadingSchedules($billing_month) {

        $createdCount = DB::transaction(function () use ($billing_month) {
            $count = 0;
            foreach(Route::get() as $route) {
                $sched = ReadingSchedule::firstOrCreate(
                    [
                        'route_id' => $route->id,
                        'billing_month' => $billing_month,
                    ],
                    [
                        'reading_date' => $route->reading_day_of_month,
                        'active_accounts' => $route->countAccounts(AccountStatusEnum::ACTIVE),
                        'disconnected_accounts' => $route->countAccounts(AccountStatusEnum::DISCONNECTED),
                        'total_accounts' => $route->countAccounts(),
                        'meter_reader_id' => $route->meter_reader_id,
                    ]
                );
                if ($sched->wasRecentlyCreated) {
                    $count++;
                }
            }

            return $count;
        });

        $readingSchedules = ReadingSchedule::with('route.customerAccounts', 'meterReader')
            ->where('billing_month', $billing_month)
            ->get()
            ->sortBy('route.name')
            ->values()
            ->map(function($schedule) {
                return [
                    'id' => $schedule->id,
                    'route' => $schedule->route,
                    'barangay' => $schedule->route->barangay->name,
                    'readingDate' => $schedule->reading_date,
                    'activeAccounts' => $schedule->active_accounts,
                    'disconnectedAccounts' => $schedule->disconnected_accounts,
                    'totalAccounts' => $schedule->total_accounts,
                    'meterReader' =>$schedule->meter_reader_id,
                ];
            });

        if($createdCount > 0) {
            return response()->json([
                'message' => "Successfully created {$createdCount} reading schedules.",
                'reading_schedules' => $readingSchedules,
            ]);
        }else {
            return response()->json([
                'message' => 'The reading schedules for this month already exist. You are now viewing the existing schedules.',
                'reading_schedules' => $readingSchedules,
            ]);
        }
    }

    public function customerAccountsInRoute(Route $route) {
        return response()->json([
            'customerAccounts' => $route->customerAccounts->map(function($account) {
                return [
                    'id' => $account->id,
                    'account_name' => $account->account_name,
                    'account_number' => $account->account_number,
                    'account_status' => $account->account_status,
                    'previousKWH' => $account->latest_reading_date ? $account->readings()->latest('reading_date')->first()->kwh_reading : 0,
                ];
            }),
        ]);
    }

    public function updateMeterReaderApi(ReadingSchedule $readingSchedule)
    {
        $data = request()->validate([
            'meter_reader_id' => 'required|exists:users,id',
        ]);

        $readingSchedule->meter_reader_id = $data['meter_reader_id'];
        $readingSchedule->save();

        return response()->json([
            'message' => 'Meter reader updated successfully.',
            'reading_schedule' => $readingSchedule,
        ]);
    }
}
