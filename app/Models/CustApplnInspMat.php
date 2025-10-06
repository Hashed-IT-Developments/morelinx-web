<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustApplnInspMat extends Model
{
    protected $guarded = [];

    public $appends = ['total_amount'];

    public function customerApplicationInspection() {
        return $this->belongsTo(CustApplnInspection::class);
    }

    public function getTotalAmountAttribute() {
        return $this->quantity * $this->amount;
    }
}
