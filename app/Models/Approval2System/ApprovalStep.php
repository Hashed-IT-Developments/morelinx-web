<?php

namespace App\Models\Approval2System;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalStep extends Model
{
    protected $guarded  = [];

    public function approvals(): HasMany {
        return $this->hasMany(Approval::class);
    }

    public function approvalFlow(): BelongsTo {
        return $this->belongsTo(ApprovalFlow::class);
    }
}
