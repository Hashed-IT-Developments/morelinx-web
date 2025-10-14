<?php

namespace App\Http\Controllers\Api;

use App\Enums\InspectionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerApplicationInspectionResource;
use App\Models\CustApplnInspection;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

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
        $inspections = CustApplnInspection::with('customerApplication')->get();

        return response()->json([
            'success'       => true,
            'data'          => CustomerApplicationInspectionResource::collection($inspections),
            'message'       => 'Inspections retrieved.'
        ]);
    }

    public function show(CustApplnInspection $cust_appln_inspection)
    {
        $inspection = CustApplnInspection::with('customerApplication')
            ->find($cust_appln_inspection->id);

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
                        ->where('status', InspectionStatusEnum::DISAPPROVED)
                        ->get();

        return response()->json([
            'success'   => true,
            'data'      => CustomerApplicationInspectionResource::collection($inspections),
            'message'   => 'Disapproved inspections retrieved successfully.'
        ]);
    }
}
