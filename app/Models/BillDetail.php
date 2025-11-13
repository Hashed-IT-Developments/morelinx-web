<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillDetail extends Model
{
    protected $guarded = [];

    public function customerAccount() {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function customerPayables() {
        return $this->hasMany(CustomerPayable::class);
    }
}
