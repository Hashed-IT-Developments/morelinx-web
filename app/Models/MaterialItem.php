<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaterialItem extends Model
{
    protected $fillable = [
        'material',
        'cost'
    ];

    public function ticket_materials()
    {
        return $this->hasMany(TicketMaterial::class);
    }
}
