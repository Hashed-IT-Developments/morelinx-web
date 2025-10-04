<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    protected $guarded = [];

    public $timestamps = false;

    public $appends = ['total_amount'];

    public function transaction() {
        return $this->belongsTo(Transaction::class);
    }

    public function getTotalAmountAttribute() {
        return $this->amount * $this->quantity;
    }
}
