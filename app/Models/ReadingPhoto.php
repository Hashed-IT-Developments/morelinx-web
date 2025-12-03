<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingPhoto extends Model
{
    protected $guarded = [];

    public function reading() {
        return $this->belongsTo(Reading::class);
    }
}
