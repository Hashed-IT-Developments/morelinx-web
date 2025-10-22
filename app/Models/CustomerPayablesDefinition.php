<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerPayablesDefinition extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function customerPayable() {
        return $this->belongsTo(CustomerPayable::class, 'customer_payable_id');
    }
}
