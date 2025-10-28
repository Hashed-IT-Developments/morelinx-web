<?php

namespace App\Http\Controllers\Api;

use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerApplicationInspectionRequest;
use App\Http\Requests\UpdateCustomerApplicationInspectionRequest;
use App\Http\Requests\UpdateInspectionStatusRequest;
use App\Http\Resources\CustomerApplicationInspectionResource;
use App\Models\CustApplnInspection;
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
        $inspections = CustApplnInspection::with('customerApplication')
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

        // data URI or plain base64
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

        return response()->json([
            'success' => true,
            'data'    => new CustomerApplicationInspectionResource($inspection),
            'message' => 'Inspection created.',
        ], 201);
    }

    public function update(UpdateCustomerApplicationInspectionRequest $request, CustApplnInspection $inspection)
    {
        $validated = $request->validated();

        // run signature processing (may throw ValidationException on invalid)
        $validated = $this->processSignature($validated);

        // Ensure customer_application_id and inspector_id are not updatable
        unset($validated['customer_application_id'], $validated['inspector_id']);

        // If status moved to a final state, ensure inspection_time is set to now()
        if (isset($validated['status']) && in_array($validated['status'], [
            InspectionStatusEnum::APPROVED,
            InspectionStatusEnum::DISAPPROVED,
        ], true)) {
            $validated['inspection_time'] = now();
        }

        // Update allowed fields
        $inspection->update($validated);

        return response()->json([
            'success' => true,
            'data'    => new CustomerApplicationInspectionResource($inspection->fresh()),
            'message' => 'Inspection status updated.'
        ]);
    }

    public function show(CustApplnInspection $inspection)
    {
        $inspection = CustApplnInspection::with('customerApplication')->find($inspection->id);

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
        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.'
            ]);
        }

        // Deletes associated signature file if it exists
        if ($inspection->signature && Storage::disk('public')->exists($inspection->signature)) {
            Storage::disk('public')->delete($inspection->signature);
        }

        $inspection->delete();

        return response()->json([
            'success'   => true,
            'message'   => 'Inspection deleted.'
        ]);
    }
}
