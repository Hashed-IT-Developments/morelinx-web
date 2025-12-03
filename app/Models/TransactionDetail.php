<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransactionDetail extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'transaction_id',
        'transaction',
        'amount',
        'unit',
        'quantity',
        'total_amount',
        'gl_code',
        'transaction_code',
        'bill_month',
        'ewt',
        'ewt_type',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'quantity' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // Enable timestamps for soft deletes to work properly
    public $timestamps = true;

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
