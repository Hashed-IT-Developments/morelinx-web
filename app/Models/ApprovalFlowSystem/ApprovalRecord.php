<?php

namespace App\Models\ApprovalFlowSystem;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class ApprovalRecord extends Model
{
    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'approval_flow_step_id',
        'approved_by',
        'status',
        'remarks',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvalFlowStep(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlowStep::class);
    }
}