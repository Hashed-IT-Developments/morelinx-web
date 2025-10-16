<?php

namespace App\Http\Controllers\Amendments;

use App\Http\Controllers\Controller;
use App\Models\AmendmentRequest;
use App\Models\AmendmentRequestItem;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AmendmentRequestController extends Controller
{

    public function index() {

        $pendingCount = AmendmentRequest::where('approved_at', null)->where('rejected_at', null)->count();
        $approvedCount = AmendmentRequest::whereNotNull('approved_at')->count();
        $rejectedCount = AmendmentRequest::whereNotNull('rejected_at')->count();

        $amendmentRequests = AmendmentRequest::with('customerApplication')
                ->with('customerApplication.customerType')
                ->with('user')
                ->with('amendmentRequestItems')
                ->orderBy('created_at','DESC')
                ->paginate();

        return inertia('cms/applications/amendments/index',[
            'counts' =>[
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
            ],
            'amendmentRequests' => $amendmentRequests
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
                    'new_data' => $data['content'],
                    'new_data_ref' => $data['display']
                ]);
            }

            return response()->json([
                'message' => 'Customer application amendment has been submitted.'
            ]);
        });
    }

    public function takeAction(AmendmentRequest $amendmentRequest, $action) {

        return DB::transaction(function () use ($amendmentRequest, $action) {
            if($action==="approved") {
                $amendmentRequest->update(['approved_at'=>now()]);

                foreach($amendmentRequest->amendmentRequestItems as $item) {
                    $table = $this->getTable($item->field);
                    DB::table($table)
                        ->update([$item->field=>$item->new_data]);
                }

                return response()->json([
                    'message' => 'The amendment has been approved!'
                ]);
            }else {
                $amendmentRequest->update(['rejected_at'=>now()]);
                return response()->json([
                    'message' => 'The amendment has been rejected!'
                ]);
            }
        });
    }

    private function getTable($field) {

        $caBillInfoFields = [
            'customer_application_id',
            'barangay_id',
            'subdivision',
            'unit_no',
            'street',
            'building',
            'delivery_mode',
        ];

        if (in_array($field, $caBillInfoFields)) {
            return 'ca_bill_infos';
        }

        //for now
        return 'customer_applications';
    }

}
