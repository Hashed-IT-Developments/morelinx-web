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

     public function ticket_type()
     {
        return $this->belongsTo(TicketType::class, 'ticket_type_id', 'id');
     }

    public function channel()
    {
        return $this->belongsTo(TicketType::class, 'channel_id', 'id');
    }

     public function actual_finding()
    {
        return $this->belongsTo(TicketType::class, 'actual_findings_id', 'id');
    }
}
