<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaterialItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'material',
        'cost'
    ];
}
