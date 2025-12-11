<?php

namespace App\Http\Controllers\Api;

use App\Enums\InspectionStatusEnum;
use App\Events\MakeLog;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerApplicationInspectionRequest;
use App\Http\Requests\UpdateCustomerApplicationInspectionRequest;
use App\Http\Resources\CustomerApplicationInspectionResource;
use App\Models\CustApplnInspection;
use App\Models\CustomerAccount;
use App\Models\Payable;
use App\Models\PayablesDefinition;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerApplicationInspectionController extends Controller implements HasMiddleware
{

    public static function middleware()
    {
        return [
            new Middleware('auth:sanctum')
        ];
    }

    public function index()
    {
        $inspections = CustApplnInspection::with([
            'customerApplication.customerType',
            'customerApplication.barangay.town',
            'customerApplication.district'
        ])
            ->where('status', InspectionStatusEnum::FOR_INSPECTION_APPROVAL)
            ->whereHas('inspector')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => CustomerApplicationInspectionResource::collection($inspections),
            'message' => 'Inspections retrieved.'
        ]);
    }

    private function processSignature(array $data): array
    {
        if (empty($data['signature'])) {
            return $data;
        }

        $signature = $data['signature'];
        $signatureData = null;

        if (preg_match('/^data:(.*);base64,(.*)$/', $signature, $matches)) {
            $signatureData = base64_decode($matches[2]);
        } else {
            $signatureData = base64_decode($signature);
        }

        if ($signatureData) {
            $filename = 'signatures/' . Str::uuid() . '.png';
            Storage::disk('public')->put($filename, $signatureData);
            $data['signature'] = $filename;
        }

        return $data;
    }



   public function store(StoreCustomerApplicationInspectionRequest $request)
{
    $validated = $request->validated();
    $validated = $this->processSignature($validated);

    if ($request->hasFile('attachments')) {
        $paths = [];
        foreach ($request->file('attachments') as $file) {
            $paths[] = $file->store('attachments', 'public');
        }
        $validated['attachments'] = $paths;
    }

    
    $inspection = CustApplnInspection::create($validated);
    $inspection->load([
        'customerApplication.customerType',
        'customerApplication.barangay.town',
        'customerApplication.district',
        'materialsUsed'
    ]);

    $customerAccount = CustomerAccount::whereHas('application', function ($query) use ($validated) {
        $query->where('id', $validated['customer_application_id']);
    })->first();

    if (!$customerAccount) {
        return response()->json(['success' => false, 'message' => 'Customer account not found.'], 404);
    }

    return response()->json([
        'success' => true,
        'data'    => new CustomerApplicationInspectionResource($inspection),
        'message' => 'Inspection created.',
    ], 201);
}

    public function update(UpdateCustomerApplicationInspectionRequest $request, CustApplnInspection $inspection)
    {
        $validated = $request->validated();
        $validated = $this->processSignature($validated);
        $validated['inspection_time'] = now();

        Log::info('MEPC Fields in validated data:', [
            'is_mepc' => $validated['is_mepc'] ?? 'NOT SET',
            'pole_number' => $validated['pole_number'] ?? 'NOT SET',
            'meter_brand' => $validated['meter_brand'] ?? 'NOT SET',
            'meter_form' => $validated['meter_form'] ?? 'NOT SET',
            'service_type' => $validated['service_type'] ?? 'NOT SET',
            'type_of_installation' => $validated['type_of_installation'] ?? 'NOT SET',
        ]);
        
        // Extract materials if sent
        $materials = $validated['materials'] ?? [];
        unset($validated['materials']);

        if ($request->hasFile('attachments')) {
            $paths = [];
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('attachments', 'public');
            }
            $validated['attachments'] = $paths;
        }
        
        $inspection->update($validated);
        if (in_array($inspection->status, [
            InspectionStatusEnum::APPROVED,
            InspectionStatusEnum::DISAPPROVED
        ])) {
            $inspection->customerApplication->ageingTimeline()->updateOrCreate([], [
                'inspection_uploaded_to_system' => now()
            ]);
        }

        foreach ($materials as $material) {
            $inspection->materialsUsed()->create([
                'material_item_id' => $material['material_item_id'] ?? null,
                'material_name'    => $material['material_name'],
                'unit'             => $material['unit'] ?? null,
                'quantity'         => $material['quantity'],
                'amount'           => $material['amount'],
            ]);
        }

        //Logging
        $user_id        = auth()->id();
        $user_name      = auth()->user()->name;
        $module_id      = (string) $inspection->customer_application_id;

        //Log Title
        $title = match ($validated['status']) {
            InspectionStatusEnum::APPROVED      =>  'Inspection Approved',
            InspectionStatusEnum::DISAPPROVED   =>  'Inspection Disapproved'
        };

        //Log Description
        $description = match ($validated['status']) {
            InspectionStatusEnum::APPROVED     =>   "Inspection was approved by {$user_name} via Morelinx Pocket.",
            InspectionStatusEnum::DISAPPROVED  =>   "Inspection was disapproved by {$user_name} via Morelinx Pocket.",
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
            'data'    => new CustomerApplicationInspectionResource(
                $inspection->fresh()->load([
                    'customerApplication.customerType',
                    'customerApplication.barangay.town',
                    'customerApplication.district',
                    'materialsUsed'
                ])
            ),
            'message' => 'Inspection status updated.'
        ]);
    }

    public function show(CustApplnInspection $inspection)
    {
        $inspection->load([
            'customerApplication.customerType',
            'customerApplication.barangay.town',
            'customerApplication.district',
            'materialsUsed'
        ]);

        if (! $inspection) {
            return response()->json(['success' => false, 'message' => 'Inspection not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => new CustomerApplicationInspectionResource($inspection),
            'message' => 'Inspection retrieved.',
        ]);
    }

    public function destroy(CustApplnInspection $inspection)
    {
        if ($inspection->signature && Storage::disk('public')->exists($inspection->signature)) {
            try {
                Storage::disk('public')->delete($inspection->signature);
            } catch (\Exception $e) {
                // Log error if needed
            }
        }
        $inspection->delete();
        return response()->json([
            'success' => true,
            'message' => 'Inspection deleted.'
        ]);
    }

    public function getByApplication($application)
    {
        $inspection = CustApplnInspection::where('customer_application_id', $application)
            ->with([
                'inspector:id,name,email',
                'materialsUsed:id,cust_appln_inspection_id,material_name,unit,quantity,amount'
            ])
            ->latest()
            ->first();

        if (!$inspection) {
            return response()->json(null, 404);
        }

        $materialsUsed = $inspection->materialsUsed->map(function ($material) {
            return [
                'id' => $material->id,
                'material_name' => $material->material_name,
                'unit' => $material->unit,
                'quantity' => $material->quantity,
                'amount' => $material->amount,
                'total_amount' => $material->quantity * $material->amount,
            ];
        });

        return response()->json([
            'id' => $inspection->id,
            'customer_application_id' => $inspection->customer_application_id,
            'inspector_id' => $inspection->inspector_id,
            'status' => $inspection->status,
            'house_loc' => $inspection->house_loc,
            'meter_loc' => $inspection->meter_loc,
            'schedule_date' => $inspection->schedule_date,
            'inspection_time' => $inspection->inspection_time,
            'sketch_loc' => $inspection->sketch_loc,
            'near_meter_serial_1' => $inspection->near_meter_serial_1,
            'near_meter_serial_2' => $inspection->near_meter_serial_2,
            'user_id' => $inspection->user_id,
            'feeder' => $inspection->feeder,
            'meter_type' => $inspection->meter_type,
            'service_drop_size' => $inspection->service_drop_size,
            'protection' => $inspection->protection,
            'meter_class' => $inspection->meter_class,
            'connected_load' => $inspection->connected_load,
            'transformer_size' => $inspection->transformer_size,
            'bill_deposit' => $inspection->bill_deposit,
            'material_deposit' => $inspection->material_deposit,
            'total_labor_costs' => $inspection->total_labor_costs,
            'labor_cost' => $inspection->labor_cost,
            'signature' => $inspection->signature,
            'remarks' => $inspection->remarks,

            'is_mepc' => $inspection->is_mepc,
            'pole_number' => $inspection->pole_number,
            'meter_brand' => $inspection->meter_brand,
            'meter_form' => $inspection->meter_form,
            'service_type' => $inspection->service_type,
            'type_of_installation' => $inspection->type_of_installation,
            'attachments' => $inspection->attachments,

            'created_at' => $inspection->created_at,
            'updated_at' => $inspection->updated_at,
            'inspector' => $inspection->inspector ? [
                'id' => $inspection->inspector->id,
                'name' => $inspection->inspector->name,
                'email' => $inspection->inspector->email,
            ] : null,
            'materials_used' => $materialsUsed,
        ]);
    }

    /**
     * Get inspection summary by application ID (for web routes)
     */
    public function summaryByApplication($application)
    {
        $inspection = CustApplnInspection::where('customer_application_id', $application)
            ->with([
                'inspector:id,name,email',
                'materialsUsed:id,cust_appln_inspection_id,material_name,unit,quantity,amount'
            ])
            ->latest()
            ->first();

        if (!$inspection) {
            return response()->json(null, 404);
        }

        $materialsUsed = $inspection->materialsUsed->map(function ($material) {
            return [
                'id' => $material->id,
                'material_name' => $material->material_name,
                'unit' => $material->unit,
                'quantity' => $material->quantity,
                'amount' => $material->amount,
                'total_amount' => $material->quantity * $material->amount,
            ];
        });

        return response()->json([
            'id' => $inspection->id,
            'customer_application_id' => $inspection->customer_application_id,
            'inspector_id' => $inspection->inspector_id,
            'status' => $inspection->status,
            'house_loc' => $inspection->house_loc,
            'meter_loc' => $inspection->meter_loc,
            'schedule_date' => $inspection->schedule_date,
            'inspection_time' => $inspection->inspection_time,
            'sketch_loc' => $inspection->sketch_loc,
            'near_meter_serial_1' => $inspection->near_meter_serial_1,
            'near_meter_serial_2' => $inspection->near_meter_serial_2,
            'user_id' => $inspection->user_id,
            'feeder' => $inspection->feeder,
            'meter_type' => $inspection->meter_type,
            'service_drop_size' => $inspection->service_drop_size,
            'protection' => $inspection->protection,
            'meter_class' => $inspection->meter_class,
            'connected_load' => $inspection->connected_load,
            'transformer_size' => $inspection->transformer_size,
            'bill_deposit' => $inspection->bill_deposit,
            'material_deposit' => $inspection->material_deposit,
            'total_labor_costs' => $inspection->total_labor_costs,
            'labor_cost' => $inspection->labor_cost,
            'signature' => $inspection->signature,
            'remarks' => $inspection->remarks,
            'created_at' => $inspection->created_at,
            'updated_at' => $inspection->updated_at,
            'inspector' => $inspection->inspector ? [
                'id' => $inspection->inspector->id,
                'name' => $inspection->inspector->name,
                'email' => $inspection->inspector->email,
            ] : null,
            'materials_used' => $materialsUsed,
        ]);
    }
}
