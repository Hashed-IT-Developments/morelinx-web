<?php

namespace App\Models\Traits;

use App\Models\ApprovalFlowSystem\ApprovalRecord;
use App\Models\ApprovalFlowSystem\ApprovalState;
use App\Services\ApprovalFlowService;
use App\Contracts\RequiresApprovalFlow;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Exception;

trait HasApprovalFlow
{
    public function approvalState()
    {
        return $this->morphOne(ApprovalState::class, 'approvable');
    }

    public function approvals()
    {
        return $this->morphMany(ApprovalRecord::class, 'approvable');
    }

    /**
     * Scope to get items visible to a specific user based on approval state
     */
    public function scopeVisibleToUser(Builder $query, $user)
    {
        return $query->whereHas('approvalState', function ($q) use ($user) {
            $q->where('status', 'pending')
              ->whereHas('flow.steps', function ($stepQuery) use ($user) {
                  $stepQuery->whereColumn('approval_flow_steps.order', 'approval_states.current_order')
                           ->where(function ($assignmentQuery) use ($user) {
                               // User is specifically assigned to this step
                               $assignmentQuery->where('user_id', $user->id)
                                              // Or user has the required role
                                              ->orWhereHas('role', function ($roleQuery) use ($user) {
                                                  $roleQuery->whereIn('id', $user->roles->pluck('id'));
                                              });
                           });
              });
        });
    }

    /**
     * Scope to get items pending approval
     */
    public function scopePendingApproval(Builder $query)
    {
        return $query->whereHas('approvalState', function ($q) {
            $q->where('status', 'pending');
        });
    }

    /**
     * Scope to get approved items
     */
    public function scopeApproved(Builder $query)
    {
        return $query->whereHas('approvalState', function ($q) {
            $q->where('status', 'approved');
        });
    }

    /**
     * Scope to get rejected items
     */
    public function scopeRejected(Builder $query)
    {
        return $query->whereHas('approvalState', function ($q) {
            $q->where('status', 'rejected');
        });
    }

    /**
     * Scope to get items at a specific approval step
     */
    public function scopeAtApprovalStep(Builder $query, int $step)
    {
        return $query->whereHas('approvalState', function ($q) use ($step) {
            $q->where('current_order', $step)
              ->where('status', 'pending');
        });
    }

    /**
     * Scope to get items for a specific role approval
     */
    public function scopeForRoleApproval(Builder $query, string $roleName)
    {
        return $query->whereHas('approvalState', function ($q) use ($roleName) {
            $q->where('status', 'pending')
              ->whereHas('flow.steps', function ($stepQuery) use ($roleName) {
                  $stepQuery->whereColumn('approval_flow_steps.order', 'approval_states.current_order')
                           ->whereHas('role', function ($roleQuery) use ($roleName) {
                               $roleQuery->where('name', $roleName);
                           });
              });
        });
    }

    /**
     * Initialize approval flow for this model
     */
    public function initializeApprovalFlow(string $module, ?int $departmentId = null): ApprovalState
    {
        $service = app(ApprovalFlowService::class);
        return $service->initializeApprovalFlow($this, $module, $departmentId);
    }

    /**
     * Boot the trait and automatically set up approval flow initialization
     */
    protected static function bootHasApprovalFlow()
    {
        // Automatically initialize approval flow for models that implement RequiresApprovalFlow
        static::created(function ($model) {
            // Ensure model implements the required interface and uses this trait
            if ($model instanceof RequiresApprovalFlow && 
                $model instanceof \Illuminate\Database\Eloquent\Model &&
                in_array(HasApprovalFlow::class, class_uses_recursive($model))) {
                
                // Check if approval flow should be initialized
                if ($model->shouldInitializeApprovalFlow()) {
                    try {
                        $service = app(ApprovalFlowService::class);
                        $service->initializeApprovalFlow(
                            $model,
                            $model->getApprovalModule(),
                            $model->getApprovalDepartmentId()
                        );
                    } catch (Exception $e) {
                        // Log the error but don't fail the creation
                        Log::warning("Failed to initialize approval flow for " . get_class($model) . " ID {$model->getKey()}: " . $e->getMessage());
                    }
                }
            }
        });
    }

    /**
     * Approve current step
     */
    public function approve($approver, ?string $remarks = null): bool
    {
        $service = app(ApprovalFlowService::class);
        return $service->approve($this, $approver, $remarks);
    }

    /**
     * Reject current step
     */
    public function reject($approver, string $remarks): bool
    {
        $service = app(ApprovalFlowService::class);
        return $service->reject($this, $approver, $remarks);
    }

    /**
     * Reset approval flow
     */
    public function resetApprovalFlow(): bool
    {
        $service = app(ApprovalFlowService::class);
        return $service->resetApprovalFlow($this);
    }

    /**
     * Get approval history
     */
    public function getApprovalHistory()
    {
        $service = app(ApprovalFlowService::class);
        return $service->getApprovalHistory($this);
    }

    /**
     * Get current step information
     */
    public function getCurrentStepInfo(): ?array
    {
        $service = app(ApprovalFlowService::class);
        return $service->getCurrentStepInfo($this);
    }

    /**
     * Check if approval is complete
     */
    public function isApprovalComplete(): bool
    {
        $service = app(ApprovalFlowService::class);
        return $service->isApprovalComplete($this);
    }

    /**
     * Check if approval is rejected
     */
    public function isApprovalRejected(): bool
    {
        $service = app(ApprovalFlowService::class);
        return $service->isApprovalRejected($this);
    }

    /**
     * Check if approval is pending
     */
    public function isApprovalPending(): bool
    {
        $service = app(ApprovalFlowService::class);
        return $service->isApprovalPending($this);
    }

    /**
     * Get approval progress percentage
     */
    public function getApprovalProgress(): int
    {
        $service = app(ApprovalFlowService::class);
        return $service->getApprovalProgress($this);
    }

    /**
     * Get approval status text
     */
    public function getApprovalStatusText(): string
    {
        if ($this->isApprovalComplete()) {
            return 'Approved';
        }

        if ($this->isApprovalRejected()) {
            return 'Rejected';
        }

        if ($this->isApprovalPending()) {
            $stepInfo = $this->getCurrentStepInfo();
            if ($stepInfo) {
                return "Pending approval from {$stepInfo['assigned_to']} (Step {$stepInfo['order']}/{$stepInfo['total_steps']})";
            }
            return 'Pending approval';
        }

        return 'No approval required';
    }

    /**
     * Check if user can approve current step
     */
    public function canUserApprove($user): bool
    {
        if (!$this->isApprovalPending()) {
            return false;
        }

        $approvalState = $this->approvalState;
        if (!$approvalState) {
            return false;
        }

        $currentStep = $approvalState->flow->steps()
            ->where('order', $approvalState->current_order)
            ->first();

        if (!$currentStep) {
            return false;
        }

        $service = app(ApprovalFlowService::class);
        return $service->canUserApproveStep($user, $currentStep);
    }

    public function scopeVisibleTo($query, $user)
    {
        $roleOrder = match (true) {
            $user->hasRole('Manager') => 0,
            $user->hasRole('Admin') => 1,
            $user->hasRole('SuperAdmin') => 2,
            default => null,
        };

        if (is_null($roleOrder)) {
            return $query->whereRaw('1 = 0'); // hide all
        }

        return $query->whereHas('approvalState', function ($q) use ($roleOrder) {
            $q->where('current_order', $roleOrder)
              ->where('status', 'pending');
        });
    }
}