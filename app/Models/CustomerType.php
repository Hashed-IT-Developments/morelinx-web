<?php

namespace App\Models;

use App\RateClass;
use Illuminate\Database\Eloquent\Model;

class CustomerType extends Model
{
    protected $fillable = ['rate_class','customer_type'];

    protected $appends = ['full_text'];

    public $timestamps = false;

    public function getFullTextAttribute() {
        return $this->rate_class . " - " . $this->customer_type;
    }
}
