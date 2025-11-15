<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMeterRequest;
use App\Http\Requests\UpdateMeterRequest;
use App\Http\Resources\MeterResource;
use App\Models\Meter;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MeterController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [new Middleware('auth:sanctum')];
    }


    public function index()
    {
        $meters = Meter::with(['customerApplication.customerType'])->get();

        return response()->json([
            'success' => true,
            'data' => MeterResource::collection($meters),
            'message' => 'Meters retrieved.'
        ]);
    }

    public function store(StoreMeterRequest $request)
    {
        $meter = Meter::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new MeterResource($meter->load(['customerApplication.customerType'])),
            'message' => 'Meter created.'
        ], 201);
    }


    public function show(Meter $meter)
    {
        return response()->json([
            'success' => true,
            'data' => new MeterResource($meter->load(['customerApplication.customerType'])),
            'message' => 'Meter retrieved.'
        ]);
    }

    public function update(UpdateMeterRequest $request, Meter $meter)
    {
        $meter->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new MeterResource($meter->load(['customerApplication.customerType'])),
            'message' => 'Meter updated.'
        ]);
    }

    public function destroy(Meter $meter)
    {
        $meter->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meter deleted.'
        ]);
    }
}
