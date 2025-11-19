<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerEnergization extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $fillable = [
        'customer_application_id', 
        'team_assigned_id',
        'service_connection',
        'action_taken',
        'remarks',
        'status',
        'time_of_arrival',
        'date_installed',
        'transformer_owned',
        'transformer_rating',
        'ct_serial_number',
        'ct_brand_name',
        'ct_ratio',
        'pt_serial_number',
        'pt_brand_name',
        'pt_ratio',
        'team_executed_id',
        'archive',
    ];

    protected $casts = [
        'time_of_arrival'   => 'datetime',
        'date_installed'    => 'datetime',
        'archive'           => 'boolean',
    ];

    public function customerApplication()
    {
        return $this->belongsTo(CustomerApplication::class);
    }

    public function teamAssigned()
    {
        return $this->belongsTo(User::class, 'team_assigned_id', 'id');
    }

    public function teamExecuted()
    {
        return $this->belongsTo(User::class, 'team_executed_id', 'id');
    }
}
