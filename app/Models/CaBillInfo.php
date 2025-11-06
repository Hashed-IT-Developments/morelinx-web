<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaBillInfo extends Model
{
    /** @use HasFactory<\Database\Factories\CaBillInfoFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'delivery_mode' => 'array',
    ];

    public function customerApplication() {
        return $this->belongsTo(customerApplication::class);
    }

    public function barangay() {
        return $this->belongsTo(Barangay::class);
    }
}
