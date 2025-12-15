<?php

namespace App\Models\Approval2System;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalComment extends Model
{
    protected $guarded  = [];

    public function approval(): BelongsTo {
        return $this->belongsTo(Approval::class);
    }
}
