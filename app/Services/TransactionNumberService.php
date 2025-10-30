<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionSeries;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TransactionNumberService
{
    /**
     * Preview the next OR number without consuming it.
     *
     * @return string The preview OR number
     * @throws Exception if no active series is found
     */
    public function previewNextOrNumber(): string
    {
        $series = $this->getActiveSeries();

        if (!$series) {
            throw new Exception('No active transaction series found. Please contact administrator.');
        }

        // Calculate what the next number will be
        $nextNumber = $series->current_number + 1;

        // If this is the first number, use start_number
        if ($series->current_number == 0) {
            $nextNumber = $series->start_number;
        }

        // Check if it would exceed limit
        if ($series->end_number && $nextNumber > $series->end_number) {
            throw new Exception(
                "Your transaction series has reached its limit. Please contact administrator to extend your range."
            );
        }

        // Format and return the preview (without incrementing counter)
        return $series->formatNumber($nextNumber);
    }

    /**
     * Generate the next OR number from the active series.
     * Uses database locking to ensure thread-safe number generation.
     *
     * @return array ['or_number' => string, 'series_id' => int]
     * @throws Exception if no active series is found or series has reached its limit
     */
    public function generateNextOrNumber(): array
    {
        return DB::transaction(function () {
            // Get the active series with row-level lock (only one series can be active)
            $series = TransactionSeries::active()
                ->lockForUpdate()
                ->first();

            if (!$series) {
                throw new Exception(
                    'No active transaction series found. Please contact administrator to activate a series.'
                );
            }

            // Check if series has reached its limit
            if ($series->hasReachedLimit()) {
                throw new Exception(
                    "Transaction series '{$series->series_name}' has reached its limit ({$series->end_number}). " .
                    "Please contact administrator to extend your range or assign a new series."
                );
            }

            // Increment the counter
            $nextNumber = $series->current_number + 1;

            // If this is the first number, use start_number
            if ($series->current_number == 0) {
                $nextNumber = $series->start_number;
            }

            // Update the series counter
            $series->current_number = $nextNumber;
            $series->save();

            // Format the OR number according to the series format
            $orNumber = $series->formatNumber($nextNumber);

            Log::info('Generated OR number', [
                'or_number' => $orNumber,
                'series_id' => $series->id,
                'series_name' => $series->series_name,
                'counter' => $nextNumber,
            ]);

            return [
                'or_number' => $orNumber,
                'series_id' => $series->id,
            ];
        });
    }

    /**
     * Validate a manual OR number to ensure it's not a duplicate.
     *
     * @param string $orNumber
     * @param int|null $excludeTransactionId Transaction ID to exclude from duplicate check (for updates)
     * @return bool
     */
    public function validateManualOrNumber(string $orNumber, ?int $excludeTransactionId = null): bool
    {
        $query = Transaction::where('or_number', $orNumber);

        if ($excludeTransactionId) {
            $query->where('id', '!=', $excludeTransactionId);
        }

        return !$query->exists();
    }

    /**
     * Create a new transaction series.
     *
     * @param array $data
     * @return TransactionSeries
     * @throws Exception
     */
    public function createSeries(array $data): TransactionSeries
    {
        return DB::transaction(function () use ($data) {
            // Validate and adjust end_number based on format
            if (isset($data['format']) && isset($data['end_number'])) {
                $data['end_number'] = $this->validateEndNumberForFormat($data['format'], $data['end_number']);
            }

            // If creating an active series, deactivate all other series (only one can be active)
            if ($data['is_active'] ?? false) {
                TransactionSeries::where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $series = TransactionSeries::create($data);

            Log::info('Created new transaction series', [
                'series_id' => $series->id,
                'series_name' => $series->series_name,
                'is_active' => $series->is_active,
            ]);

            return $series;
        });
    }

    /**
     * Update an existing transaction series.
     *
     * @param TransactionSeries $series
     * @param array $data
     * @return TransactionSeries
     */
    public function updateSeries(TransactionSeries $series, array $data): TransactionSeries
    {
        return DB::transaction(function () use ($series, $data) {
            // Validate and adjust end_number based on format
            if (isset($data['format']) && isset($data['end_number'])) {
                $data['end_number'] = $this->validateEndNumberForFormat($data['format'], $data['end_number']);
            } elseif (isset($data['format']) && !isset($data['end_number'])) {
                // Format changed but end_number not provided, validate existing end_number
                $data['end_number'] = $this->validateEndNumberForFormat($data['format'], $series->end_number);
            }

            // If activating a series that was previously inactive, deactivate all other series
            if (isset($data['is_active']) && $data['is_active'] && !$series->is_active) {
                TransactionSeries::where('id', '!=', $series->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $series->update($data);

            Log::info('Updated transaction series', [
                'series_id' => $series->id,
                'series_name' => $series->series_name,
                'changes' => $data,
            ]);

            return $series->fresh();
        });
    }

    /**
     * Update the start number for a series.
     *
     * @param TransactionSeries $series
     * @param int $newStartNumber
     * @return TransactionSeries
     */
    public function updateSeriesStartNumber(TransactionSeries $series, int $newStartNumber): TransactionSeries
    {
        // Validate that new start number is within range
        if ($series->end_number && $newStartNumber > $series->end_number) {
            throw new Exception("Start number cannot exceed the series end number ({$series->end_number}).");
        }

        $oldCurrent = $series->current_number;
        $series->current_number = $newStartNumber - 1; // Set to one before desired start
        $series->save();

        Log::info('Updated series start number', [
            'series_id' => $series->id,
            'series_name' => $series->series_name,
            'old_current' => $oldCurrent,
            'new_current' => $series->current_number,
            'next_or_will_be' => $newStartNumber,
        ]);

        return $series;
    }

    /**
     * Activate a specific series (deactivates all other series - only one can be active at a time).
     *
     * @param TransactionSeries $series
     * @return TransactionSeries
     */
    public function activateSeries(TransactionSeries $series): TransactionSeries
    {
        return DB::transaction(function () use ($series) {
            // Deactivate all other series (only one can be active)
            TransactionSeries::where('id', '!=', $series->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            // Activate this series
            $series->is_active = true;
            $series->save();

            Log::info('Activated transaction series', [
                'series_id' => $series->id,
                'series_name' => $series->series_name,
            ]);

            return $series;
        });
    }

    /**
     * Deactivate a specific series.
     *
     * @param TransactionSeries $series
     * @return TransactionSeries
     */
    public function deactivateSeries(TransactionSeries $series): TransactionSeries
    {
        $series->is_active = false;
        $series->save();

        Log::info('Deactivated transaction series', [
            'series_id' => $series->id,
            'series_name' => $series->series_name,
        ]);

        return $series;
    }

    /**
     * Validate and adjust end_number to match the format's number of digits.
     * 
     * @param string $format The format string (e.g., "{PREFIX}{NUMBER:10}")
     * @param int|null $endNumber The proposed end number
     * @return int The validated/adjusted end number
     * @throws Exception if format is invalid
     */
    protected function validateEndNumberForFormat(string $format, ?int $endNumber): int
    {
        // Extract the number of digits from format (e.g., {NUMBER:10} -> 10)
        if (preg_match('/{NUMBER:(\d+)}/', $format, $matches)) {
            $digits = min((int)$matches[1], 12); // Cap at 12 digits max
            $maxNumber = (int)str_repeat('9', $digits); // e.g., 10 digits -> 9999999999
            
            // If end_number exceeds max for this format, cap it
            if ($endNumber && $endNumber > $maxNumber) {
                Log::warning('end_number exceeded format limit', [
                    'format' => $format,
                    'requested_end_number' => $endNumber,
                    'max_allowed' => $maxNumber,
                    'adjusted_to' => $maxNumber,
                ]);
                return $maxNumber;
            }
            
            return $endNumber ?? $maxNumber;
        }
        
        // If no {NUMBER:X} format found, return as-is
        return $endNumber ?? 999999;
    }

    /**
     * Get the currently active series (there should only be one).
     *
     * @return TransactionSeries|null
     */
    public function getActiveSeries(): ?TransactionSeries
    {
        return TransactionSeries::active()->first();
    }

    /**
     * Get series statistics.
     *
     * @param TransactionSeries $series
     * @return array
     */
    public function getSeriesStatistics(TransactionSeries $series): array
    {
        return [
            'id' => $series->id,
            'series_name' => $series->series_name,
            'is_active' => $series->is_active,
            'current_number' => $series->current_number,
            'start_number' => $series->start_number,
            'end_number' => $series->end_number,
            'transactions_count' => $series->transactions()->count(),
            'usage_percentage' => $series->getUsagePercentage(),
            'remaining_numbers' => $series->getRemainingNumbers(),
            'is_near_limit' => $series->isNearLimit(),
            'has_reached_limit' => $series->hasReachedLimit(),
            'effective_from' => $series->effective_from?->format('Y-m-d'),
            'effective_to' => $series->effective_to?->format('Y-m-d'),
        ];
    }

    /**
     * Check if any active series is near its limit (90% or more).
     *
     * @return array|null Series info if near limit, null otherwise
     */
    public function checkSeriesNearLimit(): ?array
    {
        $activeSeries = $this->getActiveSeries();

        if ($activeSeries && $activeSeries->isNearLimit()) {
            return $this->getSeriesStatistics($activeSeries);
        }

        return null;
    }
}
