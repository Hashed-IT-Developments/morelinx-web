<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaContactInfo extends Model
{
    /** @use HasFactory<\Database\Factories\CaContactInfoFactory> */
    use HasFactory;

    protected $guarded = [];

    public function customerApplication() {
        return $this->belongsTo(customerApplication::class);
    }
}
