<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $fillable = [
        'type',
        'module_id',
        'module_type',
        'title',
        'description',
        'logged_by_id',
        'attachments'
    ];


    public function user()
    {
        return $this->belongsTo(User::class, 'logged_by_id', 'id');
    }
}
