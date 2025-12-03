<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketCustInformation extends Model
{
    protected $guarded = [];


    public function barangay()
    {
        return $this->belongsTo(Barangay::class, 'barangay_id');
    }

    public function town()
    {
        return $this->belongsTo(Town::class, 'town_id');
    }

    public function account()
    {
        return $this->belongsTo(CustomerAccount::class, 'account_id');
    }

}
