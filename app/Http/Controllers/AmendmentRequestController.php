<?php

namespace App\Http\Controllers;

use App\Models\AmendmentRequest;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AmendmentRequestController extends Controller
{
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
