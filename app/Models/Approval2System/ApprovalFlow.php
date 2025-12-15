<?php

namespace App\Models\Approval2System;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalFlow extends Model
{
    protected $guarded = [];

    public function approvalSteps(): HasMany {
        return $this->hasMany(ApprovalStep::class);
    }
}
