<?php

namespace App\Http\Controllers\Amendments;

use App\Http\Controllers\Controller;
use App\Models\AmendmentRequest;
use App\Models\AmendmentRequestItem;
use App\Models\CaBillInfo;
use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AmendmentRequestController extends Controller
{

    public function index() {

        $pendingCount = AmendmentRequest::where('approved_at', null)->where('rejected_at', null)->count();
        $approvedCount = AmendmentRequest::whereNotNull('approved_at')->count();
        $rejectedCount = AmendmentRequest::whereNotNull('rejected_at')->count();

        $amendmentRequests = AmendmentRequest::with('customerAccount.customerType')
                ->with('customerAccount.customerApplication.billInfo')
                ->with('byUser')
                ->with('user')
                ->with('amendmentRequestItems')
                ->orderBy('created_at','DESC')
                ->paginate();

        return inertia('accounts/amendments/index',[
            'counts' =>[
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
            ],
            'amendmentRequests' => $amendmentRequests
        ]);
    }

    public function store(Request $request, CustomerAccount $customerAccount) {

        return DB::transaction(function () use($request, $customerAccount) {

            $amendmentRequest = AmendmentRequest::create([
                'user_id' => Auth::user()->id,
                'customer_account_id' => $customerAccount->id,
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
                foreach($amendmentRequest->amendmentRequestItems as $item) {
                    $table = $this->getTable($item->field);

                    $amendmentRequest->customerAccount->updateOrFail([$item->field=>$item->new_data]);

                    if($table==="ca_bill_infos") {
                        $billInfo = $amendmentRequest->customerAccount->customerApplication->billInfo;

                        if(!$billInfo) {
                            $billInfo = CaBillInfo::create([
                                'customer_application_id' => $amendmentRequest->customerAccount->customer_application_id,
                                'barangay_id' => $amendmentRequest->customerAccount->customerApplication->barangay_id
                            ]);
                        }

                        $billInfo->update([$item->field=>$item->new_data]);
                    }

                }

                $amendmentRequest->update(['approved_at'=>now(),' by_user_id'=>Auth::user()->id]);

                return response()->json([
                    'message' => 'The amendment has been approved!'
                ]);
            }else {
                $amendmentRequest->update(['rejected_at'=>now(), 'by_user_id'=>Auth::user()->id]);
                return response()->json([
                    'message' => 'The amendment has been rejected!'
                ]);
            }

        });
    }

    public function getHistory(CustomerAccount $customerAccount) {
        $data = AmendmentRequest::where('customer_account_id', $customerAccount->id)
            ->with(['amendmentRequestItems','user','byUser'])
            ->orderBy('created_at', 'ASC')
            ->get();

        return response()->json($data);
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

        return 'customer_accounts';
    }

}
