<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationContract extends Model
{
    protected $guarded = [];

    public $casts = [
        'entered_date' => 'datetime',
        'valid_until_1' => 'datetime',
        'valid_until_2' => 'datetime',
    ];

    public function customerApplication(): BelongsTo
    {
        return $this->belongsTo(CustomerApplication::class);
    }
}
