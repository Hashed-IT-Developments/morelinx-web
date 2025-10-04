<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerRelationship extends Model
{
    public $timestamps = false;

    protected $fillable = ['customer_application_id','name','relationship'];

    public function customerApplication() {
        return $this->belongsTo(CustomerApplication::class);
    }
}
