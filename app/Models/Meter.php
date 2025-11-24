<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meter extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function customerApplication()
    {
        return $this->belongsTo(CustomerApplication::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($meter) {
            if ($meter->customer_application_id) {
                // Fetch fresh to avoid issues with loaded relationships
                $application = CustomerApplication::find($meter->customer_application_id);
                $meter->customer_account_number = $application?->account_number;
            } else {
                $meter->customer_account_number = null;
            }
        });
    }
}
