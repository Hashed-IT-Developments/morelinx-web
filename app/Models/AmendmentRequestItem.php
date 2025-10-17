<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AmendmentRequestItem extends Model
{
    protected $guarded = [];

    public $casts = [
        'created_at' => 'datetime'
    ];

    public function amendmentRequest(): BelongsTo {
        return $this->belongsTo(AmendmentRequest::class);
    }
}
