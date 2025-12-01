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

        // Extract materials if sent
        $materials = $validated['materials'] ?? [];
        unset($validated['materials']);

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
}
