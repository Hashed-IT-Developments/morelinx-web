<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketDetails extends Model
{
     protected $guarded = [];

     public function concern_type()
     {
         return $this->belongsTo(TicketType::class, 'concern_type_id', 'id');
     }
}
