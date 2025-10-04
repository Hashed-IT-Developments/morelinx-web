<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Town extends Model
{
    /** @use HasFactory<\Database\Factories\TownFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['name','district','feeder'];

    public function barangays() {
        return $this->hasMany(Barangay::class);
    }
}
