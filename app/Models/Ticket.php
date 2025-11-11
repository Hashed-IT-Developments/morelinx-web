<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;

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


    public function assigned_department(){
        return $this->belongsTo(Role::class, 'assign_department_id', 'id');
    }


    public function assigned_users()
    {
        return $this->hasMany(TicketUser::class);
    }


    public function assign_by(){
        return $this->belongsTo(User::class, 'assign_by_id');
    }

    public function materials()
    {
        return $this->hasMany(TicketMaterial::class);
    }

    public function logs()
    {
        return $this->hasMany(Log::class, 'module_id', 'id');
    }
}
