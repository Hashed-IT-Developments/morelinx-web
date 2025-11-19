<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgeingTimeline extends Model
{
    protected $guarded = [];

    public function customerApplication()
    {
        return $this->belongsTo(CustomerApplication::class);
    }
}
