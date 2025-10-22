<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerPayable extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function customerPayablesDefinitions() {
        return $this->hasMany(CustomerPayablesDefinition::class);
    }
}
