<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketMaterial extends Model
{
    protected $guarded = [];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function material_item()
    {
        return $this->belongsTo(MaterialItem::class);
    }
}
