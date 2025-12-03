<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgeingTimeline extends Model
{
    protected $guarded = [];

    protected $casts = [
        'downloaded_to_lineman' => 'datetime',
    ];

    public function customerApplication()
    {
        return $this->belongsTo(CustomerApplication::class);
    }
}
