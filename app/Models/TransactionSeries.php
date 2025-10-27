<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class TransactionSeries extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'series_name',
        'prefix',
        'current_number',
        'start_number',
        'end_number',
        'format',
        'is_active',
        'effective_from',
        'effective_to',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'current_number' => 'integer',
        'start_number' => 'integer',
        'end_number' => 'integer',
    ];

    /**
     * Get the user who created this series.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all transactions using this series.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope to get only active series.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Scope to get series effective on a given date.
     */
    public function scopeEffectiveOn(Builder $query, $date = null): void
    {
        $date = $date ?? now();
        
        $query->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            });
    }

    /**
     * Check if the series has reached its limit.
     */
    public function hasReachedLimit(): bool
    {
        if ($this->end_number === null) {
            return false;
        }

        return $this->current_number >= $this->end_number;
    }

    /**
     * Get the percentage of numbers used.
     */
    public function getUsagePercentage(): float
    {
        if ($this->end_number === null) {
            return 0;
        }

        $total = $this->end_number - $this->start_number + 1;
        $used = $this->current_number - $this->start_number + 1;

        return ($used / $total) * 100;
    }

    /**
     * Get remaining numbers in this series.
     */
    public function getRemainingNumbers(): ?int
    {
        if ($this->end_number === null) {
            return null;
        }

        return max(0, $this->end_number - $this->current_number);
    }

    /**
     * Check if series is near limit (90% or more used).
     */
    public function isNearLimit(): bool
    {
        if ($this->end_number === null) {
            return false;
        }

        return $this->getUsagePercentage() >= 90;
    }

    /**
     * Format a number according to the series format template.
     * 
     * Format placeholders:
     * {YEAR} - 4-digit year (2025)
     * {MONTH} - 2-digit month (01-12)
     * {NUMBER} or {NUMBER:6} - Number with optional padding
     * {PREFIX} - Series prefix
     */
    public function formatNumber(int $number, $date = null): string
    {
        $date = $date ?? now();
        $format = $this->format;

        // Replace year
        $format = str_replace('{YEAR}', $date->format('Y'), $format);
        
        // Replace month
        $format = str_replace('{MONTH}', $date->format('m'), $format);
        
        // Replace prefix
        if ($this->prefix) {
            $format = str_replace('{PREFIX}', $this->prefix, $format);
        }
        
        // Replace number with optional padding
        if (preg_match('/{NUMBER:(\d+)}/', $format, $matches)) {
            $padding = (int)$matches[1];
            $format = preg_replace('/{NUMBER:\d+}/', str_pad($number, $padding, '0', STR_PAD_LEFT), $format);
        } else {
            $format = str_replace('{NUMBER}', $number, $format);
        }

        return $format;
    }
}
