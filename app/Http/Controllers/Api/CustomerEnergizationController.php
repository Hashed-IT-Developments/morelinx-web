<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerEnergizationRequest;
use App\Http\Requests\UpdateCustomerEnergizationRequest;
use App\Http\Resources\CustomerEnergizationResource;
use App\Models\AgeingTimeline;
use App\Models\CustomerEnergization;
use App\Models\Meter;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
            'customerApplication.barangay.town',
            'customerApplication.district',
            'teamAssigned',
            'teamExecuted'
        ])
        ->where('team_assigned_id', Auth::user()->id)
        ->get();

        return response()->json([
            'success' => true,
            'data'    => CustomerEnergizationResource::collection($customerEnergizations),
            'message' => 'Customer Energizations retrieved.'
        ]);
    }

    public function store(StoreCustomerEnergizationRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('attachments')) {
            $paths = [];
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('attachments', 'public');
            }
            $validated['attachments'] = $paths;
        }

        $customerEnergization = CustomerEnergization::create($validated);

        return response()->json([
            'success' => true,
            'data' => new CustomerEnergizationResource(
                $customerEnergization->load([
                    'customerApplication.customerType',
                    'customerApplication.barangay.town',
                    'customerApplication.district',
                    'teamAssigned',
                    'teamExecuted'
                ])
            ),
            'message' => 'Customer Energization created.'
        ], 201);
    }

    public function show(CustomerEnergization $customerEnergization)
    {
        return response()->json([
            'success' => true,
            'data'    => new CustomerEnergizationResource($customerEnergization->load([
                'customerApplication.customerType',
                'customerApplication.barangay.town',
                'customerApplication.district',
                'teamAssigned',
                'teamExecuted'
            ])),
            'message' => 'Customer Energization retrieved.'
        ]);
    }

    public function update(UpdateCustomerEnergizationRequest $request, CustomerEnergization $customerEnergization)
    {
        $validated = $request->validated();

        if ($request->has('meters')) {

            foreach ($request->input('meters') as $meterData) {
                if (isset($meterData['meter_id'])) {
                    Log::info('Existing meter:', ['meter_id' => $meterData['meter_id']]);
                } else {
                    try {
                        $meter = Meter::create([
                            'customer_application_id' => $customerEnergization->customer_application_id,
                            'meter_serial_number' => $meterData['meter_serial_number'],
                            'meter_brand' => $meterData['meter_brand'] ?? null,
                            'seal_number' => $meterData['seal_number'] ?? null,
                            'erc_seal' => $meterData['erc_seal'] ?? null,
                            'more_seal' => $meterData['more_seal'] ?? null,
                            'multiplier' => $meterData['multiplier'] ?? null,
                            'voltage' => $meterData['voltage'] ?? null,
                            'initial_reading' => $meterData['initial_reading'] ?? null,
                            'type' => $meterData['type'] ?? null,
                        ]);

                        Log::info('Meter created successfully:', ['meter_id' => $meter->id]);
                    } catch (\Exception $e) {
                        Log::error('Error creating meter:', [
                            'error' => $e->getMessage(),
                            'meter_data' => $meterData
                        ]);
                    }
                }
            }
        }

        if ($request->hasFile('attachments')) {
            $paths = [];
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('attachments', 'public');
            }
            $validated['attachments'] = $paths;
        }

        $customerEnergization->update($validated);

        return response()->json([
            'success' => true,
            'data' => new CustomerEnergizationResource($customerEnergization->load([
                'customerApplication.customerType',
                'customerApplication.barangay.town',
                'customerApplication.district',
                'teamAssigned',
                'teamExecuted'
            ])),
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

    public function downloaded(CustomerEnergization $customerEnergization)
    {
        AgeingTimeline::updateOrCreate(
            ['customer_application_id' => $customerEnergization->customer_application_id],
            ['downloaded_to_lineman' => now()]
        );

        return response()->json([
            'success' => true,
            'message' => 'Installation marked as downloaded.'
        ]);
    }
}
