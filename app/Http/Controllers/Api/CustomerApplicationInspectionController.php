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
            'success'       => true,
            'data'          => CustomerApplicationInspectionResource::collection($inspections),
            'message'       => 'Inspections retrieved.'
        ]);
    }

    private function processSignature(array $data): array
    {
        if (empty($data['signature'])) {
            return $data;
        }

        $signature = $data['signature'];
        $signatureData = null;

        // Handle data URI or plain base64
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
            'success'   =>  true,
            'data'      =>  new CustomerApplicationInspectionResource($inspection),
            'message'   =>  'Inspection created.',
        ]);
    }

    public function update(UpdateCustomerApplicationInspectionRequest $request, CustApplnInspection $inspection)
    {
        $validated = $request->validated();
        $validated = $this->processSignature($validated);

        if (!$inspection) {
            return response()->json([
                'success' => false,
                'message' => 'Inspection not found.'
            ]);
        }

        $inspection->update($validated);

        return response()->json([
            'success'   =>  true,
            'data'      =>  new CustomerApplicationInspectionResource($inspection->fresh()),
            'message'   =>  'Inspection updated.'
        ]);
    }

    public function updateStatus(UpdateInspectionStatusRequest $request, CustApplnInspection $cust_appln_inspection)
    {
        $cust_appln_inspection->status = $request->status;

        if (in_array($cust_appln_inspection->status, [
            \App\Enums\InspectionStatusEnum::FOR_INSPECTION,
            \App\Enums\InspectionStatusEnum::FOR_INSPECTION_APPROVAL,
            \App\Enums\InspectionStatusEnum::APPROVED,
            \App\Enums\InspectionStatusEnum::REJECTED,

        ])) {
            $cust_appln_inspection->inspection_time = now();
        }

        $cust_appln_inspection->save();

        return response()->json([
            'success'   =>  true,
            'data'      =>  new CustomerApplicationInspectionResource($cust_appln_inspection->fresh()),
            'message'   =>  'Inspection status updated.'
        ]);
    }

    public function show(CustApplnInspection $inspection)
    {
        $inspection = CustApplnInspection::with('customerApplication')
            ->find($inspection->id);

        if (! $inspection) {
            return response()->json(['success' => false, 'message' => 'Inspection not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => new CustomerApplicationInspectionResource($inspection),
            'message' => 'Inspection retrieved.',
        ]);
    }

    public function getByStatus($status)
    {
        if (!InspectionStatusEnum::hasValue($status)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status value.'
            ], 422);
        }

        $inspections = CustApplnInspection::with('customerApplication')
                        ->where('status', $status)
                        ->get();

        return response()->json([
            'success'   => true,
            'data'      => CustomerApplicationInspectionResource::collection($inspections),
            'message'   => "Inspections with status '{$status}' retrieved successfully."
        ]);
    }

    public function getForInspection()
    {
        $inspections = CustApplnInspection::with('customerApplication')
                        ->where('status', InspectionStatusEnum::FOR_INSPECTION)
                        ->get();

        return response()->json([
            'success'   => true,
            'data'      => CustomerApplicationInspectionResource::collection($inspections),
            'message'   => 'Inspections for inspection retrieved successfully.'
        ]);
    }

    public function getForInspectionApproval()
    {
        $inspections = CustApplnInspection::with('customerApplication')
                        ->where('status', InspectionStatusEnum::FOR_INSPECTION_APPROVAL)
                        ->get();

        return response()->json([
            'success'   => true,
            'data'      => CustomerApplicationInspectionResource::collection($inspections),
            'message'   => 'Inspections for inspection approval retrieved successfully.'
        ]);
    }

    public function getPending()
    {
        $inspections = CustApplnInspection::with('customerApplication')
            ->where('status', 'pending')
            ->get();

        return response()->json([
            'success'   => true,
            'data'      => CustomerApplicationInspectionResource::collection($inspections),
            'message'   => 'Pending applications retrieved.'
        ]);
    }

    public function getApproved()
    {
        $inspections = CustApplnInspection::with('customerApplication')
                        ->where('status', InspectionStatusEnum::APPROVED)
                        ->get();

        return response()->json([
            'success'   => true,
            'data'      => CustomerApplicationInspectionResource::collection($inspections),
            'message'   => 'Approved inspections retrieved successfully.'
        ]);
    }

    public function getDisapproved()
    {
        $inspections = CustApplnInspection::with('customerApplication')
                        ->where('status', InspectionStatusEnum::REJECTED)
                        ->get();

        return response()->json([
            'success'   => true,
            'data'      => CustomerApplicationInspectionResource::collection($inspections),
            'message'   => 'Disapproved inspections retrieved successfully.'
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
