<?php

namespace App\Models\Approval2System;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Approval extends Model
{
    protected $guarded = [];

    public function approvalStep(): BelongsTo {
        return $this->belongsTo(ApprovalStep::class);
    }

    public function approvalComments(): HasMany {
        return $this->hasMany(ApprovalComment::class);
    }
}
