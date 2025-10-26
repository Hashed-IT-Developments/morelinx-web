<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationContract extends Model
{
    protected $guarded = [];
    public function customerApplication(): BelongsTo
    {
        return $this->belongsTo(CustomerApplication::class);
    }
}
