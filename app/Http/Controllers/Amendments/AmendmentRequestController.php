<?php

namespace App\Http\Controllers\Amendments;

use App\Http\Controllers\Controller;
use App\Models\AmendmentRequest;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AmendmentRequestController extends Controller
{

    public function index() {

        $pendingCount = AmendmentRequest::where('approved_at', null)->where('rejected_at', null)->count();
        $approvedCount = AmendmentRequest::whereNotNull('approved_at')->count();
        $rejectedCount = AmendmentRequest::whereNotNull('rejected_at')->count();

        return inertia('cms/applications/amendments/index',[
            'counts' =>[
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
            ]
        ]);
    }

    public function store(Request $request, CustomerApplication $customerApplication) {

        return DB::transaction(function () use($request, $customerApplication) {

            $amendmentRequest = AmendmentRequest::create([
                'user_id' => auth()->user()->id,
                'customer_application_id' => $customerApplication->id,
            ]);

            foreach($request->data as $data) {
                $amendmentRequest->amendmentRequestItems()->create([
                    'field' => $data['field'],
                    'current_data' => $data['currentData'],
                    'new_data' => $data['content']
                ]);
            }

            return response()->json([
                'message' => 'Customer application amendment has been submitted.'
            ]);
        });
    }
}
