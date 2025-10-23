<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerAccount extends Model
{
    protected $guarded = [];

    public function customerApplication(): BelongsTo {
        return $this->belongsTo(CustomerApplication::class);
    }

    public function barangay(): BelongsTo {
        return $this->belongsTo(Barangay::class);
    }

    public function district(): BelongsTo {
        return $this->belongsTo(District::class);
    }

    public function route(): BelongsTo {
        return $this->belongsTo(Route::class);
    }

    public function customerType(): BelongsTo {
        return $this->belongsTo(CustomerType::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

}
