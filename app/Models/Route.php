<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Reverb\Loggers\NullLogger;

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

    public function readingSchedules(): HasMany {
        return $this->hasMany(ReadingSchedule::class);
    }

    public function countAccounts($status=null): int {
        if ($status === null) {
            return $this->customerAccounts()->count();
        }
        return $this->customerAccounts()->where('account_status', $status)->count();
    }
}
