<?php

namespace App\Http\Controllers\Api;

use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerApplicationInspectionRequest;
use App\Http\Requests\UpdateCustomerApplicationInspectionRequest;
use App\Http\Requests\UpdateInspectionStatusRequest;
use App\Http\Resources\CustomerApplicationInspectionResource;
use App\Models\CaAttachment;
use App\Models\CustApplnInspection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
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

    public function update(UpdateInspectionStatusRequest $request, CustApplnInspection $inspection)
    {
        $newApplicationId = null;

        DB::transaction(function () use ($request, $inspection, &$newApplicationId) {
            $inspection->update([
                'status'            => $request->status,
                'inspection_time'   => now(),
            ]);

            // If inspection is disapproved
            if ($inspection->status === InspectionStatusEnum::DISAPPROVED) {
                $inspection->load([
                    'customerApplication.billInfo',
                    'customerApplication.attachments'
                ]);

                $origApp = $inspection->customerApplication;

                // helper to copy a file on the 'public' disk and return new path
                $copyFile = function (?string $path) {
                    if (!$path) return null;
                    $disk = Storage::disk('public');
                    if (!$disk->exists($path)) return null;

                    $dirname = pathinfo($path, PATHINFO_DIRNAME);
                    $filename = pathinfo($path, PATHINFO_FILENAME);
                    $extension = pathinfo($path, PATHINFO_EXTENSION);
                    $newFilename = $filename . '_' . uniqid() . '.' . $extension;
                    $newPath = ($dirname ? $dirname . '/' : '') . $newFilename;

                    $disk->copy($path, $newPath);

                    return $newPath;
                };

                // Replicate the application and set status
                $newApp = $origApp->replicate();
                $newApp->status = 'for_approval';

                // Copy sketch + thumbnail BEFORE saving to avoid an extra save later
                if (!empty($origApp->sketch_lat_long)) {
                    $newSketchPath = $copyFile($origApp->sketch_lat_long);
                    if ($newSketchPath) {
                        $newApp->sketch_lat_long = $newSketchPath;

                        $origThumb = dirname($origApp->sketch_lat_long) . '/thumb_' . basename($origApp->sketch_lat_long);
                        $copyFile($origThumb); // Copies thumbnail file if it exists
                    }
                }

                // fresh timestamps
                $newApp->created_at = now();
                $newApp->updated_at = now();
                $newApp->save();

                // copy bill info
                if ($origApp->billInfo) {
                    $bill = $origApp->billInfo->replicate();
                    $bill->customer_application_id = $newApp->id;
                    $bill->created_at = now();
                    $bill->updated_at = now();
                    $bill->save();
                }

                // copy attachments and create new CaAttachment records
                foreach ($origApp->attachments as $attachment) {
                    $origPath = $attachment->path;
                    $newPath = $copyFile($origPath);

                    // copy thumbnail if present
                    $origThumb = dirname($origPath) . '/thumb_' . basename($origPath);
                    $copyFile($origThumb);

                    CaAttachment::create([
                        'customer_application_id'   => $newApp->id,
                        'type'                      => $attachment->type,
                        'path'                      => $newPath ?: $attachment->path,
                    ]);
                }

                CustApplnInspection::create([
                    'customer_application_id'   => $newApp->id,
                    'status'                    => InspectionStatusEnum::FOR_INSPECTION(),
                ]);

                $newApplicationId = $newApp->id;
            }
        });

        $responseData = [
            'success'   => true,
            'data'      => new CustomerApplicationInspectionResource($inspection->fresh()),
            'message'   => 'Inspection status updated.',
        ];

        if (!empty($newApplicationId)) {
            $responseData['new_application_id'] = $newApplicationId;
            $responseData['new_application_message'] = 'New application created and pending for approval.';
        }

        return response()->json($responseData);
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
