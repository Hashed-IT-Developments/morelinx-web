<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustApplnInspection extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function customerApplication():BelongsTo {
        return $this->belongsTo(CustomerApplication::class);
    }

    public function inspector():BelongsTo {
        return $this->belongsTo(User::class, 'inspector_id');
    }
}
