<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reading extends Model
{
    protected $guarded = [];

    public function readingPhotos() {
        return $this->hasMany(ReadingPhoto::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
