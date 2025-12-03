<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustApplnInspMat extends Model
{
    use HasFactory;

    protected $table = 'cust_app_insp_mats';

    protected $fillable = [
        'cust_appln_inspection_id',
        'material_name',
        'unit',
        'quantity',
        'amount',
    ];

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
