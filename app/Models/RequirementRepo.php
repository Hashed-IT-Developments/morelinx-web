<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequirementRepo extends Model
{
    protected $fillable = ['requirement','du'];

    public $timestamps = false;
}
