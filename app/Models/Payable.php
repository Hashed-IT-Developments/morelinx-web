<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payable extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payables';

    protected $fillable = [
        'customer_application_id',
        'customer_payable',
        'total_amount_due',
        'status',
        'amount_paid',
        'balance',
    ];

    protected $casts = [
        'total_amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function customerApplication()
    {
        return $this->belongsTo(CustomerApplication::class);
    }

    public function definitions()
    {
        return $this->hasMany(PayablesDefinition::class, 'payable_id');
    }
}