<?php

namespace App\Http\Controllers\ApprovalFlowSystem;

use App\Http\Controllers\Controller;
use App\Enums\RolesEnum;
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

    /**
     * Get pending approvals for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $modelClass = $request->get('model_class');

        $pendingApprovals = $this->approvalService->getPendingApprovalsForUser($user, $modelClass);

        // Transform the data for frontend
        $approvals = $pendingApprovals->map(function ($approvalState) use ($user) {
            $stepInfo = $this->approvalService->getCurrentStepInfo($approvalState->approvable);
            
            return [
                'id' => $approvalState->id,
                'model_type' => class_basename($approvalState->approvable_type),
                'model_id' => $approvalState->approvable_id,
                'model_data' => $approvalState->approvable,
                'flow_name' => $approvalState->flow->name,
                'current_step' => $stepInfo,
                'created_at' => $approvalState->created_at,
                'can_approve' => $approvalState->approvable->canUserApprove($user),
            ];
        });

        // Get dashboard data
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

        return Inertia::render('approvals/index', [
            'approvals' => $approvals->values()->toArray(),
            'dashboardData' => $dashboardData,
            'modelTypes' => $approvals->pluck('model_type')->unique()->values()->toArray(),
        ]);
    }

    /**
     * Approve an item
     */
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

    /**
     * Reject an item
     */
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

    /**
     * Reset approval flow for an item
     */
    public function reset(Request $request)
    {
        $request->validate([
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
        ]);

        try {
            $modelClass = $this->getModelClass($request->model_type);
            $model = $modelClass::findOrFail($request->model_id);

            // Check if user has permission to reset (you might want to add specific permission check)
            if (!$request->user()->hasRole([RolesEnum::SUPERADMIN, RolesEnum::ADMIN])) {
                return redirect()->back()->with('error', 'You do not have permission to reset approval flows.');
            }

            $this->approvalService->resetApprovalFlow($model);

            return redirect()->back()->with('success', 'Approval flow reset successfully.');

        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get approval history for an item
     */
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

            return Inertia::render('approvals/history', [
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

    /**
     * Get the full model class name from the simple class name
     */
    protected function getModelClass(string $modelType): string
    {
        $modelMap = [
            'CustomerApplication' => \App\Models\CustomerApplication::class,
            'CustApplnInspection' => \App\Models\CustApplnInspection::class,
            // Add other models here as needed
        ];

        if (!isset($modelMap[$modelType])) {
            throw new Exception("Invalid model type: {$modelType}");
        }

        return $modelMap[$modelType];
    }

    /**
     * Get a human-readable title for a model instance
     */
    protected function getModelTitle($model): string
    {
        if ($model instanceof \App\Models\CustomerApplication) {
            return "{$model->first_name} {$model->last_name} - " . ($model->account_number ?? 'N/A');
        }

        return class_basename($model) . " #{$model->id}";
    }
}