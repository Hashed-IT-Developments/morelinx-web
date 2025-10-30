<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionSeriesUserCounter extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'transaction_series_user_counters';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transaction_series_id',
        'user_id',
        'start_offset',
        'current_number',
        'last_generated_number',
        'is_auto_assigned',
        'offset_changed_at',
        'generations_at_current_offset',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_auto_assigned' => 'boolean',
        'start_offset' => 'integer',
        'current_number' => 'integer',
        'last_generated_number' => 'integer',
        'generations_at_current_offset' => 'integer',
        'offset_changed_at' => 'datetime',
    ];

    /**
     * Get the transaction series this counter belongs to.
     */
    public function transactionSeries(): BelongsTo
    {
        return $this->belongsTo(TransactionSeries::class);
    }

    /**
     * Get the user (cashier) this counter belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate the next OR number for this counter.
     *
     * @return int
     */
    public function getNextOrNumber(): int
    {
        return $this->start_offset + $this->current_number + 1;
    }

    /**
     * Increment the counter.
     *
     * @return void
     */
    public function incrementCounter(): void
    {
        $this->increment('current_number');
        $this->update(['last_generated_number' => $this->getNextOrNumber() - 1]);
    }
}
