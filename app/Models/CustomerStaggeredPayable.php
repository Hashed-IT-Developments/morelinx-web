<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerStaggeredPayable extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function module() {
        return $this->morphTo(__FUNCTION__, 'module_name', 'module_id');
    }
}
