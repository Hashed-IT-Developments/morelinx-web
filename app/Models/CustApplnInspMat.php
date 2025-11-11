<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustApplnInspMat extends Model
{
    use HasFactory;

    protected $table = 'cust_app_insp_mats';

    protected $guarded = [];

    public $appends = ['total_amount'];

    public function customerApplicationInspection() {
        return $this->belongsTo(CustApplnInspection::class);
    }

    public function getTotalAmountAttribute() {
        return $this->quantity * $this->amount;
    }

    public function materialItem()
    {
        return $this->belongsTo(MaterialItem::class);
    }
}
