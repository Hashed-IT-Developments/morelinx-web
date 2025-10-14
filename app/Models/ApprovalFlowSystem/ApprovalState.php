<?php

namespace App\Models\ApprovalFlowSystem;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalState extends Model
{
    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'approval_flow_id',
        'current_order',
        'status',
    ];

    protected $casts = [
        'current_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    public function flow(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlow::class, 'approval_flow_id');
    }

    public function approvalRecords(): HasMany
    {
        return $this->hasMany(ApprovalRecord::class);
    }
}