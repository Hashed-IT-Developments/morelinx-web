<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $guarded = [];


    public function details()
    {
        return $this->hasOne(TicketDetails::class);

    }

    public function cust_information()
    {
        return $this->hasOne(TicketCustInformation::class);

    }


    public function assigned_users()
    {
        return $this->hasMany(TicketUser::class);
    }


    public function assign_by(){
        return $this->belongsTo(User::class, 'assigned_by_id');
    }
}
