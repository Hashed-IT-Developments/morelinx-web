<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillDetail extends Model
{
    protected $guarded = [];

    public function customerAccount() {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function customerPayables() {
        return $this->hasMany(CustomerPayable::class);
    }

    public function reading(): BelongsTo {
        return $this->belongsTo(Reading::class);
    }
}
