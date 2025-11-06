<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    /** @use HasFactory<\Database\Factories\BarangayFactory> */
    use HasFactory;

    public $timestamps = false;

    public $appends = ['full_text'];

    protected $fillable = ['name','town_id'];

    public function town() {
        return $this->belongsTo(Town::class);
    }

    public function getFullTextAttribute()
    {
        if (! $this->relationLoaded('town')) {
            return $this->name;
        }

        return $this->name . ", " . $this->town?->name;
    }
}
