<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CauseOfDelay extends Model
{
    protected $table = 'cause_of_delays';

    protected $fillable = [
        'customer_application_id',
        'delay_source',
        'process',
        'remarks',
        'user_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function customerApplication(): BelongsTo
    {
        return $this->belongsTo(CustomerApplication::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
