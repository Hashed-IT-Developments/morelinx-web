<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerApplicationInspectionController;
use App\Http\Controllers\Api\CustomerEnergizationController;
use App\Http\Controllers\Api\MaterialItemController;
use App\Http\Controllers\Api\MeterController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\TownController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/towns', [TownController::class, 'apiGet'])->name('api.towns');
    Route::get('/barangays/{town}', [BarangayController::class, 'apiGet'])->name('api.barangays');
});


Route::middleware('auth:sanctum')->as('api.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'me']);

    Route::apiResource('/inspections', CustomerApplicationInspectionController::class);

    Route::apiResource('/materials', MaterialItemController::class);

    Route::apiResource('/tickets', TicketController::class)->except(['destroy', 'store']);

    Route::apiResource('/customer-energizations', CustomerEnergizationController::class);
    Route::post('/customer-energizations/{customerEnergization}/download', [CustomerEnergizationController::class, 'downloaded']);

    Route::apiResource('/meters', MeterController::class);
});



use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

Route::post('/sso', function (Request $request) {
    Log::info('SSO token generation requested', [
        'ip' => $request->ip(),
        'email' => $request->input('email'),
        'branch_id' => $request->input('branch_id')
    ]);
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'branch_id' => 'required'
    ]);

  
    if ($request->branch_id != env('BRANCH_ID')) {
        return response()->json(['error' => 'Invalid branch'], 403);
    }

  
    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    $token = $user->createToken('sso-token', ['*'], now()->addMinutes(5))->plainTextToken;

    Log::info('SSO API token generated', [
        'user_id' => $user->id,
        'email' => $user->email
    ]);

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name
        ]
    ]);
})->middleware('throttle:10,1');



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});


