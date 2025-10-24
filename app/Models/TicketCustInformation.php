<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketCustInformation extends Model
{
    protected $guarded = [];


    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangay_id');
    }

    public function town()
    {
        return $this->belongsTo(Town::class, 'town_id');
    }
}
