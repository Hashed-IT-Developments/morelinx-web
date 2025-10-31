<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrNumberGeneration extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'or_number_generations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transaction_series_id',
        'or_number',
        'actual_number',
        'generated_by_user_id',
        'generated_at',
        'generation_method',
        'status',
        'transaction_id',
        'used_at',
        'voided_at',
        'voided_by_user_id',
        'void_reason',
        'notes',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'generated_at' => 'datetime',
        'used_at' => 'datetime',
        'voided_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the transaction series this OR belongs to.
     */
    public function transactionSeries(): BelongsTo
    {
        return $this->belongsTo(TransactionSeries::class);
    }

    /**
     * Get the user who generated this OR number.
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    /**
     * Get the user who voided this OR number (if applicable).
     */
    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by_user_id');
    }

    /**
     * Get the transaction associated with this OR number.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Scope a query to only include used OR numbers.
     */
    public function scopeUsed($query)
    {
        return $query->where('status', 'used');
    }

    /**
     * Scope a query to only include generated (unused) OR numbers.
     */
    public function scopeGenerated($query)
    {
        return $query->where('status', 'generated');
    }

    /**
     * Scope a query to only include voided OR numbers.
     */
    public function scopeVoided($query)
    {
        return $query->where('status', 'voided');
    }
}
