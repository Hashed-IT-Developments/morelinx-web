<?php

namespace App\Http\Controllers\MRB;

use App\Enums\RolesEnum;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\CustomerAccount;
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
                    'barangay_id' => $route->barangay_id,
                    'town_id' => $route->barangay->town_id
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

    public function getNextRouteNameApi($initial) {
        $route = Route::where('name', 'like', $initial . '%')
            ->orderBy('name', 'desc')
            ->first();

        if(!$route) return response()->json(['next_route_name' => $initial . '001']);

        $name = $route->name;
        $numberPart = intval(substr($name, strlen($initial)));
        $nextNumberPart = $numberPart + 1;
        $nextRouteName = $initial . str_pad($nextNumberPart, 3, '0', STR_PAD_LEFT);

        return response()->json(['next_route_name' => $nextRouteName]);
    }

    public function createRouteApi(Request $request) {
        $fields = $request->validate([
            'barangay_id' => 'required|numeric|exists:barangays,id',
            'name' => 'required|string|unique:routes,name',
            'reading_day_of_month' => 'required|numeric|min:1|max:31',
            'meter_reader_id' => 'nullable|numeric|exists:users,id',
        ]);

        $route = Route::create($fields);

        return response()->json([
            'message' => "Route {$route->name} created successfully",
            'route' => $route,
        ]);
    }

    public function updateRouteApi(Route $route, Request $request) {
        $fields = $request->validate([
            'name' => 'string|required',
            'barangay_id' => 'numeric|required|exists:barangays,id',
            'reading_day_of_month' => 'numeric|required|max:31|min:1',
            'meter_reader_id' => 'numeric|required|exists:users,id'
        ]);

        $route->update($fields);

        return response()->json([
            'message' => 'OK'
        ]);
    }

    public function getSingleRouteApi(Route $route) {

        return response()->json([
            'route' => $route,
            'customer_accounts' => CustomerAccount::where('route_id', $route->id)
                    ->orderBy('account_name')
                    ->get()
                    ->map(function($row) {
                        return [
                            'id' => $row->id,
                            'account_name' => $row->account_name,
                            'account_number' => $row->account_number,
                            'account_status' => $row->account_status,
                            'previous_kwh' => '0 for now'
                        ];
                    })
        ]);
    }
}
