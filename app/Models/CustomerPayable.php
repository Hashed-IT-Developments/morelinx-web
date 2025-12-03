<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerPayable extends Model
{
    protected $guarded = [];

    public function billDetail() {
        return $this->belongsTo(BillDetail::class);
    }
}
