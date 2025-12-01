<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Route extends Model
{
    protected $guarded = [];

    public function customerAccounts(): HasMany {
        return $this->hasMany(CustomerAccount::class);
    }

    public function barangay(): BelongsTo {
        return $this->belongsTo(Barangay::class);
    }

    public function meterReader(): HasOne {
        return $this->hasOne(User::class,'id','meter_reader_id');
    }
}
