<?php

namespace App\Http\Controllers\Api;

use App\Events\MakeLog;
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

        //Logging
        $user_id    = auth()->id();
        $user_name  = auth()->user()->name;
        $module_id  = (string) $customerEnergization->customer_application_id;

        $title = match ($validated['status']) {
            'completed'     => 'Energization Completed',
            'not_completed' => 'Energization Not Completed',
        };

        $description = match ($validated['status']) {
            'completed'     => "Energization was marked as completed by {$user_name} via Morelinx Pocket.",
            'not_completed' => "Energization was marked as not completed by {$user_name} via Morelinx Pocket.",
        };

        event(new MakeLog(
            'application',
            $module_id,
            $title,
            $description,
            $user_id
        ));

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

    public function getByApplication($application)
    {
        $energization = CustomerEnergization::where('customer_application_id', $application)
            ->with([
                'teamAssigned:id,name,email'
            ])
            ->latest()
            ->first();

        if (!$energization) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $energization->id,
            'customer_application_id' => $energization->customer_application_id,
            'team_assigned_id' => $energization->team_assigned_id,
            'status' => $energization->status,
            'assigned_team' => $energization->teamAssigned ? [
                'id' => $energization->teamAssigned->id,
                'name' => $energization->teamAssigned->name,
                'email' => $energization->teamAssigned->email,
            ] : null,
            'team_executed' => $energization->team_executed,
            'service_connection' => $energization->service_connection,
            'action_taken' => $energization->action_taken,
            'remarks' => $energization->remarks,
            'time_of_arrival' => $energization->time_of_arrival,
            'date_installed' => $energization->date_installed,
            'transformer_owned' => $energization->transformer_owned,
            'transformer_rating' => $energization->transformer_rating,
            'ct_serial_number' => $energization->ct_serial_number,
            'ct_brand_name' => $energization->ct_brand_name,
            'ct_ratio' => $energization->ct_ratio,
            'pt_serial_number' => $energization->pt_serial_number,
            'pt_brand_name' => $energization->pt_brand_name,
            'pt_ratio' => $energization->pt_ratio,
            'archive' => $energization->archive ?? false,
            'attachments' => $energization->attachments,
            'created_at' => $energization->created_at,
            'updated_at' => $energization->updated_at,
        ]);
    }

    /**
     * Get energization summary by application ID (for web routes)
     */
    public function summaryByApplication($application)
    {
        $energization = CustomerEnergization::where('customer_application_id', $application)
            ->with(['teamAssigned:id,name,email'])
            ->latest()
            ->first();

        if (!$energization) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $energization->id,
            'customer_application_id' => $energization->customer_application_id,
            'team_assigned_id' => $energization->team_assigned_id,
            'status' => $energization->status,
            'assigned_team' => $energization->teamAssigned ? [
                'id' => $energization->teamAssigned->id,
                'name' => $energization->teamAssigned->name,
                'email' => $energization->teamAssigned->email,
            ] : null,
            'team_executed' => $energization->team_executed,
            'service_connection' => $energization->service_connection,
            'action_taken' => $energization->action_taken,
            'remarks' => $energization->remarks,
            'time_of_arrival' => $energization->time_of_arrival,
            'date_installed' => $energization->date_installed,
            'transformer_owned' => $energization->transformer_owned,
            'transformer_rating' => $energization->transformer_rating,
            'ct_serial_number' => $energization->ct_serial_number,
            'ct_brand_name' => $energization->ct_brand_name,
            'ct_ratio' => $energization->ct_ratio,
            'pt_serial_number' => $energization->pt_serial_number,
            'pt_brand_name' => $energization->pt_brand_name,
            'pt_ratio' => $energization->pt_ratio,
            'archive' => $energization->archive ?? false,
            'attachments' => $energization->attachments,
            'created_at' => $energization->created_at,
            'updated_at' => $energization->updated_at,
        ]);
    }
}
