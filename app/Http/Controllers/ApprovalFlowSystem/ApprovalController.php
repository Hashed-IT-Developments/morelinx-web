<?php

namespace App\Http\Controllers\ApprovalFlowSystem;

use App\Http\Controllers\Controller;
use App\Enums\RolesEnum;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use App\Services\ApprovalFlowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Exception;

class ApprovalController extends Controller
{
    protected ApprovalFlowService $approvalService;

    public function __construct(ApprovalFlowService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

  
    public function index(Request $request)
    {
        $user = $request->user();
        $modelClass = $request->get('model_class');

        $pendingApprovals = $this->approvalService->getPendingApprovalsForUser($user, $modelClass);
       
        $approvals = $pendingApprovals->map(function ($approvalState) use ($user) {
            $stepInfo = $this->approvalService->getCurrentStepInfo($approvalState->approvable);
            
            
            $modelData = $approvalState->approvable;
            if ($modelData instanceof CustApplnInspection) {
                $modelData->load(['customerApplication.account']);
            } elseif ($modelData instanceof CustomerApplication) {
                $modelData->load('account');
            }
            
            return [
                'id' => $approvalState->id,
                'model_type' => class_basename($approvalState->approvable_type),
                'model_id' => $approvalState->approvable_id,
                'model_data' => $modelData,
                'flow_name' => $approvalState->flow->name,
                'current_step' => $stepInfo,
                'created_at' => $approvalState->created_at,
                'can_approve' => $approvalState->approvable->canUserApprove($user),
            ];
        });

       
        $dashboardData = [
            'pending_count' => $approvals->count(),
            'pending_by_type' => $approvals->groupBy('model_type')->map->count()->toArray(),
            'recent_pending' => $approvals->take(5)->map(function ($approval) {
                return [
                    'id' => $approval['id'],
                    'type' => $approval['model_type'],
                    'flow_name' => $approval['flow_name'],
                    'created_at' => $approval['created_at'],
                    'model_data' => $approval['model_data'],
                ];
            })->values()->toArray(),
        ];

        return inertia('crm/inspections/pending-approvals/index', [
            'approvals' => $approvals->values()->toArray(),
            'dashboardData' => $dashboardData,
            'modelTypes' => $approvals->pluck('model_type')->unique()->values()->toArray(),
        ]);
    }

   
    public function applicationsIndex(Request $request)
    {
        $request->merge(['model_class' => CustomerApplication::class]);
        return $this->index($request);
    }

    public function inspectionsApprovals(Request $request)
    {
        $request->merge(['model_class' => CustApplnInspection::class]);
        return $this->index($request);
    }

    
    public function approve(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'remarks' => 'nullable|string|max:1000',
        ]);

        try {
            $modelClass = $this->getModelClass($request->model_type);
            $model = $modelClass::findOrFail($request->model_id);

            if (!$model->canUserApprove($request->user())) {
                return redirect()->back()->with('error', 'You do not have permission to approve this item.');
            }

            $this->approvalService->approve($model, $request->user(), $request->remarks);

            return redirect()->back()->with('success', 'Item approved successfully.');

        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

   
    public function reject(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
            'remarks' => 'required|string|max:1000',
        ]);

        try {
            $modelClass = $this->getModelClass($request->model_type);
            $model = $modelClass::findOrFail($request->model_id);

            if (!$model->canUserApprove($request->user())) {
                return redirect()->back()->with('error', 'You do not have permission to reject this item.');
            }

            $this->approvalService->reject($model, $request->user(), $request->remarks);

            return redirect()->back()->with('success', 'Item rejected successfully.');

        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

  
    public function reset(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
        ]);

        try {
            $modelClass = $this->getModelClass($request->model_type);
            $model = $modelClass::findOrFail($request->model_id);

         
            if (!$request->user()->hasRole([RolesEnum::SUPERADMIN, RolesEnum::ADMIN])) {
                return redirect()->back()->with('error', 'You do not have permission to reset approval flows.');
            }

            $this->approvalService->resetApprovalFlow($model);

            return redirect()->back()->with('success', 'Approval flow reset successfully.');

        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

   
    public function history(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
        ]);

        try {
            $modelClass = $this->getModelClass($request->model_type);
            $model = $modelClass::findOrFail($request->model_id);

            $history = $this->approvalService->getApprovalHistory($model);

            $formattedHistory = $history->map(function ($record) {
                return [
                    'id' => $record->id,
                    'status' => $record->status,
                    'remarks' => $record->remarks,
                    'approved_at' => $record->approved_at,
                    'approver' => $record->approver->name,
                    'step_info' => [
                        'order' => $record->approvalFlowStep->order,
                        'assigned_to' => $record->approvalFlowStep->user 
                            ? $record->approvalFlowStep->user->name 
                            : $record->approvalFlowStep->role->name,
                        'assignment_type' => $record->approvalFlowStep->user ? 'user' : 'role',
                    ],
                ];
            });

            return inertia('crm/inspections/pending-approvals/history', [
                'history' => $formattedHistory,
                'model' => [
                    'type' => class_basename($model),
                    'id' => $model->id,
                    'title' => $this->getModelTitle($model),
                ],
                'current_status' => $model->getApprovalStatusText(),
                'progress' => $model->getApprovalProgress(),
            ]);

        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

  
    protected function getModelClass(string $modelType): string
    {
        $modelMap = [
            'CustomerApplication' => CustomerApplication::class,
            'CustApplnInspection' => CustApplnInspection::class,
        ];

        if (!isset($modelMap[$modelType])) {
            throw new Exception("Invalid model type: {$modelType}");
        }

        return $modelMap[$modelType];
    }

    
    protected function getModelTitle($model): string
    {
        if ($model instanceof CustomerApplication) {
            $model->load('account');
            $accountName = $model->account?->account_name ?? 'N/A';
            return "{$model->first_name} {$model->last_name} - {$accountName}";
        }

        if ($model instanceof CustApplnInspection) {
            $application = $model->customerApplication;
            if ($application) {
                $application->load('account');
                $accountName = $application->account?->account_name ?? 'N/A';
                return "Inspection - {$application->first_name} {$application->last_name} - {$accountName}";
            }
            return "Inspection #{$model->id}";
        }

        return class_basename($model) . " #{$model->id}";
    }
}