<?php

namespace App\Http\Controllers\MRB;

use App\Enums\RolesEnum;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Town;
use App\Models\Route;
use App\Models\User;

class MeterReadingController extends Controller
{
    public function routesIndex()
    {
        $townsWithBarangay = Town::orderBy('name')
            ->where('du_tag', config('app.du_tag'))
            ->with('barangays')
            ->get();

        return inertia('mrb/routes',[
            'townsWithBarangay' => $townsWithBarangay,
            'meterReaders' => User::role(RolesEnum::METER_READER)->get(),
        ]);
    }

    public function readingMonitoring()
    {
        // Logic to display reading monitoring
    }

    public function meterReadersIndex()
    {
        // Logic to display meter readers
    }

    public function readingScheduler()
    {
        // Logic to display reading scheduler
    }

    public function getRoutesApi(Request $request)
    {
        $barangayId = $request->query('barangay_id');

        if (!$barangayId) {
            return response()->json(['error' => 'barangay_id parameter is required'], 400);
        }

        $routes = Route::where('barangay_id', $barangayId)
            ->orderBy('name')
            ->get()
            ->map(function ($route) {
                return [
                    'id' => $route->id,
                    'name' => $route->name,
                    'reading_day_of_month' => $route->reading_day_of_month,
                    'active' => $route->customerAccounts()->where('account_status', 'active')->count(),
                    'disconnected' => $route->customerAccounts()->where('account_status', 'disconnected')->count(),
                    'total' => $route->customerAccounts()->count(),
                    'meter_reader_id' => $route->meter_reader_id,
                ];
            });

        return response()->json($routes);
    }

    public function updateMeterReaderApi(Request $request)
    {
        $request->validate([
            'route_id' => 'required|exists:routes,id',
            'meter_reader_id' => 'nullable|exists:users,id',
        ]);

        $route = Route::find($request->input('route_id'));
        $route->meter_reader_id = $request->input('meter_reader_id');
        $route->save();

        return response()->json(['message' => "Meter reader for $route->name was updated successfully"]);
    }
}
