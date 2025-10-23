<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayablesDefinition extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'payables_definitions';

    protected $fillable = [
        'payable_id',
        'transaction_name',
        'transaction_code',
        'billing_month',
        'quantity',
        'unit',
        'amount',
        'total_amount',
    ];

    protected $casts = [
        'billing_month' => 'date',
        'amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function payable()
    {
        return $this->belongsTo(Payable::class, 'payable_id');
    }
}