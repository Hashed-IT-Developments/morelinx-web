<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustApplnReq extends Model
{
    protected $fillable = ['customer_application_id', 'requirement_repo_id', 'filepath','complied_at'];
}
