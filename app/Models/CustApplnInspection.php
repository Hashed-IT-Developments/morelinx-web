<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustApplnInspection extends Model
{
    protected $guarded = [];

    public function customerApplication() {
        return $this->belongsTo(CustomerApplication::class);
    }
}
