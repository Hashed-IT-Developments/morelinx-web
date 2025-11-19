<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerApplicationInspectionRequest;
use App\Http\Requests\StoreCustomerEnergizationRequest;
use App\Http\Requests\UpdateCustomerEnergizationRequest;
use App\Http\Resources\CustomerEnergizationResource;
use App\Models\CustomerEnergization;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpKernel\HttpCache\Store;

class CustomerEnergizationController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('auth:sanctum')
        ];
    }

    public function index()
    {
        $customerEnergizations = CustomerEnergization::with([
            'customerApplication.customerType',
            'teamAssigned',
            'teamExecuted'
        ])
        ->where('team_assigned', auth()->id())
        ->get();

        return response()->json([
            'success' => true,
            'data'    => CustomerEnergizationResource::collection($customerEnergizations),
            'message' => 'Customer Energizations retrieved.'
        ]);
    }

    public function store(StoreCustomerEnergizationRequest $request)
    {
        $customerEnergization = CustomerEnergization::create($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new CustomerEnergizationResource(
                $customerEnergization->load(['customerApplication.customerType', 'teamAssigned', 'teamExecuted'])
            ),
            'message' => 'Customer Energization created.'
        ], 201);
    }

    public function show(CustomerEnergization $customerEnergization)
    {
        return response()->json([
            'success' => true,
            'data'    => new CustomerEnergizationResource($customerEnergization->load(['customerApplication.customerType', 'teamAssigned', 'teamExecuted'])),
            'message' => 'Customer Energization retrieved.'
        ]);
    }

    public function update(UpdateCustomerEnergizationRequest $request, CustomerEnergization $customerEnergization)
    {
        $customerEnergization->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => new CustomerEnergizationResource($customerEnergization->load(['customerApplication.customerType', 'teamAssigned', 'teamExecuted'])),
            'message' => 'Customer Energization updated.'
        ]);
    }

    public function destroy(CustomerEnergization $customerEnergization)
    {
        $customerEnergization->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer Energization deleted.'
        ]);
    }
}
