<?php

namespace App\Services;

use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\ApprovalFlowSystem\ApprovalState;
use App\Models\ApprovalFlowSystem\ApprovalRecord;
use App\Models\User;
use App\Contracts\RequiresApprovalFlow;
use App\Events\MakeLog;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Exception;

class ApprovalFlowService
{
    /**
     * Initialize approval flow for a model
     */
    public function initializeApprovalFlow(Model $model, string $module, ?int $departmentId = null): ApprovalState
    {
        // Find the appropriate approval flow
        $approvalFlow = ApprovalFlow::where('module', $module)
            ->when($departmentId, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->with('steps')
            ->first();

        if (!$approvalFlow) {
            throw new Exception("No approval flow found for module: {$module}");
        }

        if ($approvalFlow->steps->isEmpty()) {
            throw new Exception("Approval flow has no steps configured");
        }

        // Create approval state
        return ApprovalState::create([
            'approvable_type' => get_class($model),
            'approvable_id' => $model->id,
            'approval_flow_id' => $approvalFlow->id,
            'current_order' => 1, // Start with first step
            'status' => 'pending',
        ]);
    }

    /**
     * Approve current step and move to next step
     */
    public function approve(Model $model, User $approver, ?string $remarks = null): bool
    {
        return DB::transaction(function () use ($model, $approver, $remarks) {
            $approvalState = $model->approvalState;
            
            if (!$approvalState) {
                throw new Exception('No approval state found for this model');
            }

            if ($approvalState->status !== 'pending') {
                throw new Exception('This item is not pending approval');
            }

            // Get current step
            $currentStep = $approvalState->flow->steps()
                ->where('order', $approvalState->current_order)
                ->first();

            if (!$currentStep) {
                throw new Exception('Current approval step not found');
            }

            // Check if user has permission to approve this step
            if (!$this->canUserApproveStep($approver, $currentStep)) {
                throw new Exception('You do not have permission to approve this step');
            }

            // Record the approval
            ApprovalRecord::create([
                'approvable_type' => get_class($model),
                'approvable_id' => $model->id,
                'approval_flow_step_id' => $currentStep->id,
                'approved_by' => $approver->id,
                'status' => 'approved',
                'remarks' => $remarks,
                'approved_at' => now(),
            ]);

            // Check if there are more steps
            $nextStep = $approvalState->flow->steps()
                ->where('order', '>', $approvalState->current_order)
                ->orderBy('order')
                ->first();

            if ($nextStep) {
                // Move to next step
                $approvalState->update([
                    'current_order' => $nextStep->order
                ]);
            } else {
                // All steps completed
                $approvalState->update([
                    'status' => 'approved'
                ]);

                // Update the model status if it implements RequiresApprovalFlow and has status configuration
                if ($model instanceof RequiresApprovalFlow) {
                    // Check if the model has the optional status update methods
                    // These methods are NOT required by the interface - they are completely optional
                    
                    if($model instanceof CustomerApplication){
                        if (method_exists($model, 'getApprovalStatusColumn') && method_exists($model, 'getApprovedStatusValue')) {
                            $statusColumn = $model->getApprovalStatusColumn();
                            
                            // Only update if a valid status column is defined
                            if ($statusColumn) {
                                $approvedValue = $model->getApprovedStatusValue();
                                $model->update([
                                    $statusColumn => $approvedValue
                                ]);
                            }
                        }
                    }

                    // Handle cascade updates for CustApplnInspection -> CustomerApplication
                    if ($model instanceof CustApplnInspection) {
                        $customerApplication = $model->customerApplication;

                        if ($customerApplication && method_exists($customerApplication, 'getFinalApprovedStatusValue')) {
                            $statusColumn = $customerApplication->getApprovalStatusColumn();
                            
                            if ($statusColumn) {
                                $finalStatus = $customerApplication->getFinalApprovedStatusValue();
                                $customerApplication->update([
                                    $statusColumn => $finalStatus
                                ]);
                                
                                // Log inspection approval
                                event(new MakeLog(
                                    'application',
                                    $customerApplication->id,
                                    'Inspection Approved',
                                    'Inspection has been approved from NDOG module.',
                                    $approver->id,
                                ));
                            }
                        }
                    }
                    
                    // Log general approval for customer applications
                    if ($model instanceof CustomerApplication) {
                        event(new MakeLog(
                            'application',
                            $model->id,
                            'Application Approved for Inspection',
                            'Customer application has been approved and is ready for inspection.',
                            $approver->id,
                        ));
                    }

                    return true;
                    // If methods don't exist, approval flow still works normally,
                    // just without automatic status updates
                }
            }

            return true;
        });
    }

    /**
     * Reject the approval
     */
    public function reject(Model $model, User $approver, string $remarks): bool
    {
        return DB::transaction(function () use ($model, $approver, $remarks) {
            $approvalState = $model->approvalState;
            
            if (!$approvalState) {
                throw new Exception('No approval state found for this model');
            }

            if ($approvalState->status !== 'pending') {
                throw new Exception('This item is not pending approval');
            }

            // Get current step
            $currentStep = $approvalState->flow->steps()
                ->where('order', $approvalState->current_order)
                ->first();

            if (!$currentStep) {
                throw new Exception('Current approval step not found');
            }

            // Check if user has permission to reject this step
            if (!$this->canUserApproveStep($approver, $currentStep)) {
                throw new Exception('You do not have permission to reject this step');
            }

            // Record the rejection
            ApprovalRecord::create([
                'approvable_type' => get_class($model),
                'approvable_id' => $model->id,
                'approval_flow_step_id' => $currentStep->id,
                'approved_by' => $approver->id,
                'status' => 'rejected',
                'remarks' => $remarks,
                'approved_at' => now(),
            ]);

            // Mark approval state as rejected
            $approvalState->update([
                'status' => 'rejected'
            ]);

            return true;
        });
    }

    /**
     * Reset approval flow to start from beginning
     */
    public function resetApprovalFlow(Model $model): bool
    {
        return DB::transaction(function () use ($model) {
            $approvalState = $model->approvalState;
            
            if (!$approvalState) {
                throw new Exception('No approval state found for this model');
            }

            // Clear existing approval records
            $model->approvals()->delete();

            // Reset approval state
            $approvalState->update([
                'current_order' => 1,
                'status' => 'pending'
            ]);

            return true;
        });
    }

    /**
     * Check if user can approve the current step
     */
    public function canUserApproveStep(User $user, $step): bool
    {
        // If step has specific user assigned
        if ($step->user_id) {
            return $user->id === $step->user_id;
        }

        // If step has role assigned
        if ($step->role_id) {
            return $user->hasRole($step->role->name);
        }

        return false;
    }

    /**
     * Get pending approvals for a user
     */
    public function getPendingApprovalsForUser(User $user, string|null $modelClass = null)
    {
        $query = ApprovalState::where('status', 'pending')
            ->with(['approvable', 'flow.steps']);

        // Filter by model class if specified
        if ($modelClass) {
            $query->where('approvable_type', $modelClass);
        }

        $approvalStates = $query->get();

        return $approvalStates->filter(function ($approvalState) use ($user) {
            $currentStep = $approvalState->flow->steps
                ->where('order', $approvalState->current_order)
                ->first();

            return $currentStep && $this->canUserApproveStep($user, $currentStep);
        });
    }

    /**
     * Get approval history for a model
     */
    public function getApprovalHistory(Model $model)
    {
        return $model->approvals()
            ->with(['approver', 'approvalFlowStep.role', 'approvalFlowStep.user'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get current approval step information
     */
    public function getCurrentStepInfo(Model $model): ?array
    {
        $approvalState = $model->approvalState;
        
        if (!$approvalState || $approvalState->status !== 'pending') {
            return null;
        }

        $currentStep = $approvalState->flow->steps()
            ->where('order', $approvalState->current_order)
            ->with(['role', 'user'])
            ->first();

        if (!$currentStep) {
            return null;
        }

        return [
            'step' => $currentStep,
            'order' => $currentStep->order,
            'total_steps' => $approvalState->flow->steps->count(),
            'assigned_to' => $currentStep->user ? $currentStep->user->name : $currentStep->role->name,
            'assignment_type' => $currentStep->user ? 'user' : 'role',
        ];
    }

    /**
     * Check if approval flow is complete
     */
    public function isApprovalComplete(Model $model): bool
    {
        $approvalState = $model->approvalState;
        return $approvalState && $approvalState->status === 'approved';
    }

    /**
     * Check if approval flow is rejected
     */
    public function isApprovalRejected(Model $model): bool
    {
        $approvalState = $model->approvalState;
        return $approvalState && $approvalState->status === 'rejected';
    }

    /**
     * Check if approval flow is pending
     */
    public function isApprovalPending(Model $model): bool
    {
        $approvalState = $model->approvalState;
        return $approvalState && $approvalState->status === 'pending';
    }

    /**
     * Get approval progress percentage
     */
    public function getApprovalProgress(Model $model): int
    {
        $approvalState = $model->approvalState;
        
        if (!$approvalState) {
            return 0;
        }

        if ($approvalState->status === 'approved') {
            return 100;
        }

        if ($approvalState->status === 'rejected') {
            return 0;
        }

        $totalSteps = $approvalState->flow->steps->count();
        $completedSteps = $approvalState->current_order - 1;

        return $totalSteps > 0 ? round(($completedSteps / $totalSteps) * 100) : 0;
    }
}