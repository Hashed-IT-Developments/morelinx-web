<?php

namespace App\Models;

use App\CustomerApplicationStatus;
use Illuminate\Database\Eloquent\Model;

class CustomerApplication extends Model
{
    protected $guarded = [];

    public function barangay() {
        return $this->belongsTo(Barangay::class);
    }

    public function customerType() {
        return $this->belongsTo(CustomerType::class);
    }

    public function customerApplicationRequirements() {
        return $this->hasMany(CustomerApplicationRequirement::class);
    }


}
