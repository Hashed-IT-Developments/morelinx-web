<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerEnergization extends Model
{
    use HasFactory;

    protected $guarded = [];

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
        return $this->belongsTo(User::class, 'team_assigned');
    }

    public function teamExecuted()
    {
        return $this->belongsTo(User::class, 'team_executed');
    }
}
