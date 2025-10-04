<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustAppInspectionMaterial extends Model
{
    protected $guarded = [];

    public $appends = ['total_amount'];

    public function customerApplicationInspection() {
        return $this->belongsTo(CustomerApplicationInspection::class);
    }

    public function getTotalAmountAttribute() {
        return $this->quantity * $this->amount;
    }
}
